const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const brandName = () => process.env.STORE_NAME?.trim() || "Needful";
const sender = () => `${brandName()} <${process.env.EMAIL_USER}>`;

const getFrontendUrl = () => {
  const value = process.env.FRONTEND_URL?.trim().replace(/\/+$/, "");

  if (!value) return "";

  try {
    return new URL(value).toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
};

const actionButton = (label, href) => {
  if (!href) return "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 4px;">
      <tr>
        <td align="left">
          <a href="${escapeHtml(href)}" style="display:inline-block;background:#087c7a;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;line-height:20px;padding:13px 22px;border-radius:10px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
};

const codeBlock = (code, label) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
    <tr>
      <td style="background:#effcfb;border:1px solid #aceeea;border-radius:14px;padding:20px;text-align:center;">
        <div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#0b6261;margin-bottom:8px;">
          ${escapeHtml(label)}
        </div>
        <div style="font-family:'Courier New',Courier,monospace;font-size:30px;line-height:38px;font-weight:700;letter-spacing:7px;color:#1f1f1c;">
          ${escapeHtml(code)}
        </div>
      </td>
    </tr>
  </table>
`;

const securityNotice = (message) => `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0 0;">
    <tr>
      <td style="background:#f7f7f6;border-left:4px solid #343330;padding:14px 16px;color:#41403c;font-size:13px;line-height:20px;">
        <strong style="color:#1f1f1c;">Security notice:</strong>
        ${message}
      </td>
    </tr>
  </table>
`;

const emailLayout = ({ preheader, eyebrow, title, name, content }) => {
  const safeBrand = escapeHtml(brandName());
  const safeName = escapeHtml(name || "there");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f7f6;color:#282724;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;background:#f7f7f6;">
      <tr>
        <td align="center" style="padding:30px 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
            <tr>
              <td style="padding:0 4px 18px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td style="width:38px;height:38px;background:#087c7a;border-radius:10px;text-align:center;vertical-align:middle;color:#ffffff;font-family:Arial,sans-serif;font-size:18px;font-weight:800;">N</td>
                    <td style="padding-left:11px;font-family:Arial,sans-serif;font-size:19px;font-weight:800;color:#1f1f1c;">${safeBrand}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="background:#ffffff;border:1px solid #e8e8e6;border-radius:18px;overflow:hidden;">
                <div style="height:5px;background:#0abab5;font-size:0;line-height:0;">&nbsp;</div>
                <div style="padding:34px 38px 36px;font-family:Arial,Helvetica,sans-serif;">
                  <div style="font-size:11px;line-height:16px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:#087c7a;margin-bottom:10px;">
                    ${escapeHtml(eyebrow)}
                  </div>
                  <h1 style="margin:0;color:#1f1f1c;font-size:27px;line-height:35px;font-weight:750;letter-spacing:-0.4px;">
                    ${escapeHtml(title)}
                  </h1>
                  <p style="margin:22px 0 0;color:#41403c;font-size:15px;line-height:24px;">
                    Hello ${safeName},
                  </p>
                  ${content}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 18px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;color:#777670;font-size:11px;line-height:18px;">
                This is an automated account email from ${safeBrand}. Please do not share verification or reset codes with anyone.<br>
                &copy; ${new Date().getFullYear()} ${safeBrand}. Helping useful things find the people who need them.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const sendMessage = ({ to, subject, text, html }) =>
  transporter.sendMail({
    from: sender(),
    replyTo: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
  });

const sendVerificationEmail = async (email, code, name) => {
  const frontendUrl = getFrontendUrl();
  const verifyUrl = frontendUrl
    ? `${frontendUrl}/verify-email?email=${encodeURIComponent(email)}`
    : "";
  const subject = `Verify your ${brandName()} email`;

  return sendMessage({
    to: email,
    subject,
    text: `Hello ${name || "there"},\n\nYour ${brandName()} verification code is: ${code}\n\nThis code expires in 10 minutes. If you did not create this account, you can ignore this email.`,
    html: emailLayout({
      preheader: `Use code ${code} to verify your ${brandName()} account.`,
      eyebrow: "Email verification",
      title: "Confirm your email address",
      name,
      content: `
        <p style="margin:12px 0 0;color:#55544f;font-size:15px;line-height:24px;">
          Welcome to ${escapeHtml(brandName())}. Enter the code below to finish creating your account.
        </p>
        ${codeBlock(code, "Verification code")}
        <p style="margin:0;color:#55544f;font-size:13px;line-height:21px;">
          This code expires in <strong style="color:#282724;">10 minutes</strong> and can only be used once.
        </p>
        ${actionButton("Open verification page", verifyUrl)}
        ${securityNotice("If you did not create a Needful account, no action is required. You can safely ignore this message.")}
      `,
    }),
  });
};

const sendResetPasswordEmail = async (email, token, name) => {
  const subject = `Reset your ${brandName()} password`;

  return sendMessage({
    to: email,
    subject,
    text: `Hello ${name || "there"},\n\nYour ${brandName()} password reset code is: ${token}\n\nThis code expires in 10 minutes. If you did not request a reset, ignore this email and keep your code private.`,
    html: emailLayout({
      preheader: `Use code ${token} to reset your ${brandName()} password.`,
      eyebrow: "Password assistance",
      title: "Reset your password",
      name,
      content: `
        <p style="margin:12px 0 0;color:#55544f;font-size:15px;line-height:24px;">
          We received a request to reset your password. Enter this code in the password reset form to continue.
        </p>
        ${codeBlock(token, "Password reset code")}
        <p style="margin:0;color:#55544f;font-size:13px;line-height:21px;">
          This code expires in <strong style="color:#282724;">10 minutes</strong>. Never share it with anyone, including someone claiming to work for Needful.
        </p>
        ${securityNotice("If you did not request a password reset, ignore this email. Your current password will remain unchanged.")}
      `,
    }),
  });
};

const sendPasswordChangedEmail = async (email, name) => {
  const frontendUrl = getFrontendUrl();
  const subject = `Your ${brandName()} password was changed`;

  return sendMessage({
    to: email,
    subject,
    text: `Hello ${name || "there"},\n\nThe password for your ${brandName()} account was changed successfully.\n\nIf you made this change, no action is needed. If you did not, reset your password immediately and reply to this email for support.`,
    html: emailLayout({
      preheader: `The password for your ${brandName()} account was changed.`,
      eyebrow: "Security update",
      title: "Your password was changed",
      name,
      content: `
        <p style="margin:12px 0 0;color:#55544f;font-size:15px;line-height:24px;">
          The password for your ${escapeHtml(brandName())} account was updated successfully. If you made this change, there is nothing else you need to do.
        </p>
        ${actionButton("Go to Needful", frontendUrl)}
        ${securityNotice("If this was not you, reset your password immediately and reply to this email so the account can be reviewed.")}
      `,
    }),
  });
};

const sendEmailChangedNotifications = async (oldEmail, newEmail, name) => {
  const safeOldEmail = escapeHtml(oldEmail);
  const safeNewEmail = escapeHtml(newEmail);
  const frontendUrl = getFrontendUrl();

  await Promise.all([
    sendMessage({
      to: oldEmail,
      subject: `Your ${brandName()} email address was changed`,
      text: `Hello ${name || "there"},\n\nThe email address on your ${brandName()} account was changed from ${oldEmail} to ${newEmail}.\n\nIf you did not make this change, reply to this email immediately.`,
      html: emailLayout({
        preheader: `The email address on your ${brandName()} account was changed.`,
        eyebrow: "Important security update",
        title: "Your account email changed",
        name,
        content: `
          <p style="margin:12px 0 0;color:#55544f;font-size:15px;line-height:24px;">
            The sign-in email for your account was changed from
            <strong style="color:#282724;">${safeOldEmail}</strong> to
            <strong style="color:#282724;">${safeNewEmail}</strong>.
          </p>
          ${securityNotice("If you did not authorize this change, reply to this email immediately so the account can be reviewed.")}
        `,
      }),
    }),
    sendMessage({
      to: newEmail,
      subject: `Your new ${brandName()} email address`,
      text: `Hello ${name || "there"},\n\n${newEmail} is now the sign-in email for your ${brandName()} account and will receive future security notifications.\n\nIf you did not make this change, reply to this email immediately.`,
      html: emailLayout({
        preheader: `${newEmail} is now connected to your ${brandName()} account.`,
        eyebrow: "Account details updated",
        title: "Your new email is active",
        name,
        content: `
          <p style="margin:12px 0 0;color:#55544f;font-size:15px;line-height:24px;">
            <strong style="color:#282724;">${safeNewEmail}</strong> is now your sign-in email and will receive future account and security notifications.
          </p>
          ${actionButton("Go to Needful", frontendUrl)}
          ${securityNotice("If you did not authorize this change, reply to this email immediately so the account can be reviewed.")}
        `,
      }),
    }),
  ]);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendPasswordChangedEmail,
  sendEmailChangedNotifications,
};
