const nodemailer = require('nodemailer');
const config = require('../config/config');

const transporter = nodemailer.createTransport({
  service: config.email.service,
  auth: {
    user: config.email.username,
    pass: config.email.password,
  },
});

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Error sending password reset email');
  }
};

const sendEmergencyNotification = async (email, emergency) => {
  const mailOptions = {
    from: config.email.from,
    to: email,
    subject: 'Emergency Report Update',
    html: `
      <h1>Emergency Report Update</h1>
      <p>Your emergency report has been updated:</p>
      <ul>
        <li>Type: ${emergency.type}</li>
        <li>Status: ${emergency.status}</li>
        <li>Location: ${emergency.location}</li>
      </ul>
      <p>Please check the app for more details.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending emergency notification email:', error);
    throw new Error('Error sending emergency notification email');
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendEmergencyNotification,
}; 