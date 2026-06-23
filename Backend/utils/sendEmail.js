const nodemailer = require("nodemailer");
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("STORE_NAME:", process.env.STORE_NAME);

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
    from: `"My Store" <${process.env.EMAIL_USER}>`,
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

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
};
