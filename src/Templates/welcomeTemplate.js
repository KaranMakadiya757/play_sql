const welcomeTemplate = (userName) => {
    return `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #ff4d4f;">👋 Hey ${userName}, Welcome to Play Tube! 🎉</h2>
  
          <p style="font-size: 16px; line-height: 1.6;">
            We're super excited to have you on board! 🚀<br/>
            With <strong>Play Tube</strong>, you can explore amazing videos, discover trending content, and enjoy a smooth streaming experience. 📺✨
          </p>
  
          <p style="font-size: 16px;">
            Get started by logging in to your account and customizing your preferences.
          </p>
  
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #ff4d4f; color: #fff; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              🔓 Login to Play Tube
            </a>
          </div>
  
          <p style="font-size: 14px; color: #777;">
            If you did not register for Play Tube, please ignore this email.
          </p>
  
          <hr style="margin-top: 40px;" />
          <p style="font-size: 13px; color: #aaa; text-align: center;">
            © ${new Date().getFullYear()} Play Tube. All rights reserved.
          </p>
        </div>
      </div>
    `;
};

export {
    welcomeTemplate
}