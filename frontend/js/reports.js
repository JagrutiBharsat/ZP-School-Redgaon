// API configuration is loaded from config.js
const getToken = () => localStorage.getItem("token");
const CLASSES  = ["Class 1","Class 2","Class 3","Class 4","Class 5","Class 6","Class 7"];
const EXAMS    = ["Unit Test-1","First Semester","Unit Test-2","Second Semester"];

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = "toast"; }, 3000);
}

// ── TAB SWITCH ────────────────────────────────────────────
function switchTab(tab) {
  ["strength","attendance","result","progress"].forEach(t => {
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    document.getElementById("panel" + cap).style.display = "none";
    document.getElementById("tab"   + cap).classList.remove("active");
  });
  const cap = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById("panel" + cap).style.display = "block";
  document.getElementById("tab"   + cap).classList.add("active");
  if (typeof feather !== "undefined") feather.replace();
}

// ── GRADE ─────────────────────────────────────────────────
function getGrade(pct) {
  if (pct >= 91) return { label:"A1", cls:"g-a1" };
  if (pct >= 81) return { label:"A2", cls:"g-a2" };
  if (pct >= 71) return { label:"B1", cls:"g-b1" };
  if (pct >= 61) return { label:"B2", cls:"g-b2" };
  if (pct >= 51) return { label:"C1", cls:"g-c1" };
  if (pct >= 41) return { label:"C2", cls:"g-c2" };
  return           { label:"Fail", cls:"g-fail" };
}

// ── STAT CARD HTML ────────────────────────────────────────
function statCard(icon, label, value, colorCls) {
  return `<div class="rp-card ${colorCls}">
    <div class="rp-card-icon"><i data-feather="${icon}"></i></div>
    <div><span>${value}</span><small>${label}</small></div>
  </div>`;
}

// ── PRINT SECTION ─────────────────────────────────────────
function printSection(id) {
  const el = document.getElementById(id);
  const orig = document.body.innerHTML;
  document.body.innerHTML = el.innerHTML;
  window.print();
  document.body.innerHTML = orig;
  window.location.reload();
}

