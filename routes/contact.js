const router = require("express").Router();

router.post("/", async (req, res) => {
  const { name, email, subject, content } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      replyTo: email,
      subject: subject,
      html: `
        <h3>Message from ${name}</h3>
        <p><strong>Email:</strong> ${email}</p>
        <p>${content}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to send email." });
  }
});

module.exports = router;
