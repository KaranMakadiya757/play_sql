const otpTemplate = (userName, otpCode) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f6f8fa; padding: 1.25rem;">
      <div style="max-width: 37.5rem; margin: auto; background: #fff; border-radius: 0.625rem; padding: 1.875rem; box-shadow: 0 0.125rem 0.625rem rgba(0,0,0,0.05);">
        <h2 style="color: #ff4d4f;">🔐 OTP Verification - Play Tube</h2>

        <p style="font-size: 1rem;">
          Hey ${userName},<br/><br/>
          To verify your account or complete your request, please use the following One-Time Password (OTP):
        </p>

        <div style="text-align: center; margin: 1.875rem 0;">
          <div style="display: inline-block; background: #f0f0f0; padding: 1rem 1.875rem; border-radius: 0.5rem; font-size: 1.5rem; letter-spacing: 0.3125rem; font-weight: bold;">
            ${otpCode}
          </div>
        </div>

        <p style="font-size: 0.9375rem; color: #555;">
          This OTP is valid for the next <strong>5 minutes</strong>. ⏳<br/>
          Please do not share it with anyone for security reasons.
        </p>

        <p style="font-size: 0.875rem; color: #888;">
          If you didn’t request this, you can safely ignore this email.
        </p>

        <hr style="margin-top: 2.5rem;" />
        <p style="font-size: 0.8125rem; color: #aaa; text-align: center;">
          © ${new Date().getFullYear()} Play Tube. All rights reserved.
        </p>
      </div>
    </div>
  `;
};

export {
  otpTemplate
}