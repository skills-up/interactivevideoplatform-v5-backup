const nodemailer = require('nodemailer')

interface EmailOptions {
  to: string
  subject: string
  text: string
  html: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // For development, use a test account from Ethereal
  let testAccount
  let transporter

  if (process.env.NODE_ENV === "development") {
    // Create a test account on Ethereal for development
    testAccount = await nodemailer.createTestAccount()

    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
  } else {
    // Configure for production
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === "true",
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
  }

  // Send the email
  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"Interactive Video Platform" <noreply@interactivevideoplatform.com>',
    to,
    subject,
    text,
    html,
  })

  if (process.env.NODE_ENV === "development") {
    // Log the Ethereal URL for preview in development
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info))
  }

  return info
}

