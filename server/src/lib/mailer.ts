import nodemailer from 'nodemailer'

const isDev = !process.env.SMTP_HOST

const transport = isDev
  ? null // console-log mode
  : nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

export async function sendMagicLink(email: string, token: string): Promise<void> {
  const base = process.env.APP_URL ?? 'http://localhost:5173'
  // Points to the React app's verify route, which then calls /api/auth/verify/:token
  const link = `${base}/auth/verify/${token}`

  if (isDev) {
    console.log(`\n[MAGIC LINK]\nTo: ${email}\n${link}\n`)
    return
  }

  await transport!.sendMail({
    from: process.env.SMTP_FROM ?? 'noreply@living-ecosystem.app',
    to: email,
    subject: 'Your login link',
    text: `Sign in: ${link}\n\nExpires in 15 minutes.`,
    html: `<p>Click to sign in: <a href="${link}">${link}</a></p><p>Expires in 15 minutes.</p>`,
  })
}
