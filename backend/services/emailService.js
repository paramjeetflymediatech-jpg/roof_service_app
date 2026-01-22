const nodemailer = require('nodemailer');

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
        console.log('❌ Email service error:', error);
    } else {
        console.log('✅ Email service ready');
    }
});

// Send lead notification email
const sendLeadNotification = async (leadData) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: process.env.EMAIL_USER, // Send to your email
        subject: `New Lead: ${leadData.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0ea5e9;">New Lead Submission</h2>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
                    <p><strong>Name:</strong> ${leadData.name}</p>
                    <p><strong>Email:</strong> ${leadData.email}</p>
                    <p><strong>Phone:</strong> ${leadData.phone}</p>
                    ${leadData.address ? `<p><strong>Address:</strong> ${leadData.address}</p>` : ''}
                    ${leadData.city ? `<p><strong>City:</strong> ${leadData.city}</p>` : ''}
                    ${leadData.province ? `<p><strong>Province:</strong> ${leadData.province}</p>` : ''}
                    ${leadData.serviceType ? `<p><strong>Service Type:</strong> ${leadData.serviceType}</p>` : ''}
                    ${leadData.roofType ? `<p><strong>Roof Type:</strong> ${leadData.roofType}</p>` : ''}
                    ${leadData.hearAboutUs ? `<p><strong>Heard About Us:</strong> ${leadData.hearAboutUs}</p>` : ''}
                    ${leadData.message ? `<p><strong>Message:</strong><br/>${leadData.message}</p>` : ''}
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    This email was sent from Premium Roofing website contact form.
                </p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('❌ Email send error:', error);
        return { success: false, error: error.message };
    }
};

// Send confirmation email to customer
const sendCustomerConfirmation = async (leadData) => {
    if (!leadData.email) {
        console.log('ℹ️ No customer email provided, skipping confirmation email.');
        return;
    }
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: leadData.email,
        subject: 'Thank You for Contacting Premium Roofing',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0ea5e9;">Thank You, ${leadData.name.split(' ')[0]}!</h2>
                <p>We've received your inquiry and will get back to you within 24 hours.</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Your Submission Details:</h3>
                    <p><strong>Service:</strong> ${leadData.serviceType || 'General Inquiry'}</p>
                    ${leadData.roofType ? `<p><strong>Roof Type:</strong> ${leadData.roofType}</p>` : ''}
                    <p><strong>Contact Phone:</strong> ${leadData.phone}</p>
                </div>
                <p>If you have any urgent questions, please call us at <strong>604-720-4313</strong></p>
                <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
                    Premium Roofing - Quality materials designed to protect your investment for decades
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Confirmation email sent to customer');
    } catch (error) {
        console.error('❌ Customer email error:', error);
    }
};

module.exports = {
    sendLeadNotification,
    sendCustomerConfirmation,
};
