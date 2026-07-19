const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, code, name) => {
  await transporter.sendMail({
    from: `${process.env.STORE_NAME} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${name},</h2>
        <p>Your verification code is:</p>
        <h1 style="letter-spacing: 4px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
};

const sendResetPasswordEmail = async (email, token, name) => {
  await transporter.sendMail({
    from: `${process.env.STORE_NAME} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Hello ${name},</h2>
        <p>Your password reset code is:</p>
        <h1 style="letter-spacing: 4px;">${token}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
  });
};

const sendPasswordChangedEmail = async (email, name) => {
  await transporter.sendMail({
    from: `${process.env.STORE_NAME || "Needful"} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Needful password was changed",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #282724;">
        <h2>Hello ${name},</h2>
        <p>Your Needful account password was changed successfully.</p>
        <p>If you made this change, no further action is needed.</p>
        <p><strong>If you did not make this change, reset your password immediately and contact Needful support.</strong></p>
        <p style="color: #777670; font-size: 13px;">For your security, this email never includes your password.</p>
      </div>
    `,
  });
};

const sendEmailChangedNotifications = async (oldEmail, newEmail, name) => {
  const from = `${process.env.STORE_NAME || "Needful"} <${process.env.EMAIL_USER}>`;

  await Promise.all([
    transporter.sendMail({
      from,
      to: oldEmail,
      subject: "Your Needful email address was changed",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #282724;">
          <h2>Hello ${name},</h2>
          <p>The email address on your Needful account was changed from <strong>${oldEmail}</strong> to <strong>${newEmail}</strong>.</p>
          <p><strong>If you did not make this change, contact Needful support immediately.</strong></p>
        </div>
      `,
    }),
    transporter.sendMail({
      from,
      to: newEmail,
      subject: "Your new Needful email address",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #282724;">
          <h2>Hello ${name},</h2>
          <p>Your Needful account email address was updated successfully.</p>
          <p>This address will now be used for account and security notifications.</p>
          <p><strong>If you did not make this change, contact Needful support immediately.</strong></p>
        </div>
      `,
    }),
  ]);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
  sendEmailChangedNotifications,
};
