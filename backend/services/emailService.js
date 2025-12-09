// backend/services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or 'outlook', 'yahoo', etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send password reset email
const sendPasswordResetEmail = async (toEmail, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"Home Health System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 Password Reset Request - Home Health System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .token-box { background: #fff; padding: 15px; border-left: 4px solid #667eea; 
                       margin: 20px 0; font-family: monospace; font-size: 16px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Home Health System</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <h2>Hello,</h2>
            <p>We received a request to reset your password. Click the button below to reset it:</p>
            
            <center>
              <a href="${resetLink}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <div class="token-box">${resetLink}</div>
            
            <p><strong>Your Reset Token:</strong></p>
            <div class="token-box">${resetToken}</div>
            
            <p><strong>⏰ This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2024 Home Health System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, message: 'Failed to send email', error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (toEmail, userName, role) => {
  const mailOptions = {
    from: `"Home Health System" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Welcome to Home Health System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #27ae60; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏥 Welcome to Home Health System</h1>
          </div>
          <div class="content">
            <h2>Hello ${userName}! 👋</h2>
            <p>Thank you for registering with Home Health System.</p>
            <p>Your account has been created successfully as a <strong>${role}</strong>.</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL}" class="button">Go to Dashboard</a>
            </center>
            
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Home Health Team</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Welcome email error:', error);
    return { success: false };
  }
};

// Send emergency alert email to clinician
const sendEmergencyAlertEmail = async (clinicianEmail, patientName, emergencyDetails) => {
  const mailOptions = {
    from: `"Home Health System - URGENT" <${process.env.EMAIL_USER}>`,
    to: clinicianEmail,
    subject: '🚨 URGENT: Emergency Alert - Immediate Attention Required',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #e74c3c; color: white; padding: 30px; text-align: center; 
                    border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 3px solid #e74c3c; 
                     border-radius: 0 0 10px 10px; }
          .alert-box { background: #ffebee; padding: 15px; border-left: 4px solid #e74c3c; 
                       margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #e74c3c; 
                    color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 EMERGENCY ALERT</h1>
            <p>IMMEDIATE ATTENTION REQUIRED</p>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2>⚠️ Patient Emergency</h2>
              <p><strong>Patient:</strong> ${patientName}</p>
              <p><strong>Type:</strong> ${emergencyDetails.type || 'Emergency Lifeline Activated'}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Message:</strong> ${emergencyDetails.message || 'Emergency assistance needed'}</p>
            </div>
            
            <center>
              <a href="${process.env.FRONTEND_URL}" class="button">View in Dashboard</a>
            </center>
            
            <p><strong>Action Required:</strong> Please respond immediately and check on the patient.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Emergency email error:', error);
    return { success: false };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEmergencyAlertEmail
};