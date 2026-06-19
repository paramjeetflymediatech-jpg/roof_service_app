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
  const adminEmails = process.env.ADMIN_EMAILS || "mainstreetroofing604@gmail.com,anujguptaflymedia@gmail.com,paramjeet.flymediatech@gmail.com,paramjeet.flymediatech@gmail.com";
  // Split, trim, filter empty, and deduplicate email addresses
  const emailList = [...new Set(adminEmails.split(",").map(e => e.trim()).filter(Boolean))];

  const promises = emailList.map((email) => {
    return new Promise((resolve, reject) => {
      const mailOptions = {
        from: process.env.EMAIL_FROM,
        replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_FROM,
        to: email,
        envelope: {
          from: process.env.EMAIL_USER,
          to: email,
        },
        subject: `[Mainstreet Roofing Ltd] New Lead: ${leadData.name}`,
        html: `
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 4px solid #ea580c;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">🏠 New Lead Submitted</h1>
                  <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">Mainstreet Roofing Website Contact Form</p>
                </div>
                
                <!-- Content Body -->
                <div style="padding: 30px;">
                  <h2 style="font-size: 18px; font-weight: 600; color: #0f172a; margin-top: 0; margin-bottom: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Submission Details</h2>
                  
                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                    <tbody>
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 140px; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Name</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${leadData.name}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Email</td>
                        <td style="padding: 10px 0; color: #3b82f6; border-bottom: 1px solid #f1f5f9; font-size: 14px;"><a href="mailto:${leadData.email}" style="color: #3b82f6; text-decoration: none;">${leadData.email}</a></td>
                      </tr>
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Phone</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;"><a href="tel:${leadData.phone}" style="color: #0f172a; text-decoration: none;">${leadData.phone}</a></td>
                      </tr>
                      ${leadData.address ? `
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Address</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${leadData.address}</td>
                      </tr>` : ""}
                      ${leadData.city ? `
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">City</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${leadData.city}</td>
                      </tr>` : ""}
                      ${leadData.province ? `
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Province</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${leadData.province}</td>
                      </tr>` : ""}
                      ${leadData.serviceType ? `
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Service Type</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;"><span style="background-color: #ffedd5; color: #ea580c; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px; display: inline-block;">${leadData.serviceType}</span></td>
                      </tr>` : ""}
                      ${leadData.roofType ? `
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Roof Type</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${leadData.roofType}</td>
                      </tr>` : ""}
                      ${leadData.hearAboutUs ? `
                      <tr>
                        <td style="padding: 10px 0; font-weight: 600; color: #64748b; border-bottom: 1px solid #f1f5f9; font-size: 14px; vertical-align: top;">Heard About Us</td>
                        <td style="padding: 10px 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; font-size: 14px;">${leadData.hearAboutUs}</td>
                      </tr>` : ""}
                    </tbody>
                  </table>

                  ${leadData.message ? `
                  <div style="background-color: #f8fafc; border-left: 4px solid #ea580c; padding: 15px 20px; border-radius: 4px; margin-top: 10px;">
                    <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 14px; font-weight: 600;">Message / Details</h4>
                    <p style="margin: 0; color: #475569; font-size: 14px; white-space: pre-wrap;">${leadData.message}</p>
                  </div>` : ""}
                </div>
                
                <!-- Footer Section -->
                <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">This notification email was automatically sent from the Mainstreet Roofing Ltd contact platform.</p>
                </div>
              </div>
            </div>
        `,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(`❌ Email send error for ${email}:`, error);
          reject(error);
        } else {
          console.log(`✅ Email sent to ${email}:`, info.messageId);
          resolve({ success: true, email, messageId: info.messageId });
        }
      });
    });
  });

  return Promise.all(promises);
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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <div style="background-color: #0f172a; padding: 40px 30px; text-align: center; border-bottom: 4px solid #ea580c;">
                  <h1 style="color: #ffffff; margin: 0 0 10px 0; font-size: 26px; font-weight: 700; letter-spacing: -0.025em;">🏠 Mainstreet Roofing Ltd</h1>
                  <p style="color: #94a3b8; margin: 0; font-size: 15px; font-weight: 400;">Your trusted local roofing experts</p>
                </div>
                
                <!-- Content Body -->
                <div style="padding: 40px 30px;">
                  <h2 style="font-size: 20px; font-weight: 700; color: #ea580c; margin-top: 0; margin-bottom: 15px;">Thank You, ${leadData.name.split(" ")[0]}!</h2>
                  <p style="font-size: 15px; color: #334155; margin-bottom: 25px;">We have received your service request and our team is already reviewing the details. One of our project managers will contact you within <strong>24 business hours</strong> to discuss the next steps.</p>
                  
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 25px; margin-bottom: 30px;">
                    <h3 style="margin-top: 0; margin-bottom: 15px; color: #0f172a; font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Inquiry Summary:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                      <tbody>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 14px; width: 120px;">Name</td>
                          <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${leadData.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 14px;">Email</td>
                          <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${leadData.email}</td>
                        </tr>
                        ${leadData.phone ? `
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 14px;">Phone</td>
                          <td style="padding: 8px 0; color: #0f172a; font-size: 14px;">${leadData.phone}</td>
                        </tr>` : ""}
                        ${leadData.serviceType ? `
                        <tr>
                          <td style="padding: 8px 0; font-weight: 600; color: #64748b; font-size: 14px;">Requested</td>
                          <td style="padding: 8px 0; color: #ea580c; font-size: 14px; font-weight: 600;">${leadData.serviceType}</td>
                        </tr>` : ""}
                      </tbody>
                    </table>
                    
                    ${leadData.message ? `
                    <div style="border-top: 1px solid #e2e8f0; margin-top: 15px; padding-top: 15px;">
                      <strong style="display: block; margin-bottom: 6px; color: #64748b; font-size: 14px;">Your Message:</strong>
                      <span style="color: #475569; font-size: 14px; font-style: italic;">"${leadData.message}"</span>
                    </div>` : ""}
                  </div>

                  <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 8px; padding: 20px; text-align: center;">
                    <h4 style="margin: 0 0 5px 0; color: #c2410c; font-size: 15px; font-weight: 600;">Need Urgent Assistance?</h4>
                    <p style="margin: 0; color: #7c2d12; font-size: 14px;">Please call us directly at <a href="tel:6047204313" style="color: #ea580c; font-weight: 700; text-decoration: none;">604-720-4313</a></p>
                  </div>
                </div>
                
                <!-- Footer Section -->
                <div style="background-color: #f1f5f9; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #0f172a; font-weight: 600; font-size: 13px; margin: 0 0 5px 0;">Mainstreet Roofing Ltd</p>
                  <p style="color: #64748b; font-size: 12px; margin: 0;">Quality materials designed to protect your investment for decades.</p>
                </div>
              </div>
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
            <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 10px; color: #1e293b; line-height: 1.6;">
              <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03); border: 1px solid #e2e8f0;">
                <!-- Header Banner -->
                <div style="background-color: #0f172a; padding: 30px; text-align: center; border-bottom: 4px solid #ea580c;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.025em;">🏠 Mainstreet Roofing Ltd</h1>
                </div>
                
                <!-- Content Body -->
                <div style="padding: 40px 30px; text-align: center;">
                  <h2 style="font-size: 20px; font-weight: 700; color: #ea580c; margin-top: 0; margin-bottom: 15px;">Password Reset Request</h2>
                  <p style="font-size: 15px; color: #334155; margin-bottom: 25px; text-align: left;">You requested a password reset for your account. Please use the verification code below to complete the reset process:</p>
                  
                  <div style="background-color: #f8fafc; border: 1px dashed #e2e8f0; border-radius: 8px; padding: 20px; margin: 25px auto; max-width: 250px; text-align: center;">
                    <span style="font-size: 32px; font-weight: 700; color: #ea580c; letter-spacing: 5px;">${resetToken}</span>
                  </div>
                  
                  <p style="font-size: 13px; color: #64748b; margin-top: 25px; text-align: left; background-color: #f1f5f9; padding: 12px; border-radius: 6px;">
                    ⚠️ <strong>Note:</strong> This verification code will expire in <strong>10 minutes</strong>. If you did not request a password reset, please ignore this email.
                  </p>
                </div>
                
                <!-- Footer Section -->
                <div style="background-color: #f1f5f9; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="color: #64748b; font-size: 12px; margin: 0;">This email was automatically generated by Mainstreet Roofing Ltd.</p>
                </div>
              </div>
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
