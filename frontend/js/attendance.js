const API      = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

let currentStudents = []; // students loaded for marking

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = "toast"; }, 3000);
}

// ── TAB SWITCH ────────────────────────────────────────────
function switchTab(tab) {
  ["mark","view","summary"].forEach(t => {
    document.getElementById("panel" + t.charAt(0).toUpperCase() + t.slice(1)).style.display = "none";
    document.getElementById("tab"   + t.charAt(0).toUpperCase() + t.slice(1)).classList.remove("active");
  });
  document.getElementById("panel"  + tab.charAt(0).toUpperCase() + tab.slice(1)).style.display = "block";
  document.getElementById("tab"    + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add("active");
  if (typeof feather !== "undefined") feather.replace();
}

// ── PHOTO CELL ────────────────────────────────────────────
function photoCell(s) {
  if (s.image && s.image.startsWith("data:"))
    return `<img src="${s.image}" alt="${s.name}">`;
  return `<div class="att-avatar-icon"><i data-feather="user"></i></div>`;
}

// ── LOAD STUDENTS FOR MARKING ─────────────────────────────
async function loadStudents() {
  const cls  = document.getElementById("classFilter").value;
  const date = document.getElementById("attendanceDate").value;

  if (!cls)  { showToast("Please select a class", "error");  return; }
  if (!date) { showToast("Please select a date",  "error");  return; }

  // ── CHECK HOLIDAY / SUNDAY FIRST ──────────────────────
  try {
    const hRes  = await fetch(`${API}/holidays/check?date=${date}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const hData = await hRes.json();

    const banner = document.getElementById("holidayBanner");
    if (hData.isHoliday) {
      banner.style.display = "flex";
      document.getElementById("holidayTitle").innerText  = "🎉 Holiday — Attendance Not Required";
      document.getElementById("holidayReason").innerText = hData.reason;

      // Hide attendance UI, show only banner
      document.getElementById("attCards").style.display     = "none";
      document.getElementById("quickMark").style.display    = "none";
      document.getElementById("attTableWrap").style.display = "none";
      document.getElementById("attSaveRow").style.display   = "none";
      document.getElementById("attEmpty").style.display     = "none";
      currentStudents = [];
      if (typeof feather !== "undefined") feather.replace();
      return;
    } else {
      banner.style.display = "none";
    }
  } catch {
    // If holiday check fails, continue — don't block attendance
    document.getElementById("holidayBanner").style.display = "none";
  }

  showToast("Loading students...", "info");

  try {
    // Fetch students for the class
    const sRes  = await fetch(`${API}/students`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const sData = await sRes.json();
    if (!sData.success) { showToast("Failed to load students", "error"); return; }

    currentStudents = sData.students
      .filter(s => s.class === cls)
      .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));

    if (currentStudents.length === 0) {
      showToast("No students found in " + cls, "error");
      return;
    }

    // Fetch existing attendance for this class + date
    const aRes  = await fetch(`${API}/attendance?class=${encodeURIComponent(cls)}&date=${date}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const aData = await aRes.json();

    // Build a map: studentId → status
    const existingMap = {};
    if (aData.success) {
      aData.records.forEach(r => {
        existingMap[r.studentId._id || r.studentId] = r.status;
      });
    }

    // Render table
    renderMarkTable(currentStudents, existingMap, date);

    // Show UI elements
    document.getElementById("attCards").style.display    = "grid";
    document.getElementById("quickMark").style.display   = "flex";
    document.getElementById("attTableWrap").style.display = "block";
    document.getElementById("attSaveRow").style.display  = "flex";
    document.getElementById("attEmpty").style.display    = "none";

    updateCounts();
    showToast(`Loaded ${currentStudents.length} students`, "success");
    if (typeof feather !== "undefined") feather.replace();

  } catch (err) {
    showToast("Server error. Is the backend running?", "error");
  }
}

// ── RENDER MARK TABLE ─────────────────────────────────────
function renderMarkTable(students, existingMap, date) {
  const tbody = document.getElementById("attendanceTable");
  let rows = "";

  students.forEach((s, i) => {
    const saved = existingMap[s._id] || "Present";

    const pChk = saved === "Present" ? "checked" : "";
    const aChk = saved === "Absent"  ? "checked" : "";
    const pCls = saved === "Present" ? "checked-present" : "";
    const aCls = saved === "Absent"  ? "checked-absent"  : "";

    rows += `<tr id="row-${s._id}">
      <td>${i + 1}</td>
      <td>${photoCell(s)}</td>
      <td><strong>${s.name}</strong></td>
      <td>${s.rollNo || "—"}</td>
      <td>
        <label class="radio-label radio-present ${pCls}" id="lbl-P-${s._id}" onclick="setStatus('${s._id}','Present')">
          <input type="radio" name="att-${s._id}" value="Present" ${pChk}>
          ✓ Present
        </label>
      </td>
      <td>
        <label class="radio-label radio-absent ${aCls}" id="lbl-A-${s._id}" onclick="setStatus('${s._id}','Absent')">
          <input type="radio" name="att-${s._id}" value="Absent" ${aChk}>
          ✗ Absent
        </label>
      </td>
    </tr>`;
  });

  tbody.innerHTML = rows;
}

// ── SET STATUS (highlight selected label) ─────────────────
function setStatus(studentId, status) {
  ["Present","Absent"].forEach(s => {
    const prefix = s === "Present" ? "P" : "A";
    const lbl = document.getElementById(`lbl-${prefix}-${studentId}`);
    if (!lbl) return;
    lbl.classList.remove("checked-present","checked-absent");
  });

  const prefix = status === "Present" ? "P" : "A";
  const cls    = status === "Present" ? "checked-present" : "checked-absent";
  const lbl    = document.getElementById(`lbl-${prefix}-${studentId}`);
  if (lbl) lbl.classList.add(cls);

  const radio = document.querySelector(`input[name="att-${studentId}"][value="${status}"]`);
  if (radio) radio.checked = true;

  updateCounts();
}

// ── MARK ALL ──────────────────────────────────────────────
function markAll(status) {
  currentStudents.forEach(s => setStatus(s._id, status));
}

// ── UPDATE COUNTS ─────────────────────────────────────────
function updateCounts() {
  let present = 0, absent = 0;
  currentStudents.forEach(s => {
    const checked = document.querySelector(`input[name="att-${s._id}"]:checked`);
    if (!checked) return;
    if (checked.value === "Present") present++;
    else if (checked.value === "Absent") absent++;
  });
  document.getElementById("totalStudents").innerText   = currentStudents.length;
  document.getElementById("presentStudents").innerText = present;
  document.getElementById("absentStudents").innerText  = absent;
}

// ── SAVE ATTENDANCE ───────────────────────────────────────
async function saveAttendance() {
  const date = document.getElementById("attendanceDate").value;
  if (!date) { showToast("No date selected", "error"); return; }
  if (currentStudents.length === 0) { showToast("No students loaded", "error"); return; }

  const records = currentStudents.map(s => {
    const checked = document.querySelector(`input[name="att-${s._id}"]:checked`);
    return {
      studentId: s._id,
      date,
      status: checked ? checked.value : "Present"
    };
  });

  try {
    const res  = await fetch(`${API}/attendance/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({ records })
    });
    const data = await res.json();
    if (data.success) {
      showToast("✅ " + data.message, "success");
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch {
    showToast("❌ Server error. Is the backend running?", "error");
  }
}

// ── VIEW RECORDS ──────────────────────────────────────────
async function loadRecords() {
  const cls  = document.getElementById("viewClassFilter").value;
  const date = document.getElementById("viewDate").value;

  let url = `${API}/attendance?`;
  if (cls)  url += `class=${encodeURIComponent(cls)}&`;
  if (date) url += `date=${date}`;

  try {
    const res  = await fetch(url, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    const tbody = document.getElementById("recordsTable");

    if (!data.success || data.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="att-empty-row">No records found</td></tr>`;
      return;
    }

    const sorted = data.records.sort((a, b) =>
      (parseInt(a.studentId?.rollNo) || 0) - (parseInt(b.studentId?.rollNo) || 0)
    );

    let rows = "";
    sorted.forEach((r, i) => {
      const s   = r.studentId;
      const bdg = r.status === "Present" ? "badge-present" : r.status === "Absent" ? "badge-absent" : "badge-late";
      rows += `<tr>
        <td>${i + 1}</td>
        <td>${s?.name || "—"}</td>
        <td>${s?.rollNo || "—"}</td>
        <td>${s?.class || "—"}</td>
        <td>${r.date}</td>
        <td><span class="${bdg}">${r.status}</span></td>
      </tr>`;
    });
    tbody.innerHTML = rows;
    showToast(`${data.records.length} records found`, "success");
  } catch {
    showToast("❌ Server error", "error");
  }
}

// ── SUMMARY ───────────────────────────────────────────────
async function loadSummary() {
  const cls   = document.getElementById("sumClassFilter").value;
  const month = document.getElementById("sumMonth").value; // "YYYY-MM"

  let url = `${API}/attendance/summary?`;
  if (cls)   url += `class=${encodeURIComponent(cls)}&`;
  if (month) {
    const [yr, mo] = month.split("-");
    url += `year=${yr}&month=${mo}`;
  }

  try {
    const res  = await fetch(url, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    const tbody = document.getElementById("summaryTable");

    if (!data.success || data.summary.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="att-empty-row">No data found</td></tr>`;
      document.getElementById("sumCards").style.display = "none";
      return;
    }

    // Compute summary stats
    const total    = data.summary.length;
    const avgPct   = (data.summary.reduce((s, r) => s + parseFloat(r.percentage), 0) / total).toFixed(1);
    const above75  = data.summary.filter(r => parseFloat(r.percentage) >= 75).length;
    const below75  = total - above75;

    document.getElementById("sumTotal").innerText   = total;
    document.getElementById("sumAvgPct").innerText  = avgPct + "%";
    document.getElementById("sumAbove75").innerText = above75;
    document.getElementById("sumBelow75").innerText = below75;
    document.getElementById("sumCards").style.display = "grid";

    const sortedSummary = data.summary.sort((a, b) =>
      (parseInt(a.student.rollNo) || 0) - (parseInt(b.student.rollNo) || 0)
    );

    let rows = "";
    sortedSummary.forEach((r, i) => {
      const pct  = parseFloat(r.percentage);
      const barCls  = pct >= 75 ? "pct-good" : pct >= 50 ? "pct-warn" : "pct-bad";
      const statCls = pct >= 75 ? "status-good" : pct >= 50 ? "status-warn" : "status-bad";
      const statTxt = pct >= 75 ? "Regular" : pct >= 50 ? "Warning" : "Critical";

      rows += `<tr>
        <td>${i + 1}</td>
        <td><strong>${r.student.name}</strong></td>
        <td>${r.student.rollNo || "—"}</td>
        <td>${r.student.class}</td>
        <td>${r.total}</td>
        <td>${r.present}</td>
        <td>${r.absent}</td>
        <td>
          <div class="pct-wrap">
            <div class="pct-bar"><div class="pct-fill ${barCls}" style="width:${pct}%"></div></div>
            <span style="font-size:12px;font-weight:700;min-width:38px">${pct}%</span>
          </div>
        </td>
        <td><span class="${statCls}">${statTxt}</span></td>
      </tr>`;
    });
    tbody.innerHTML = rows;
    showToast(`Summary for ${total} students`, "success");
  } catch {
    showToast("❌ Server error", "error");
  }
}

// ── HOLIDAY: LOAD LIST ────────────────────────────────────
async function loadHolidays() {
  try {
    const res  = await fetch(`${API}/holidays`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    const tbody = document.getElementById("holidayList");

    if (!data.success || data.holidays.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="att-empty-row">No holidays added yet</td></tr>`;
      return;
    }

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    let rows = "";
    data.holidays.forEach((h, i) => {
      const [yr, mo, dy] = h.date.split("-").map(Number);
      const dayName = days[new Date(yr, mo - 1, dy).getDay()]; // local time parse
      const isSun   = dayName === "Sunday";
      rows += `<tr>
        <td>${i + 1}</td>
        <td><strong>${h.date}</strong></td>
        <td><span class="${isSun ? "badge-sunday" : "badge-holiday"}">${dayName}</span></td>
        <td>${h.description}</td>
        <td>
          <button class="hol-del-btn" onclick="deleteHoliday('${h._id}')">
            <i data-feather="trash-2"></i> Remove
          </button>
        </td>
      </tr>`;
    });
    tbody.innerHTML = rows;
    if (typeof feather !== "undefined") feather.replace();
  } catch {
    // silent fail
  }
}

// ── HOLIDAY: ADD ──────────────────────────────────────────
async function addHoliday() {
  const date = document.getElementById("holidayDate").value;
  const desc = document.getElementById("holidayDesc").value.trim();

  if (!date) { showToast("Select a date for the holiday", "error"); return; }
  if (!desc) { showToast("Enter a reason / description",  "error"); return; }

  try {
    const res  = await fetch(`${API}/holidays`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
      },
      body: JSON.stringify({ date, description: desc })
    });
    const data = await res.json();
    if (data.success) {
      showToast("✅ Holiday added: " + desc, "success");
      document.getElementById("holidayDate").value = "";
      document.getElementById("holidayDesc").value = "";
      loadHolidays();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch {
    showToast("❌ Server error", "error");
  }
}

// ── HOLIDAY: DELETE ───────────────────────────────────────
async function deleteHoliday(id) {
  if (!confirm("Remove this holiday?")) return;
  try {
    const res  = await fetch(`${API}/holidays/${id}`, {
      method: "DELETE",
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    if (data.success) {
      showToast("Holiday removed", "success");
      loadHolidays();
    } else {
      showToast("❌ " + data.message, "error");
    }
  } catch {
    showToast("❌ Server error", "error");
  }
}

// ── AUTO-LOAD HOLIDAYS ON PAGE LOAD ──────────────────────
document.addEventListener("DOMContentLoaded", () => {
  loadHolidays();
});
