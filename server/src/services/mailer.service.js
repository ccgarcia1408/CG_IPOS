const transporter = require("../config/mailer");

const MailerService = {
    async sendPasswordResetEmail(toEmail, username, resetCode) {
        const resetUrl = `${process.env.CLIENT_URL}/forgot-password?email=${encodeURIComponent(toEmail)}&code=${resetCode}`;

        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: toEmail,
            subject: "Reset your CG_IPOS password",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #1f2937;">
                    <h2 style="color: #1f2937;">Reset your password</h2>
                    <p>Hi ${username},</p>
                    <p>We received a request to reset your CG_IPOS password. Click the button below to continue -- this will take you straight back to the app.</p>
                    <p style="text-align: center; margin: 32px 0;">
                        <a href="${resetUrl}" style="background-color: #465fff; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
                            Reset Password
                        </a>
                    </p>
                    <p>If the button doesn't work, enter this code manually on the Forgot Password page:</p>
                    <p style="text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #1f2937;">${resetCode}</p>
                    <p>This code expires in 15 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
                </div>
            `
        });
    }
};

module.exports = MailerService;
