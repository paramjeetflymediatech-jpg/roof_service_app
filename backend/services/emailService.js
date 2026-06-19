const nodemailer = require("nodemailer");

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Email service error:", error);
  } else {
    console.log("✅ Email service ready");
  }
});

// Send lead notification email
const sendLeadNotification = (leadData) => {
  return new Promise((resolve, reject) => {
    const adminEmails = process.env.ADMIN_EMAILS || "mainstreetroofing604@gmail.com,anujguptaflymedia@gmail.com,paramjeet.flymediatech@gmail.com,paramjeet.flymediatech@gmail.com";
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
      to: adminEmails,
      envelope: {
        from: process.env.EMAIL_USER,
        to: adminEmails,
      },
      subject: `New Lead: ${leadData.name}`,
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; color:black;margin: 0 auto;">
                <h2 style="color: black;">New Lead Submission</h2>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                    <p><strong>Name:</strong> ${leadData.name}</p>
                    <p><strong>Email:</strong> ${leadData.email}</p>
                    <p><strong>Phone:</strong> ${leadData.phone}</p>
                    ${leadData.address ? `<p><strong>Address:</strong> ${leadData.address}</p>` : ""}
                    ${leadData.city ? `<p><strong>City:</strong> ${leadData.city}</p>` : ""}
                    ${leadData.province ? `<p><strong>Province:</strong> ${leadData.province}</p>` : ""}
                    ${leadData.serviceType ? `<p><strong>Service Type:</strong> ${leadData.serviceType}</p>` : ""}
                    ${leadData.roofType ? `<p><strong>Roof Type:</strong> ${leadData.roofType}</p>` : ""}
                    ${leadData.hearAboutUs ? `<p><strong>Heard About Us:</strong> ${leadData.hearAboutUs}</p>` : ""}
                    ${leadData.message ? `<p><strong>Message:</strong><br/>${leadData.message}</p>` : ""}
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    This email was sent from Mainstreet Roofing Ltd website contact form.
                </p>
            </div>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Email send error:", error);
        reject(error);
      } else {
        console.log("✅ Email sent:", info.messageId);
        resolve({ success: true, messageId: info.messageId });
      }
    });
  });
};

// Send confirmation email to customer
const sendCustomerConfirmation = (leadData) => {
  return new Promise((resolve, reject) => {
    if (!leadData.email) {
      console.log("ℹ️ No customer email provided, skipping confirmation email.");
      return resolve({ success: false, error: "No email provided" });
    }
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
      to: leadData.email,
      envelope: {
        from: process.env.EMAIL_USER,
        to: leadData.email,
      },
      subject: "Thank You for Contacting Mainstreet Roofing Ltd",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #EA580C;">Thank You, ${leadData.name.split(" ")[0]}!</h2>
                <p>We've received your inquiry and will get back to you within 24 hours.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Submission Details:</h3>
                    <p><strong>Name:</strong> ${leadData.name}</p>
                    <p><strong>Email:</strong> ${leadData.email}</p>
                    <p><strong>Phone:</strong> ${leadData.phone || "Not provided"}</p>
                    ${leadData.message ? `<p><strong>Message:</strong><br/>${leadData.message}</p>` : ""}
                </div>
                <p>If you have any urgent questions, please call us at <strong>604-720-4313</strong></p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                    Mainstreet Roofing Ltd - Quality materials designed to protect your investment for decades
                </p>
            </div>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Customer email error:", error);
        reject(error);
      } else {
        console.log("✅ Confirmation email sent to customer");
        resolve({ success: true, messageId: info.messageId });
      }
    });
  });
};

// Send password reset email
const sendPasswordResetEmail = (user, resetToken) => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
      to: user.email,
      envelope: {
        from: process.env.EMAIL_USER,
        to: user.email,
      },
      subject: "Password Reset Request",
      html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #EA580C;">Password Reset Request</h2>
                <p>You requested a password reset. Please use the following code to reset your password:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <h1 style="letter-spacing: 5px; color: #EA580C; margin: 0;">${resetToken}</h1>
                </div>
                <p>This code will expire in 10 minutes.</p>
                <p>If you did not request this email, please ignore it.</p>
            </div>
        `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("❌ Password reset email error:", error);
        reject(error);
      } else {
        console.log("✅ Password reset email sent to:", user.email);
        resolve({ success: true });
      }
    });
  });
};

module.exports = {
  sendLeadNotification,
  sendCustomerConfirmation,
  sendPasswordResetEmail,
};
