import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth-options"
import JSZip from "jszip"
import { connectToDatabase } from "@/lib/db"
import { ObjectId } from "mongodb"

export async function POST(req: NextRequest, { params }: { params: { videoId: string } }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const videoId = params.videoId
    const { elements } = await req.json()

    // Get video details from database
    const { db } = await connectToDatabase()
    const video = await db.collection("videos").findOne({
      _id: new ObjectId(videoId),
    })

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 })
    }

    // Create a new JSZip instance
    const zip = new JSZip()

    // Add imsmanifest.xml
    const manifestXml = generateScormManifest(video, elements)
    zip.file("imsmanifest.xml", manifestXml)

    // Add index.html
    const indexHtml = generateScormIndex(video, elements)
    zip.file("index.html", indexHtml)

    // Add JavaScript files
    const apiJs = generateScormApi()
    zip.file("scripts/api.js", apiJs)

    const playerJs = generateScormPlayer()
    zip.file("scripts/player.js", playerJs)

    // Add CSS files
    const stylesCss = generateScormStyles()
    zip.file("styles/main.css", stylesCss)

    // Add metadata
    const metadata = {
      videoId: video._id.toString(),
      title: video.title,
      description: video.description,
      duration: video.duration,
      elements: elements,
      exportedAt: new Date().toISOString(),
      exportedBy: session.user.id,
    }

    zip.file("metadata.json", JSON.stringify(metadata, null, 2))

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" })

    // Convert blob to array buffer for NextResponse
    const arrayBuffer = await zipBlob.arrayBuffer()

    // Return the zip file
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="scorm-${videoId}.zip"`,
      },
    })
  } catch (error) {
    console.error("Error generating SCORM package:", error)
    return NextResponse.json({ error: "Failed to generate SCORM package" }, { status: 500 })
  }
}

// Helper functions to generate SCORM content
function generateScormManifest(video: any, elements: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="com.interactivevideoplatform.${video._id}" version="1.0" 
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" 
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" 
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd 
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd 
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="interactive_video_org">
    <organization identifier="interactive_video_org">
      <title>${video.title}</title>
      <item identifier="item_1" identifierref="resource_1">
        <title>${video.title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
      <file href="scripts/api.js"/>
      <file href="scripts/player.js"/>
      <file href="styles/main.css"/>
      <file href="metadata.json"/>
    </resource>
  </resources>
</manifest>`
}

function generateScormIndex(video: any, elements: any[]) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${video.title}</title>
  <link rel="stylesheet" href="styles/main.css">
  <script src="scripts/api.js"></script>
  <script src="scripts/player.js"></script>
</head>
<body>
  <div class="container">
    <h1>${video.title}</h1>
    <div class="video-container">
      <video id="video-player" controls>
        <source src="${video.url}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
      <div id="interactions-container"></div>
    </div>
  </div>
  <script>
    // Initialize the interactive video player
    document.addEventListener('DOMContentLoaded', function() {
      const videoData = ${JSON.stringify({
        videoId: video._id.toString(),
        title: video.title,
        description: video.description,
        duration: video.duration,
        url: video.url,
      })};
      
      const interactiveElements = ${JSON.stringify(elements)};
      
      initializePlayer(videoData, interactiveElements);
    });
  </script>
</body>
</html>`
}

function generateScormApi() {
  return `// SCORM API Implementation
let apiInitialized = false;
let cmi = {
  core: {
    student_id: "",
    student_name: "",
    lesson_location: "",
    lesson_status: "not attempted",
    score: {
      raw: 0,
      min: 0,
      max: 100
    },
    total_time: "0000:00:00.00",
    session_time: "0000:00:00.00",
    exit: ""
  },
  suspend_data: "",
  interactions: []
};

// Initialize the SCORM API
function initializeAPI() {
  if (apiInitialized) return true;
  
  // Find the SCORM API
  const API = findAPI(window);
  
  if (API) {
    // Initialize the connection to the LMS
    if (API.LMSInitialize("")) {
      apiInitialized = true;
      
      // Get initial values from LMS
      cmi.core.student_id = API.LMSGetValue("cmi.core.student_id");
      cmi.core.student_name = API.LMSGetValue("cmi.core.student_name");
      cmi.core.lesson_location = API.LMSGetValue("cmi.core.lesson_location");
      cmi.core.lesson_status = API.LMSGetValue("cmi.core.lesson_status");
      cmi.suspend_data = API.LMSGetValue("cmi.suspend_data");
      
      // Set up event listener for page unload
      window.addEventListener("beforeunload", function() {
        terminateAPI();
      });
      
      return true;
    }
  }
  
  console.warn("SCORM API not found or initialization failed");
  return false;
}

