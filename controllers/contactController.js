const db = require("../config/db");
const nodemailer = require("nodemailer");

exports.submitContact = async (req, res) => {

  const {
    name,
    email,
    phone,
    subject,
    purpose,
    message,
    linkedin,
    github,
    portfolio
  } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Required fields missing ❌" });
  }

  try {

    // =============================
    // 1️⃣ SAVE DATA TO DATABASE
    // =============================
    const sql = `
      INSERT INTO contacts
      (name, email, phone, subject, purpose, message, linkedin, github, portfolio, file_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      email,
      phone || null,
      subject || null,
      purpose || null,
      message,
      linkedin || null,
      github || null,
      portfolio || null,
      req.file ? req.file.path : null
    ];

    await db.promise().query(sql, values);

    // =============================
    // 2️⃣ MAIL SETUP
    // =============================
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // =============================
    // 3️⃣ MAIL TO ADMIN
    // =============================
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "🚀 New Recruiter Submission",
      html: `
        <h2>New Recruiter Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not Provided"}</p>
        <p><strong>Subject:</strong> ${subject || "Not Provided"}</p>
        <p><strong>Purpose:</strong> ${purpose || "Not Provided"}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    });

    // =============================
    // 4️⃣ SAFE MESSAGE FORMAT
    // =============================
    const safeMessage = message
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

    // =============================
    // 5️⃣ AUTO REPLY TO USER
    // =============================
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "✅ We Received Your Message",
      html: `
        <h2>Hello ${name},</h2>

        <p>Thank you for contacting us 🙌</p>

        <h3>Your Submitted Details:</h3>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "Not Provided"}</p>
        <p><strong>Subject:</strong> ${subject || "Not Provided"}</p>
        <p><strong>Purpose:</strong> ${purpose || "Not Provided"}</p>

        <p><strong>Your Message:</strong></p>

        <div style="
          background:#f4f4f4;
          padding:15px;
          border-radius:8px;
          font-size:14px;
          color:#000;
        ">
          ${safeMessage}
        </div>

        <br/>
        <p>We will review your message and get back to you shortly.</p>

        <hr/>
        <p>Best Regards,<br/>Upam Kumar</p>
      `
    });

    res.json({ message: "Form submitted & Email sent ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error ❌" });
  }
};
