"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendGiftCardEmail = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendEmail = async (options) => {
    await transporter.sendMail({
        from: process.env.SMTP_FROM || 'HR Department <hr@company.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
    });
};
exports.sendEmail = sendEmail;
const COMPANY_NAME = process.env.COMPANY_NAME || 'CorpHR&#8482; Connect';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const OCCASION_EMOJI = {
    Birthday: '🎂',
    'Work Anniversary': '🏆',
    Holiday: '🎄',
    Congratulations: '🎉',
    'Thank You': '🙏',
    'New Employee Welcome': '🤝',
    'Performance Recognition': '⭐',
    'Team Achievement': '🚀',
    'Farewell Message': '💐',
};
const OCCASION_HEADLINE = {
    Birthday: 'Wishing You a Very Happy Birthday!',
    'Work Anniversary': 'Celebrating Your Work Anniversary',
    Holiday: 'Season\'s Greetings & Best Wishes',
    Congratulations: 'Congratulations on Your Achievement!',
    'Thank You': 'Thank You for Your Dedication',
    'New Employee Welcome': 'Welcome Aboard — We\'re Glad You\'re Here!',
    'Performance Recognition': 'Recognizing Your Outstanding Performance',
    'Team Achievement': 'Celebrating Our Team\'s Success',
    'Farewell Message': 'Wishing You All the Best',
};
const sendGiftCardEmail = async (giftCard, recipientEmail) => {
    const emoji = OCCASION_EMOJI[giftCard.occasion] || '🎁';
    const headline = OCCASION_HEADLINE[giftCard.occasion] || `A Special ${giftCard.occasion} Message`;
    const senderName = `${giftCard.employee.firstName} ${giftCard.employee.lastName}`;
    const currentYear = new Date().getFullYear();
    const primaryColor = '#1E3A5F';
    const accentColor = '#F59E0B';
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f1f5f9;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

          <!-- Company Header -->
          <tr>
            <td style="background:${primaryColor};padding:28px 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td>
                    <p style="color:rgba(255,255,255,0.65);font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 4px;">Human Resources Department</p>
                    <p style="color:#ffffff;font-size:22px;font-weight:900;margin:0;letter-spacing:-0.3px;">${COMPANY_NAME}</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display:inline-block;background:${accentColor};color:#1F2937;font-size:10px;font-weight:700;padding:4px 12px;border-radius:20px;letter-spacing:1px;">OFFICIAL</span>
                    <p style="color:rgba(255,255,255,0.55);font-size:9px;margin:4px 0 0;text-align:right;">Employee Communication</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Accent stripe -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,${accentColor} 0%,${primaryColor} 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Occasion Banner -->
          <tr>
            <td style="background:#fafafa;border-bottom:1px solid #f0f0f0;padding:16px 36px;">
              <table cellpadding="0" cellspacing="0" role="presentation">
                <tr>
                  <td style="font-size:24px;line-height:1;padding-right:12px;">${emoji}</td>
                  <td>
                    <p style="font-size:15px;font-weight:800;color:#1e293b;margin:0;">${headline}</p>
                    <p style="font-size:11px;color:#64748b;margin:2px 0 0;">${giftCard.occasion} Celebration</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 36px;">

              <!-- Salutation -->
              <p style="font-size:14px;color:#1e293b;margin:0 0 14px;">
                Dear Recipient,
              </p>

              <!-- Personal message -->
              <div style="font-size:13px;color:#374151;line-height:1.7;margin:0 0 20px;padding:14px 16px;background:#f8fafc;border-left:4px solid ${accentColor};border-radius:0 4px 4px 0;">
                ${giftCard.message
        ? giftCard.message
        : 'On behalf of the entire organization, we wish to recognize this special occasion and express our sincere appreciation for your continued contributions and commitment to excellence.'}
              </div>

              <!-- Gift Card Value Block -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:${primaryColor};border-radius:8px;overflow:hidden;margin:0 0 20px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                      <tr>
                        <td valign="middle">
                          <p style="color:rgba(255,255,255,0.7);font-size:9px;letter-spacing:2px;text-transform:uppercase;margin:0 0 6px;">Gift Voucher Amount</p>
                          <p style="color:#ffffff;font-size:36px;font-weight:900;margin:0;line-height:1;">$${giftCard.amount.toFixed(2)}</p>
                        </td>
                        <td align="right" valign="middle">
                          <span style="display:inline-block;background:${accentColor};color:#1F2937;font-size:9px;font-weight:700;padding:3px 10px;border-radius:12px;letter-spacing:1px;">GIFT VOUCHER</span>
                          <p style="color:rgba(255,255,255,0.55);font-size:9px;margin:6px 0 0;text-align:right;">Valid for use at<br/>approved partners</p>
                        </td>
                      </tr>
                    </table>
                    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:16px;">
                      <tr>
                        <td align="center">
                          <a href="${FRONTEND_URL}/gift-cards?id=${giftCard.id}" style="display:inline-block;background:${accentColor};color:#1F2937;font-size:11px;font-weight:700;padding:10px 32px;border-radius:4px;text-decoration:none;letter-spacing:0.5px;">REDEEM YOUR GIFT &rarr;</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <p style="font-size:12px;color:#374151;margin:0 0 4px;">With warm regards,</p>
              <p style="font-size:13px;font-weight:700;color:#1e293b;margin:0 0 2px;">${senderName}</p>
              <p style="font-size:11px;color:#64748b;margin:0;">Human Resources Department</p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 36px;">
              <p style="font-size:10px;color:#94a3b8;text-align:center;margin:0;line-height:1.6;">
                This is an official HR communication. Please do not reply directly to this email.<br/>
                For assistance, contact your HR representative.<br/>
                &copy; ${currentYear} ${COMPANY_NAME} &bull; Human Resources Department &bull; All Rights Reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
    await (0, exports.sendEmail)({
        to: recipientEmail,
        subject: `${emoji} ${headline} — HR Communication`,
        html,
    });
};
exports.sendGiftCardEmail = sendGiftCardEmail;
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1E3A5F;">Password Reset Request</h1>
      <p>You requested a password reset. Click the button below to reset your password.</p>
      <a href="${resetUrl}" style="display: inline-block; background: #1E3A5F; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin: 20px 0;">
        Reset Password
      </a>
      <p style="color: #6B7280; font-size: 14px;">This link expires in 1 hour. If you did not request this, please ignore this email.</p>
    </div>
  `;
    await (0, exports.sendEmail)({
        to: email,
        subject: 'Password Reset Request',
        html,
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
//# sourceMappingURL=emailService.js.map