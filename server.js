// require("dotenv").config();
// const express = require("express");
// const nodemailer = require("nodemailer");
// const multer = require("multer");
// const cors = require("cors");
// const mysql = require("mysql2");

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// // ✅ MySQL Connection
// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME
// });

// db.connect((err) => {
//   if (err) {
//     console.log("Database connection failed ❌", err);
//   } else {
//     console.log("MySQL Connected ✅");
//   }
// });

// // ✅ File upload config
// const upload = multer({ dest: "uploads/" });

// // ✅ Contact Route
// app.post("/contact", upload.single("file"), async (req, res) => {

//   const { name, email, phone, subject, purpose, message, linkedin, github, portfolio } = req.body;

//   console.log("📩 Recruiter Email Received:", email);

//   if (!name || !email || !message) {
//     return res.status(400).json({ message: "All fields are required!" });
//   }

//   try {

//     // ===============================
//     // 1️⃣ SAVE DATA TO MYSQL
//     // ===============================
//     const sql = `
//     INSERT INTO contacts 
//     (name, email, phone, subject, purpose, message, linkedin, github, portfolio, file_path)
//     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
//     `;

//     const values = [
//       name,
//       email,
//       phone,
//       subject,
//       purpose,
//       message,
//       linkedin,
//       github,
//       portfolio,
//       req.file ? req.file.path : null
//     ];

//     await db.promise().query(sql, values);
//     console.log("Data Saved in MySQL ✅");


//     // ===============================
//     // 2️⃣ SEND EMAIL
//     // ===============================
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     });

//     // 📩 Mail to Admin
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: process.env.EMAIL_USER,
//       subject: "🚀 New Contact Form Submission",
//       html: `
//         <h2>🚀 New Recruiter Submission</h2>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Phone:</strong> ${phone}</p>
//         <p><strong>Subject:</strong> ${subject}</p>
//         <p><strong>Purpose:</strong> ${purpose}</p>
//         <p><strong>Message:</strong> ${message}</p>

//         <hr/>

//         <p><strong>LinkedIn:</strong> ${linkedin || "Not Provided"}</p>
//         <p><strong>GitHub:</strong> ${github || "Not Provided"}</p>
//         <p><strong>Portfolio:</strong> ${portfolio || "Not Provided"}</p>
//       `,
//       attachments: req.file
//         ? [{
//             filename: req.file.originalname,
//             path: req.file.path
//           }]
//         : []
//     });

//     console.log("Admin mail sent ✅");

//     // 📩 Auto Reply (Safe Mode)
//     // 📩 Auto Reply (With Full Message Included)
// // 📩 Auto Reply with Full Form Details
// try {

//   const safeMessage = message
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/\n/g, "<br>");

//   await transporter.sendMail({
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: "✅ We Received Your Message",
//     html: `
//       <h2>Hello ${name},</h2>

//       <p>Thank you for contacting us 🙌</p>

//       <h3>Your Submitted Details:</h3>

//       <p><strong>Email:</strong> ${email}</p>
//       <p><strong>Phone:</strong> ${phone}</p>
//       <p><strong>Subject:</strong> ${subject}</p>
//       <p><strong>Purpose:</strong> ${purpose}</p>

//       <p><strong>Your Message:</strong></p>

//       <div style="
//         background:#f4f4f4;
//         padding:15px;
//         border-radius:8px;
//         font-size:14px;
//         color:#000;
//       ">
//         ${safeMessage}
//       </div>

//       <br/>
//       <p>We will review your message and get back to you shortly.</p>

//       <hr/>
//       <p>Best Regards,<br/>Upam Kumar</p>
//     `
//   });

//   console.log("Auto reply sent ✅");

// } catch (autoErr) {
//   console.log("Auto reply failed ❌", autoErr.message);
// }

//     res.json({ message: "Message sent successfully ✅" });

//   } catch (error) {
//     console.log("FULL ERROR:", error.message);
//     res.status(500).json({ message: "Error sending email ❌" });
//   }
// });

// app.listen(5000, () => {
//   console.log("Server running at http://localhost:5000");
// });


require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Routes
const contactRoutes = require("./routes/contactRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/contact", contactRoutes);
app.use("/admin", adminRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

