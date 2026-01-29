console.log("File is running...");

const bcrypt = require("bcryptjs");

bcrypt.hash("admin123", 10)
  .then(hash => {
    console.log("Generated Hash:");
    console.log(hash);
  })
  .catch(err => console.log(err));
smart-contact-form/smart-contact-form/hash.js