// Find the SCORM API in the parent windows
function findAPI(win) {
  let findAPITries = 0;
  
  while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
    findAPITries++;
    
    if (findAPITries > 7) {
      return null;
    }
    
    win = win.parent;
  }
  
  return win.API;
}

// Terminate the connection to the LMS
function terminateAPI() {
  if (!apiInitialized) return;
  
  const API = findAPI(window);
  
  if (API) {
    // Set final values
    API.LMSSetValue("cmi.core.lesson_status", cmi.core.lesson_status);
    API.LMSSetValue("cmi.core.score.raw", cmi.core.score.raw);
    API.LMSSetValue("cmi.suspend_data", cmi.suspend_data);
    
    // Commit the data
    API.LMSCommit("");
    
    // Terminate the session
    API.LMSFinish("");
    
    apiInitialized = false;
  }
}

// Set a value in the SCORM data model
function setValue(element, value) {
  if (!apiInitialized) return;
  
  const API = findAPI(window);
  
  if (API) {
    API.LMSSetValue(element, value);
    API.LMSCommit("");
  }
}

// Get a value from the SCORM data model
function getValue(element) {
  if (!apiInitialized) return "";
  
  const API = findAPI(window);
  
  if (API) {
    return API.LMSGetValue(element);
  }
  
  return "";
}

// Update the lesson status
function updateLessonStatus(status) {
  cmi.core.lesson_status = status;
  setValue("cmi.core.lesson_status", status);
}

// Update the score
function updateScore(score) {
  cmi.core.score.raw = score;
  setValue("cmi.core.score.raw", score);
}

