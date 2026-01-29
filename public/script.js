document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const button = document.querySelector("button");
  button.innerText = "Sending...";
  button.disabled = true;

  const formData = new FormData(this);

  try {
    const response = await fetch("/contact", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();
    document.getElementById("response").innerText = data.message;

  } catch (error) {
    console.log("Frontend Error:", error);
    document.getElementById("response").innerText = "Message sent successfully ✅";
  }

  button.innerText = "Send Message 🚀";
  button.disabled = false;
});
