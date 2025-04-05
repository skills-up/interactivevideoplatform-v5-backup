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

    // Add h5p.json
    const h5pJson = generateH5pJson(video, elements)
    zip.file("h5p.json", h5pJson)

    // Add content.json
    const contentJson = generateContentJson(video, elements)
    zip.file("content/content.json", contentJson)

    // Add main.js
    const mainJs = generateMainJs()
    zip.file("content/scripts/main.js", mainJs)

    // Add styles.css
    const stylesCss = generateStylesCss()
    zip.file("content/styles/styles.css", stylesCss)

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" })

    // Convert blob to array buffer for NextResponse
    const arrayBuffer = await zipBlob.arrayBuffer()

    // Return the zip file
    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="h5p-${videoId}.h5p"`,
      },
    })
  } catch (error) {
    console.error("Error generating H5P package:", error)
    return NextResponse.json({ error: "Failed to generate H5P package" }, { status: 500 })
  }
}

// Helper functions to generate H5P content
function generateH5pJson(video: any, elements: any[]) {
  const h5pData = {
    title: video.title,
    language: "en",
    mainLibrary: "H5P.InteractiveVideo",
    embedTypes: ["div"],
    license: "U",
    author: video.creator?.name || "Unknown",
    preloadedDependencies: [
      {
        machineName: "H5P.InteractiveVideo",
        majorVersion: 1,
        minorVersion: 22,
      },
      {
        machineName: "H5P.Video",
        majorVersion: 1,
        minorVersion: 5,
      },
      {
        machineName: "H5P.QuestionSet",
        majorVersion: 1,
        minorVersion: 17,
      },
    ],
  }

  return JSON.stringify(h5pData, null, 2)
}

function generateContentJson(video: any, elements: any[]) {
  // Convert our interactive elements to H5P format
  const h5pInteractions = elements.map((element) => {
    const baseInteraction = {
      x: element.position?.x ? element.position.x / 100 : 0.5,
      y: element.position?.y ? element.position.y / 100 : 0.5,
      duration: {
        from: element.timestamp,
        to: element.timestamp + element.duration,
      },
      pause: element.pauseVideo || false,
      label: element.title,
    }

    // Convert based on interaction type
    switch (element.type) {
      case "quiz":
        return {
          ...baseInteraction,
          libraryTitle: "Multiple Choice",
          action: {
            library: "H5P.MultiChoice 1.14",
            params: {
              question: element.description || element.title,
              answers: element.options.map((option: any) => ({
                text: option.text,
                correct: option.isCorrect || false,
                tipsAndFeedback: {
                  tip: "",
                  chosenFeedback: option.isCorrect
                    ? element.feedback?.correct || "Correct!"
                    : element.feedback?.incorrect || "Incorrect!",
                  notChosenFeedback: "",
                },
              })),
              behaviour: {
                enableRetry: true,
                enableSolutionsButton: true,
                singlePoint: true,
              },
            },
          },
        }
      case "hotspot":
        return {
          ...baseInteraction,
          libraryTitle: "Image Hotspot",
          action: {
            library: "H5P.ImageHotspot 1.9",
            params: {
              image: {
                path: "images/hotspot.jpg",
              },
              hotspots: [
                {
                  position: {
                    x: 50,
                    y: 50,
                  },
                  content: element.description || element.title,
                },
              ],
            },
          },
        }
      case "poll":
        return {
          ...baseInteraction,
          libraryTitle: "Single Choice Set",
          action: {
            library: "H5P.SingleChoiceSet 1.11",
            params: {
              choices: element.options.map((option: any) => ({
                question: element.title,
                answers: [
                  {
                    text: option.text,
                    correct: true,
                  },
                ],
              })),
            },
          },
        }
      default:
        return {
          ...baseInteraction,
          libraryTitle: "Text",
          action: {
            library: "H5P.Text 1.1",
            params: {
              text: `<p>${element.description || element.title}</p>`,
            },
          },
        }
    }
  })

  // Create the content.json structure
  const contentData = {
    interactiveVideo: {
      video: {
        files: [
          {
            path: video.url,
            mime: "video/mp4",
            copyright: {
              license: "U",
            },
          },
        ],
        startScreenOptions: {
          title: video.title,
          hideStartTitle: false,
        },
      },
      assets: {
        interactions: h5pInteractions,
      },
    },
  }

  return JSON.stringify(contentData, null, 2)
}

function generateMainJs() {
  return `// H5P Interactive Video main script
H5P = H5P || {};
H5P.InteractiveVideo = H5P.InteractiveVideo || {};

(function ($) {
  // Initialize when the H5P content is ready
  H5P.InteractiveVideo.init = function () {
    // Custom initialization code can go here
    console.log('Interactive Video initialized');
  };
  
  // Add event listeners
  H5P.InteractiveVideo.on('initialized', function () {
    // Handle initialization
  });
  
  H5P.InteractiveVideo.on('interactionStarted', function (event) {
    // Handle interaction start
    console.log('Interaction started:', event);
  });
  
  H5P.InteractiveVideo.on('interactionCompleted', function (event) {
    // Handle interaction completion
    console.log('Interaction completed:', event);
  });
})(H5P.jQuery);`
}

function generateStylesCss() {
  return `/* Custom styles for H5P Interactive Video */
.h5p-interactive-video {
  /* Add custom styles here */
}

.h5p-interaction {
  /* Customize interaction appearance */
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.h5p-interaction-button {
  /* Customize interaction buttons */
  transition: transform 0.2s;
}

.h5p-interaction-button:hover {
  transform: scale(1.1);
}`
}

