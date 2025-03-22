const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
admin.initializeApp();

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deepanshutyagi0784@gmail.com", // Change this
    pass: "zrarjccvekuikiww", // Use app password for Gmail
  },
});

// Using v2 syntax
exports.sendOTP = onDocumentCreated("otps/{otpId}", async (event) => {
  const otpData = event.data.data();

  const mailOptions = {
    from: "College Election System"+
    "<deepanshutyagi0784@gmail.com>",
    to: otpData.email,
    subject: "Your OTP for College Election System",
    html: `
      <h2>College Election System</h2>
      <p>Your One-Time Password is: <strong>${otpData.otp}</strong></p>
      <p>This OTP will expire in 10 minutes.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return null;
  } catch (error) {
    console.error("Error sending email:", error);
    return null;
  }
});
