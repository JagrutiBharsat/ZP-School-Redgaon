// API configuration is loaded from config.js
function togglePassword() {
  let pass = document.getElementById("password");
  pass.type = pass.type === "password" ? "text" : "password";
}

async function registerUser(e) {
  e.preventDefault();

  const name     = document.getElementById("name").value.trim();
  const email    = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm  = document.getElementById("confirmPassword").value;
  const msg      = document.getElementById("msg");

  if (password !== confirm) {
    msg.style.color = "red";
    msg.innerText = "❌ Passwords do not match";
    return;
  }

  msg.style.color = "#888";
  msg.innerText = "Please wait...";

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("loggedInUser", JSON.stringify(data.student));

      msg.style.color = "#4ade80";
      msg.innerText = "✅ Account Created Successfully";

      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } else {
      msg.style.color = "#f87171";
      msg.innerText = "❌ " + data.message;
    }
  } catch (err) {
    msg.style.color = "#f87171";
    msg.innerText = "❌ Server error. Is the backend running?";
  }
}
