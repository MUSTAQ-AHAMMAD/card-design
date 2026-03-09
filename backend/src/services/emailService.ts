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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px;">
      <div style="background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 32px 24px; text-align: center;">
          <p style="color: rgba(255,255,255,0.8); font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 8px;">You've received a</p>
          <h1 style="color: white; font-size: 28px; font-weight: 900; margin: 0;">Gift Card 🎁</h1>
        </div>

        <!-- Gift Card Visual -->
        <div style="padding: 24px 32px;">
          <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 16px; padding: 24px; color: white; position: relative; overflow: hidden;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
              <div>
                <p style="font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 4px;">Gift Card</p>
                <p style="font-size: 18px; font-weight: 700; margin: 0;">${giftCard.occasion}</p>
              </div>
              <div style="background: #F59E0B; border-radius: 20px; padding: 4px 12px; font-size: 12px; font-weight: 700; color: #1F2937;">GIFT</div>
            </div>
            <div style="text-align: center; padding: 12px 0;">
              <p style="font-size: 48px; font-weight: 900; margin: 0;">$${giftCard.amount.toFixed(2)}</p>
              ${giftCard.message ? `<p style="font-size: 14px; opacity: 0.8; font-style: italic; margin: 8px 0 0;">"${giftCard.message}"</p>` : ''}
            </div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 16px;">
              <div>
                <p style="font-size: 10px; opacity: 0.6; margin: 0 0 2px;">From</p>
                <p style="font-size: 14px; font-weight: 600; margin: 0;">${giftCard.employee.firstName} ${giftCard.employee.lastName}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Details -->
        <div style="padding: 0 32px 32px;">
          <p style="color: #374151; font-size: 16px; margin: 0 0 16px;">
            <strong>${giftCard.employee.firstName} ${giftCard.employee.lastName}</strong> has sent you a gift card worth <strong>$${giftCard.amount.toFixed(2)}</strong> for <strong>${giftCard.occasion}</strong>.
          </p>
          <p style="color: #6B7280; font-size: 14px; margin: 0 0 24px;">Log in to your account to view and redeem your gift card.</p>
          <p style="color: #9CA3AF; font-size: 12px; border-top: 1px solid #F3F4F6; padding-top: 16px; margin: 0;">
            This gift card was sent via the Employee Gift Card System. If you believe this was sent in error, please contact your HR team.
          </p>
        </div>
      </div>
    </div>
  `

  await sendEmail({
    to: recipientEmail,
    subject: `You've received a ${giftCard.occasion} Gift Card! 🎁`,
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
