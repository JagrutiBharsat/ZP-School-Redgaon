const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

// ── ICONS ─────────────────────────────────────────────────
feather.replace();

// ── NAVIGATION ────────────────────────────────────────────
function goToPage(page) { window.location.href = page; }

// ── SIDEBAR TOGGLE ────────────────────────────────────────
document.getElementById("menuToggle").onclick = () => {
  document.getElementById("layout").classList.toggle("sidebar-hidden");
};

// ── CLOCK ─────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById("clock").innerHTML =
    now.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }) +
    " &nbsp;|&nbsp; " +
    now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", second:"2-digit" });
}
setInterval(updateClock, 1000);
updateClock();

// ── HEADER DATE ───────────────────────────────────────────
document.getElementById("headerDate").innerText =
  new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

// ── USER INFO (sidebar only) ──────────────────────────────
const userData    = JSON.parse(localStorage.getItem("loggedInUser"));
const displayName = userData?.name  || "Admin";
const displayEmail= userData?.email || "";
const initial     = displayName.charAt(0).toUpperCase();

document.getElementById("username").innerText    = displayName;
document.getElementById("userEmail").innerText   = displayEmail;
document.getElementById("welcomeName").innerText = displayName;
document.getElementById("sideAvatar").innerText  = initial;

// ── LOGOUT ────────────────────────────────────────────────
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
  }
}

// ── ACTIVITY FEED ─────────────────────────────────────────
function addActivity(message, type = "blue-light", icon = "info") {
  const feed = document.getElementById("activityFeed");
  // remove placeholder
  const placeholder = feed.querySelector(".activity-item");
  if (placeholder && placeholder.querySelector('[data-feather="loader"]')) placeholder.remove();

  const item = document.createElement("div");
  item.className = `activity-item ${type}`;
  item.innerHTML = `<i data-feather="${icon}"></i><span>${message}</span>`;
  feed.prepend(item);
  feather.replace();
  while (feed.children.length > 6) feed.removeChild(feed.lastChild);
}

// ── STUDENT COUNT ─────────────────────────────────────────
async function loadStudentCount() {
  try {
    const res  = await fetch(`${API}/students`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    if (data.success) {
      const count = data.students.length;
      document.getElementById("studentCount").innerText = count;
      document.getElementById("studentTrend").innerText = `${count} enrolled student${count !== 1 ? "s" : ""}`;
      document.getElementById("miniTotal").innerText    = count;

      // marks completion bar (rough: marks records vs students*5 subjects)
      const marksEl = document.getElementById("marksCount");
      const marksVal = parseInt(marksEl.innerText) || 0;
      const expected = count * 5;
      if (expected > 0) {
        const pct = Math.min(100, Math.round((marksVal / expected) * 100));
        document.getElementById("progressMarks").style.width = pct + "%";
        document.getElementById("marksPct").innerText = pct + "%";
      }

      addActivity(`${count} student(s) enrolled in the system`, "blue-light", "users");
    } else {
      document.getElementById("studentCount").innerText = "—";
    }
  } catch {
    document.getElementById("studentCount").innerText = "—";
  }
}

// ── TODAY'S ATTENDANCE ────────────────────────────────────
async function loadAttendanceCount() {
  try {
    const today = new Date().toISOString().split("T")[0];
    const res   = await fetch(`${API}/attendance?date=${today}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    if (data.success) {
      const total   = data.records.length;
      const present = data.records.filter(r => r.status === "Present").length;
      const absent  = total - present;
      const pct     = total ? Math.round((present / total) * 100) : 0;

      document.getElementById("attendanceCount").innerText = present;
      document.getElementById("attTrend").innerText        = total ? `${pct}% attendance rate` : "No records today";
      document.getElementById("attPct").innerText          = pct + "%";
      document.getElementById("progressAtt").style.width   = pct + "%";
      document.getElementById("miniPresent").innerText     = present;
      document.getElementById("miniAbsent").innerText      = absent;

      const actType = pct >= 75 ? "green-light" : pct >= 50 ? "orange-light" : "red-light";
      addActivity(`Today: ${present} present, ${absent} absent (${pct}%)`, actType, "check-circle");
    } else {
      document.getElementById("attendanceCount").innerText = "0";
      document.getElementById("attTrend").innerText        = "No attendance today";
      document.getElementById("miniPresent").innerText     = "0";
      document.getElementById("miniAbsent").innerText      = "0";
    }
  } catch {
    document.getElementById("attendanceCount").innerText = "0";
  }
}

// ── MARKS COUNT ───────────────────────────────────────────
async function loadMarksCount() {
  try {
    const res  = await fetch(`${API}/marks`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById("marksCount").innerText = data.count;
      addActivity(`${data.count} marks record(s) in the system`, "gray-light", "file-text");
    } else {
      document.getElementById("marksCount").innerText = "0";
    }
  } catch {
    document.getElementById("marksCount").innerText = "0";
  }
}

// ── PROGRESS ANIMATION ────────────────────────────────────
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("progress").style.width = "75%";
  }, 500);
});

// ── INIT ──────────────────────────────────────────────────
loadMarksCount();
loadAttendanceCount();
loadStudentCount();
