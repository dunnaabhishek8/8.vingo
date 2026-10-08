import nodemailer from "nodemailer"
import dotenv from "dotenv"
dotenv.config()

// ---------------------------------------------------------------------------
// Email delivery with THREE providers, picked automatically:
//
// 1) Brevo HTTP API        — if BREVO_API_KEY is set (xkeysib-... key)
// 2) Brevo SMTP relay      — if SMTP_USER + SMTP_PASS are set (your current setup!)
//                            Host: smtp-relay.brevo.com — designed for cloud servers,
//                            so it works on Render/Heroku where Gmail gets blocked.
// 3) Gmail SMTP (fallback) — if EMAIL + PASS are set (great for local development)
//
// Priority: Brevo API → Brevo SMTP → Gmail
// ---------------------------------------------------------------------------

const otpTemplate = (otp, heading) => `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;border:1px solid #eee;border-radius:12px;overflow:hidden">
    <div style="background:#ff4d2d;color:#fff;padding:18px 24px;font-size:20px;font-weight:bold">Vingo</div>
    <div style="padding:24px">
      <h2 style="margin:0 0 8px;color:#201a26">${heading}</h2>
      <p style="color:#6f6878;margin:0 0 16px">Use the OTP below. It expires in <b>5 minutes</b>.</p>
      <div style="font-size:32px;letter-spacing:10px;font-weight:bold;color:#ff4d2d;text-align:center;background:#fff4ef;border-radius:10px;padding:14px">${otp}</div>
      <p style="color:#948d9c;font-size:12px;margin-top:16px">If you didn't request this, you can safely ignore this email.</p>
    </div>
  </div>`

// --- Provider 1: Brevo transactional email over HTTPS ---
const sendViaBrevoApi = async (to, subject, html) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sender: { name: "Vingo", email: process.env.SMTP_FROM || process.env.EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent: html
    })
  })

  if (!response.ok) {
    const detail = await response.text()
    throw new Error(`Brevo API error ${response.status}: ${detail}`)
  }
}

// --- Provider 2: Brevo SMTP relay (uses SMTP_USER / SMTP_PASS / SMTP_FROM) ---
const sendViaBrevoSmtp = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await transporter.sendMail({
    from: `Vingo <${from}>`,
    to,
    subject,
    html
  })
}

// --- Provider 3: Gmail SMTP (local development fallback) ---
const sendViaGmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS,
    },
  })

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html
  })
}

// Unified sender — picks the best available provider
const sendMail = async (to, subject, html) => {
  try {
    if (process.env.BREVO_API_KEY) {
      await sendViaBrevoApi(to, subject, html)
      console.log(`[mail] sent via Brevo API → ${to}`)
    } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await sendViaBrevoSmtp(to, subject, html)
      console.log(`[mail] sent via Brevo SMTP → ${to}`)
    } else if (process.env.EMAIL && process.env.PASS) {
      await sendViaGmail(to, subject, html)
      console.log(`[mail] sent via Gmail SMTP → ${to}`)
    } else {
      throw new Error("No email provider configured. Set BREVO_API_KEY, or SMTP_USER+SMTP_PASS, or EMAIL+PASS.")
    }
  } catch (error) {
    // Surface the REAL reason in server logs so deployment issues are debuggable
    console.error("[mail] FAILED:", error.message)
    throw error
  }
}

// Startup diagnostic — prints which provider will be used when the server boots.
// If this says "Gmail SMTP" but you expected Brevo, restart the server:
// nodemon does NOT auto-reload .env changes!
const activeProvider =
  process.env.BREVO_API_KEY
    ? "Brevo API"
    : process.env.SMTP_USER && process.env.SMTP_PASS
      ? "Brevo SMTP"
      : process.env.EMAIL && process.env.PASS
        ? "Gmail SMTP"
        : "NONE (no email provider configured!)"

console.log(`[mail] active provider: ${activeProvider}`)

export const sendOtpMail = async (to, otp) => {
  await sendMail(to, "Reset Your Password · Vingo", otpTemplate(otp, "Password Reset"))
}

export const sendDeliveryOtpMail = async (user, otp) => {
  await sendMail(user.email, "Your Delivery OTP · Vingo", otpTemplate(otp, "Delivery Verification"))
}