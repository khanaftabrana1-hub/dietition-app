export const getPasswordResetTemplate = (otp: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
          }
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          }
          .email-header {
            background: linear-gradient(135deg, #4f46e5, #3b82f6);
            color: #ffffff;
            text-align: center;
            padding: 30px;
          }
          .email-header h1 {
            margin: 0;
            font-size: 24px;
          }
          .email-body {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
          }
          .otp-box {
            background: #f8fafc;
            border: 2px dashed #cbd5e1;
            color: #1e293b;
            font-size: 32px;
            font-weight: bold;
            text-align: center;
            letter-spacing: 6px;
            padding: 15px;
            margin: 25px 0;
            border-radius: 6px;
          }
          .email-footer {
            background: #f8fafc;
            text-align: center;
            padding: 15px;
            color: #94a3b8;
            font-size: 12px;
            border-top: 1px solid #e2e8f0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Security Verification</h1>
          </div>
          <div class="email-body">
            <p>Hello,</p>
            <p>Aap ne apne account ke liye password reset ya verification ki darkhwast di hai. Niche diya gaya OTP code istemal karein:</p>
            
            <div class="otp-box">${otp}</div>
            
            <p>Yeh code sirf <strong>10 minutes</strong> tak valid hai. Agar aap ne yeh darkhwast nahi di thi, toh baraye meherbani is email ko ignore kar dein.</p>
            <p>Shukria,<br><strong>Your App Team</strong></p>
          </div>
          <div class="email-footer">
            <p>&copy; 2026 Your App Name. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};