import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'Gift Card System <noreply@giftcards.com>',
    to: options.to,
    subject: options.subject,
    html: options.html,
  })
}

export const sendGiftCardEmail = async (
  giftCard: {
    id: string
    amount: number
    occasion: string
    message?: string | null
    employee: { firstName: string; lastName: string; email: string }
  },
  recipientEmail: string
): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">You've received a Gift Card! 🎁</h1>
      <p>You have received a gift card from ${giftCard.employee.firstName} ${giftCard.employee.lastName}.</p>
      <div style="background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Occasion:</strong> ${giftCard.occasion}</p>
        <p><strong>Amount:</strong> $${giftCard.amount.toFixed(2)}</p>
        ${giftCard.message ? `<p><strong>Message:</strong> ${giftCard.message}</p>` : ''}
      </div>
      <p style="color: #6B7280; font-size: 14px;">This gift card was sent via the Employee Gift Card System.</p>
    </div>
  `

  await sendEmail({
    to: recipientEmail,
    subject: `You've received a ${giftCard.occasion} Gift Card!`,
    html,
  })
}

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #4F46E5;">Password Reset Request</h1>
      <p>You requested a password reset. Click the button below to reset your password.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #6B7280; font-size: 14px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `

  await sendEmail({
    to: email,
    subject: 'Password Reset Request',
    html,
  })
}