// ── DOWNLOAD CSV ──────────────────────────────────────────
function downloadCSV(contentId, filename) {
  const table = document.querySelector(`#${contentId} table`);
  if (!table) { showToast("No table to download", "error"); return; }

  let csv = "";
  table.querySelectorAll("tr").forEach(row => {
    const cols = [...row.querySelectorAll("th,td")].map(c =>
      `"${c.innerText.replace(/"/g,'""')}"`
    );
    csv += cols.join(",") + "\n";
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const a    = document.createElement("a");
  a.href     = URL.createObjectURL(blob);
  a.download = `${filename}-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  showToast("Downloaded as CSV", "success");
}

// ══════════════════════════════════════════════════════════
// TAB 1 — STUDENT STRENGTH
// ══════════════════════════════════════════════════════════
async function loadStrength() {
  showToast("Generating...", "info");
  try {
    const res  = await fetch(`${API}/students`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    if (!data.success) { showToast("Failed to load students", "error"); return; }

    const students = data.students;
    const total    = students.length;
    const male     = students.filter(s => s.gender === "Male").length;
    const female   = students.filter(s => s.gender === "Female").length;

    // Summary cards
    document.getElementById("strengthCards").innerHTML =
      statCard("users",      "Total Students", total,  "rpc-violet") +
      statCard("user",       "Male",           male,   "rpc-blue")   +
      statCard("user",       "Female",         female, "rpc-rose")   +
      statCard("layers",     "Classes",        7,      "rpc-amber");

    // Class-wise breakdown
    let rows = "";
    let totals = { total:0, male:0, female:0, OPEN:0, OBC:0, SC:0, ST:0, NT:0 };

    CLASSES.forEach(cls => {
      const cl = students.filter(s => s.class === cls);
      const m  = cl.filter(s => s.gender === "Male").length;
      const f  = cl.filter(s => s.gender === "Female").length;
      const OPEN = cl.filter(s => s.caste === "OPEN").length;
      const OBC  = cl.filter(s => s.caste === "OBC").length;
      const SC   = cl.filter(s => s.caste === "SC").length;
      const ST   = cl.filter(s => s.caste === "ST").length;
      const NT   = cl.filter(s => s.caste === "NT").length;

      totals.total += cl.length; totals.male += m; totals.female += f;
      totals.OPEN += OPEN; totals.OBC += OBC; totals.SC += SC;
      totals.ST += ST; totals.NT += NT;

      rows += `<tr>
        <td><strong>${cls}</strong></td>
        <td><strong>${cl.length}</strong></td>
        <td>${m}</td><td>${f}</td>
        <td>${OPEN}</td><td>${OBC}</td><td>${SC}</td><td>${ST}</td><td>${NT}</td>
      </tr>`;
    });

    rows += `<tr style="background:#f5f3ff;font-weight:800;">
      <td>TOTAL</td>
      <td>${totals.total}</td><td>${totals.male}</td><td>${totals.female}</td>
      <td>${totals.OPEN}</td><td>${totals.OBC}</td><td>${totals.SC}</td>
      <td>${totals.ST}</td><td>${totals.NT}</td>
    </tr>`;

    document.getElementById("strengthBody").innerHTML = rows;
    document.getElementById("strengthDate").innerText =
      new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

    document.getElementById("strengthContent").style.display = "block";
    document.getElementById("strengthEmpty").style.display   = "none";
    document.getElementById("strengthPrint").style.display   = "flex";
    showToast("Strength report generated", "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch {
    showToast("Server error. Is the backend running?", "error");
  }
}

// ══════════════════════════════════════════════════════════
// TAB 2 — ATTENDANCE REPORT
// ══════════════════════════════════════════════════════════
async function loadAttendanceReport() {
  const month = document.getElementById("attMonth").value;
  const cls   = document.getElementById("attClass").value;
  if (!month) { showToast("Select a month", "error"); return; }

  showToast("Generating...", "info");
  try {
    const [yr, mo] = month.split("-");
    let url = `${API}/attendance/summary?year=${yr}&month=${mo}`;
    if (cls) url += `&class=${encodeURIComponent(cls)}`;

    const res  = await fetch(url, { headers: { "Authorization": "Bearer " + getToken() } });
    const data = await res.json();

    if (!data.success || !data.summary.length) {
      showToast("No attendance data found", "error"); return;
    }

    const sorted     = data.summary.sort((a,b) => (parseInt(a.student.rollNo)||0) - (parseInt(b.student.rollNo)||0));
    const total      = sorted.length;
    const avgPct     = (sorted.reduce((s,r) => s + parseFloat(r.percentage), 0) / total).toFixed(1);
    const defaulters = sorted.filter(r => parseFloat(r.percentage) < 75).length;
    const perfect    = sorted.filter(r => parseFloat(r.percentage) === 100).length;

    document.getElementById("attCards").innerHTML =
      statCard("users",         "Total Students", total,      "rpc-violet") +
      statCard("trending-up",   "Avg Attendance", avgPct+"%", "rpc-green")  +
      statCard("alert-triangle","Below 75%",      defaulters, "rpc-red")    +
      statCard("star",          "100% Present",   perfect,    "rpc-amber");

    if (defaulters > 0) {
      document.getElementById("defaulterBanner").style.display = "flex";
      document.getElementById("defaulterText").innerText =
        `⚠ ${defaulters} student(s) have attendance below 75% — action required.`;
    } else {
      document.getElementById("defaulterBanner").style.display = "none";
    }

    let rows = "";
    sorted.forEach((r, i) => {
      const pct  = parseFloat(r.percentage);
      const cls2 = pct >= 75 ? "pass-b" : pct >= 50 ? "warn-b" : "fail-b";
      const lbl  = pct >= 75 ? "Regular" : pct >= 50 ? "Warning" : "Defaulter";
      rows += `<tr>
        <td>${i+1}</td>
        <td><strong>${r.student.name}</strong></td>
        <td>${r.student.rollNo || "—"}</td>
        <td>${r.student.class}</td>
        <td>${r.total}</td>
        <td>${r.present}</td>
        <td>${r.absent}</td>
        <td><strong>${pct}%</strong></td>
        <td><span class="${cls2}">${lbl}</span></td>
      </tr>`;
    });
    document.getElementById("attBody").innerHTML = rows;

    const monthLabel = new Date(month + "-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    document.getElementById("attMonthLabel").innerText = monthLabel;
    document.getElementById("attDate").innerText =
      new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

    document.getElementById("attContent").style.display = "block";
    document.getElementById("attEmpty").style.display   = "none";
    document.getElementById("attPrint").style.display   = "flex";
    showToast(`${total} records loaded`, "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch {
    showToast("Server error. Is the backend running?", "error");
  }
}

// ══════════════════════════════════════════════════════════
// TAB 3 — EXAM RESULT REPORT
// ══════════════════════════════════════════════════════════
async function loadResultReport() {
  const cls  = document.getElementById("resClass").value;
  const exam = document.getElementById("resExam").value;

  showToast("Generating...", "info");
  try {
    let url = `${API}/marks?`;
    if (cls)  url += `class=${encodeURIComponent(cls)}&`;
    if (exam) url += `exam=${encodeURIComponent(exam)}`;

    const res  = await fetch(url, { headers: { "Authorization": "Bearer " + getToken() } });
    const data = await res.json();

    if (!data.success || !data.records.length) {
      showToast("No marks data found", "error"); return;
    }

    const sorted = data.records.sort((a,b) =>
      (parseInt(a.studentId?.rollNo)||0) - (parseInt(b.studentId?.rollNo)||0)
    );
    const total  = sorted.length;
    const pass   = sorted.filter(r => r.percentage >= 35).length;
    const avg    = (sorted.reduce((s,r) => s + r.percentage, 0) / total).toFixed(1);
    const topper = [...sorted].sort((a,b) => b.percentage - a.percentage)[0];

    document.getElementById("resCards").innerHTML =
      statCard("users",       "Total",    total,                          "rpc-violet") +
      statCard("check-circle","Passed",   pass,                           "rpc-green")  +
      statCard("x-circle",    "Failed",   total - pass,                   "rpc-red")    +
      statCard("trending-up", "Avg %",    avg + "%",                      "rpc-amber")  +
      statCard("award",       "Topper",   topper?.studentId?.name?.split(" ")[0] || "—", "rpc-blue");

    let rows = "";
    sorted.forEach((r, i) => {
      const s     = r.studentId;
      const grade = getGrade(r.percentage);
      const pass  = r.percentage >= 35;
      rows += `<tr>
        <td>${i+1}</td>
        <td><strong>${s?.name || "—"}</strong></td>
        <td>${s?.rollNo || "—"}</td>
        <td>${r.class}</td>
        <td>${r.exam}</td>
        <td><strong>${r.total}</strong></td>
        <td>${r.maxTotal}</td>
        <td><strong>${r.percentage}%</strong></td>
        <td><span class="${grade.cls}">${grade.label}</span></td>
        <td><span class="${pass ? "pass-b" : "fail-b"}">${pass ? "Pass" : "Fail"}</span></td>
      </tr>`;
    });
    document.getElementById("resBody").innerHTML = rows;

    const lbl = [cls, exam].filter(Boolean).join(" — ") || "All Classes / All Exams";
    document.getElementById("resLabel").innerText = lbl;
    document.getElementById("resDate").innerText  =
      new Date().toLocaleDateString("en-IN",{day:"2-digit",month:"long",year:"numeric"});

    document.getElementById("resContent").style.display = "block";
    document.getElementById("resEmpty").style.display   = "none";
    document.getElementById("resPrint").style.display   = "flex";
    showToast(`${total} records loaded`, "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch {
    showToast("Server error. Is the backend running?", "error");
  }
}

// ══════════════════════════════════════════════════════════
// TAB 4 — PROGRESS CARD
// ══════════════════════════════════════════════════════════
async function loadPCStudents() {
  const cls = document.getElementById("pcClass").value;
  const sel = document.getElementById("pcStudent");
  sel.innerHTML = `<option value="">Select Student</option>`;
  if (!cls) return;

  try {
    const res  = await fetch(`${API}/students`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();
    if (!data.success) return;
    data.students
      .filter(s => s.class === cls)
      .sort((a,b) => (parseInt(a.rollNo)||0) - (parseInt(b.rollNo)||0))
      .forEach(s => {
        sel.innerHTML += `<option value="${s._id}">${s.rollNo ? s.rollNo+" — " : ""}${s.name}</option>`;
      });
  } catch { /* silent */ }
}

async function loadProgressCard() {
  const cls = document.getElementById("pcClass").value;
  const sid = document.getElementById("pcStudent").value;
  if (!cls || !sid) { showToast("Select class and student", "error"); return; }

  showToast("Generating progress card...", "info");
  try {
    // Student
    const sRes  = await fetch(`${API}/students/${sid}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const sData = await sRes.json();
    if (!sData.success) { showToast("Student not found", "error"); return; }
    const st = sData.student;

    // Marks
    const mRes  = await fetch(`${API}/marks?studentId=${sid}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const mData = await mRes.json();
    const marks = mData.success ? mData.records : [];

    // Attendance summary
    const aRes  = await fetch(`${API}/attendance/summary?class=${encodeURIComponent(cls)}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const aData = await aRes.json();
    const attRec = aData.success
      ? aData.summary.find(r => r.student.id?.toString() === sid || r.student.id === sid)
      : null;
    const attPct = attRec ? attRec.percentage + "%" : "N/A";

    // Photo
    const photoHtml = st.image && st.image.startsWith("data:")
      ? `<img src="${st.image}" alt="${st.name}">`
      : `<div class="pc-photo-icon"><i data-feather="user"></i></div>`;

    // Exam boxes
    let examBoxes = "";
    let totalPctSum = 0, examCount = 0, bestPct = 0;

    EXAMS.forEach(exam => {
      const rec = marks.find(r => r.exam === exam);
      if (!rec) return;
      examCount++;
      totalPctSum += rec.percentage;
      if (rec.percentage > bestPct) bestPct = rec.percentage;

      const grade = getGrade(rec.percentage);
      const subMap = rec.subjects instanceof Object ? rec.subjects : {};
      let subRows = Object.entries(subMap).map(([sub, val]) =>
        `<div class="pc-sub-row"><span class="pc-subject-name">${sub}</span><span class="pc-subject-marks"><strong>${val}</strong></span></div>`
      ).join("");

      examBoxes += `<div class="pc-exam-box">
        <h5>
          <span>${exam}</span>
          <span>${rec.total}/${rec.maxTotal} &nbsp;
            <span class="${grade.cls}">${grade.label}</span>
          </span>
        </h5>
        ${subRows}
        <div class="pc-sub-row" style="margin-top:6px;border-top:2px solid #ede9fe;padding-top:6px;">
          <span><strong>Percentage</strong></span>
          <span><strong>${rec.percentage}%</strong></span>
        </div>
      </div>`;
    });

    if (!examBoxes) examBoxes = `<p style="color:#94a3b8;font-size:13px;grid-column:1/-1;">No marks recorded yet.</p>`;

    const avgPct   = examCount ? (totalPctSum / examCount).toFixed(1) : 0;
    const ovGrade  = getGrade(parseFloat(avgPct));
    const passAll  = marks.every(r => r.percentage >= 35);

    const html = `<div class="pc-wrap">
      <div class="pc-top">
        <div class="pc-logo">🎓</div>
        <div class="pc-school">
          <h2>Z.P. Primary School Redgaon</h2>
          <p>Tal. Niphad, Dist. Nashik &nbsp;|&nbsp; UDISE: 27201009401</p>
          <p style="margin-top:4px;font-size:13px;opacity:.8;">Progress Card — Academic Year 2025–26</p>
        </div>
      </div>

      <div class="pc-student">
        <div class="pc-photo">${photoHtml}</div>
        <div class="pc-details">
          <h3>${st.name}</h3>
          <div class="pc-meta">
            <span>Class: <strong>${st.class}</strong></span>
            <span>Roll No: <strong>${st.rollNo || "—"}</strong></span>
            <span>DOB: <strong>${st.dob || "—"}</strong></span>
            <span>Mother: <strong>${st.motherName || "—"}</strong></span>
          </div>
        </div>
        <div class="pc-att">
          <div class="att-pct">${attPct}</div>
          <small>Attendance</small>
        </div>
      </div>

      <div class="pc-marks">
        <h4>Examination Results</h4>
        <div class="pc-exam-grid">${examBoxes}</div>
      </div>

      <div class="pc-overall">
        <div class="pc-ov-item"><span>${examCount}</span><small>Exams</small></div>
        <div class="pc-ov-item"><span>${avgPct}%</span><small>Average</small></div>
        <div class="pc-ov-item"><span>${bestPct}%</span><small>Best Score</small></div>
        <div class="pc-ov-item">
          <span><span class="${ovGrade.cls}">${ovGrade.label}</span></span>
          <small>Overall Grade</small>
        </div>
      </div>

      <div class="pc-footer">
        <span>Class Teacher Signature: _______________</span>
        <span>Head Master Signature: _______________</span>
        <span>Parent Signature: _______________</span>
      </div>
    </div>`;

    document.getElementById("pcContent").innerHTML = html;
    document.getElementById("pcContent").style.display = "block";
    document.getElementById("pcEmpty").style.display   = "none";
    document.getElementById("pcPrint").style.display   = "flex";
    showToast("Progress card generated", "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch (e) {
    showToast("Server error. Is the backend running?", "error");
  }
}