// Save interaction data
function saveInteraction(id, type, result, studentResponse, correctResponse) {
  if (!apiInitialized) return;
  
  const API = findAPI(window);
  
  if (API) {
    let index = cmi.interactions.length;
    
    API.LMSSetValue(\`cmi.interactions.\${index}.id\`, id);
    API.LMSSetValue(\`cmi.interactions.\${index}.type\`, type);
    API.LMSSetValue(\`cmi.interactions.\${index}.result\`, result);
    API.LMSSetValue(\`cmi.interactions.\${index}.student_response\`, studentResponse);
    API.LMSSetValue(\`cmi.interactions.\${index}.correct_responses.0.pattern\`, correctResponse);
    
    cmi.interactions.push({
      id,
      type,
      result,
      studentResponse,
      correctResponse
    });
    
    API.LMSCommit("");
  }
}

// Save progress data
function saveProgress(data) {
  cmi.suspend_data = JSON.stringify(data);
  setValue("cmi.suspend_data", cmi.suspend_data);
}

// Load progress data
function loadProgress() {
  const data = getValue("cmi.suspend_data");
  
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing suspend data:", error);
    }
  }
  
  return null;
}

// Initialize the API when the page loads
window.addEventListener("load", function() {
  initializeAPI();
});`
}

function generateScormPlayer() {
  return `// Interactive Video Player Implementation
let videoPlayer;
let interactionsContainer;
let currentTime = 0;
let activeInteractions = [];
let completedInteractions = [];
let videoData;
let interactiveElements;

// Initialize the player
function initializePlayer(video, elements) {
  videoData = video;
  interactiveElements = elements;
  
  videoPlayer = document.getElementById('video-player');
  interactionsContainer = document.getElementById('interactions-container');
  
  // Load saved progress if available
  const savedProgress = loadProgress();
  if (savedProgress) {
    currentTime = savedProgress.currentTime || 0;
    completedInteractions = savedProgress.completedInteractions || [];
    
    // Set video to saved position
    videoPlayer.currentTime = currentTime;
  }
  
  // Set up event listeners
  videoPlayer.addEventListener('timeupdate', handleTimeUpdate);
  videoPlayer.addEventListener('play', handlePlay);
  videoPlayer.addEventListener('pause', handlePause);
  videoPlayer.addEventListener('ended', handleEnded);
  
  // Update lesson status
  updateLessonStatus('incomplete');
}

// Handle video time update
function handleTimeUpdate() {
  currentTime = videoPlayer.currentTime;
  
  // Check for interactions at the current time
  checkForInteractions();
  
  // Save progress every 5 seconds
  if (Math.floor(currentTime) % 5 === 0) {
    savePlayerProgress();
  }
}

// Check for interactions at the current time
function checkForInteractions() {
  // Clear active interactions that are no longer in the time range
  activeInteractions = activeInteractions.filter(interaction => {
    let element = interactiveElements.find(e => e.id === interaction.id);
    if (!element) return false;
    
    const isInTimeRange = currentTime >= element.timestamp && 
                          currentTime < element.timestamp + element.duration;
    
    if (!isInTimeRange) {
      // Remove the interaction from the DOM
      let interactionElement = document.getElementById(\`interaction-\${interaction.id}\`);
      if (interactionElement) {
        interactionElement.remove();
      }
      return false;
    }
    
    return true;
  });
  
  // Check for new interactions
  interactiveElements.forEach(element => {
    const isActive = activeInteractions.some(interaction => interaction.id === element.id);
    const isCompleted = completedInteractions.includes(element.id);
    
    if (!isActive && !isCompleted && 
        currentTime >= element.timestamp && 
        currentTime < element.timestamp + element.duration) {
      // Add to active interactions
      activeInteractions.push({
        id: element.id,
        type: element.type
      });
      
      // Display the interaction
      displayInteraction(element);
      
      // Pause the video if required
      if (element.pauseVideo) {
        videoPlayer.pause();
      }
    }
  });
}

// Display an interaction
function displayInteraction(element) {
  let interactionElement = document.createElement('div');
  interactionElement.id = \`interaction-\${element.id}\`;
  interactionElement.className = 'interaction';
  interactionElement.style.position = 'absolute';
  
  // Position the interaction
  if (element.position) {
    interactionElement.style.left = \`\${element.position.x}%\`;
    interactionElement.style.top = \`\${element.position.y}%\`;
  } else {
    interactionElement.style.left = '50%';
    interactionElement.style.top = '50%';
    interactionElement.style.transform = 'translate(-50%, -50%)';
  }
  
  // Apply styles
  if (element.style) {
    Object.entries(element.style).forEach(([key, value]) => {
      interactionElement.style[key] = value;
    });
  }
  
  // Create content based on interaction type
  let content = '';
  
  switch (element.type) {
    case 'quiz':
      content = createQuizInteraction(element);
      break;
    case 'hotspot':
      content = createHotspotInteraction(element);
      break;
    case 'poll':
      content = createPollInteraction(element);
      break;
    default:
      content = \`<div class="interaction-content">
                  <h3>\${element.title}</h3>
                  <p>\${element.description || ''}</p>
                </div>\`;
  }
  
  interactionElement.innerHTML = content;
  interactionsContainer.appendChild(interactionElement);
  
  // Add event listeners to options
  const options = interactionElement.querySelectorAll('.interaction-option');
  options.forEach(option => {
    option.addEventListener('click', function() {
      handleInteractionResponse(element, this.dataset.optionId);
    });
  });
}

// Create quiz interaction content
function createQuizInteraction(element) {
  let content = \`<div class="interaction-content quiz">
                  <h3>\${element.title}</h3>
                  <p>\${element.description || ''}</p>
                  <div class="options">\`;
  
  element.options.forEach((option, index) => {
    content += \`<div class="interaction-option" data-option-id="\${index}">
                  \${option.text}
                </div>\`;
  });
  
  content += \`</div>
              </div>\`;
  
  return content;
}

// Create hotspot interaction content
function createHotspotInteraction(element) {
  return \`<div class="interaction-content hotspot">
            <div class="hotspot-marker" data-option-id="0"></div>
          </div>\`;
}

// Create poll interaction content
function createPollInteraction(element) {
  let content = \`<div class="interaction-content poll">
                  <h3>\${element.title}</h3>
                  <p>\${element.description || ''}</p>
                  <div class="options">\`;
  
  element.options.forEach((option, index) => {
    content += \`<div class="interaction-option" data-option-id="\${index}">
                  \${option.text}
                </div>\`;
  });
  
  content += \`</div>
              </div>\`;
  
  return content;
}

// Handle interaction response
function handleInteractionResponse(element, optionId) {
  const option = element.options[optionId];
  let result = '';
  let score = 0;
  
  // Mark interaction as completed
  completedInteractions.push(element.id);
  
  // Remove from active interactions
  activeInteractions = activeInteractions.filter(interaction => interaction.id !== element.id);
  
  // Handle different interaction types
  switch (element.type) {
    case 'quiz':
      if (option.isCorrect) {
        result = 'correct';
        score = 1;
        
        // Show feedback if available
        if (element.feedback && element.feedback.correct) {
          showFeedback(element.id, element.feedback.correct, true);
        }
      } else {
        result = 'incorrect';
        
        // Show feedback if available
        if (element.feedback && element.feedback.incorrect) {
          showFeedback(element.id, element.feedback.incorrect, false);
        }
      }
      break;
    case 'hotspot':
    case 'poll':
      result = 'neutral';
      score = 1; // Completing any interaction gives a point
      break;
  }
  
  // Save interaction to SCORM
  saveInteraction(
    element.id,
    element.type,
    result,
    optionId.toString(),
    element.type === 'quiz' ? element.options.findIndex(o => o.isCorrect).toString() : ''
  );
  
  // Update score
  updatePlayerScore();
  
  // Save progress
  savePlayerProgress();
  
  // Resume video if not showing feedback
  if (!(element.feedback && (element.feedback.correct || element.feedback.incorrect))) {
    videoPlayer.play();
  }
}

// Show feedback for an interaction
function showFeedback(elementId, feedbackText, isCorrect) {
  let interactionElement = document.getElementById(\`interaction-\${elementId}\`);
  
  if (interactionElement) {
    // Create feedback element
    const feedbackElement = document.createElement('div');
    feedbackElement.className = \`feedback \${isCorrect ? 'correct' : 'incorrect'}\`;
    feedbackElement.innerHTML = \`
      <p>\${feedbackText}</p>
      <button class="continue-button">Continue</button>
    \`;
    
    // Replace interaction content with feedback
    interactionElement.innerHTML = '';
    interactionElement.appendChild(feedbackElement);
    
    // Add event listener to continue button
    const continueButton = feedbackElement.querySelector('.continue-button');
    continueButton.addEventListener('click', function() {
      interactionElement.remove();
      videoPlayer.play();
    });
  }
}

// Update player score
function updatePlayerScore() {
  const totalInteractions = interactiveElements.length;
  const completedCount = completedInteractions.length;
  
  if (totalInteractions > 0) {
    const scorePercentage = Math.round((completedCount / totalInteractions) * 100);
    updateScore(scorePercentage);
  }
}

// Save player progress
function savePlayerProgress() {
  const progress = {
    currentTime,
    completedInteractions
  };
  
  saveProgress(progress);
}

// Handle video play event
function handlePlay() {
  // Update session time
}

// Handle video pause event
function handlePause() {
  // Save progress
  savePlayerProgress();
}

// Handle video ended event
function handleEnded() {
  // Check if all interactions are completed
  const totalInteractions = interactiveElements.length;
  const completedCount = completedInteractions.length;
  
  if (completedCount === totalInteractions) {
    updateLessonStatus('completed');
  } else {
    updateLessonStatus('incomplete');
  }
  
  // Save final progress
  savePlayerProgress();
}`
}

function generateScormStyles() {
  return `/* Main styles */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  font-size: 24px;
  margin-bottom: 20px;
}

/* Video container */
.video-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background-color: #000;
  overflow: hidden;
}

#video-player {
  width: 100%;
  display: block;
}

/* Interactions container */
#interactions-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Interaction styles */
.interaction {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 8px;
  padding: 15px;
  max-width: 80%;
  pointer-events: auto;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.interaction-content {
  text-align: center;
}

.interaction-content h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 18px;
}

.interaction-content p {
  margin-bottom: 15px;
  font-size: 14px;
}

/* Options */
.options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.interaction-option {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.interaction-option:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* Feedback */
.feedback {
  text-align: center;
  padding: 15px;
}

.feedback.correct {
  background-color: rgba(0, 128, 0, 0.2);
  border: 1px solid rgba(0, 128, 0, 0.5);
}

.feedback.incorrect {
  background-color: rgba(255, 0, 0, 0.2);
  border: 1px solid rgba(255, 0, 0, 0.5);
}

.continue-button {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 10px;
  transition: background-color 0.2s;
}

.continue-button:hover {
  background-color: #2563eb;
}

/* Hotspot */
.hotspot-marker {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  border: 2px solid white;
  cursor: pointer;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}`
}

