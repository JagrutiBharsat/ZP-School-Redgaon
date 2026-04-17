const API      = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

const EXAMS = ["Unit Test-1", "First Semester", "Unit Test-2", "Second Semester"];

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = "toast"; }, 3000);
}

// ── TAB SWITCH ────────────────────────────────────────────
function switchTab(tab) {
  ["performance","student","progress"].forEach(t => {
    const cap = t.charAt(0).toUpperCase() + t.slice(1);
    document.getElementById("panel" + cap).style.display = "none";
    document.getElementById("tab"   + cap).classList.remove("active");
  });
  const cap = tab.charAt(0).toUpperCase() + tab.slice(1);
  document.getElementById("panel" + cap).style.display = "block";
  document.getElementById("tab"   + cap).classList.add("active");
  if (typeof feather !== "undefined") feather.replace();
}

// ── GRADE HELPER ──────────────────────────────────────────
function getGrade(pct) {
  if (pct >= 90) return { label:"A+", cls:"g-ap" };
  if (pct >= 75) return { label:"A",  cls:"g-a"  };
  if (pct >= 60) return { label:"B",  cls:"g-b"  };
  if (pct >= 50) return { label:"C",  cls:"g-c"  };
  if (pct >= 35) return { label:"D",  cls:"g-d"  };
  return           { label:"F",  cls:"g-f"  };
}

// ── PHOTO CELL ────────────────────────────────────────────
function photoCell(s) {
  if (s?.image && s.image.startsWith("data:"))
    return `<img src="${s.image}" alt="${s.name}">`;
  return `<div class="ac-avatar-sm"><i data-feather="user"></i></div>`;
}

// ══════════════════════════════════════════════════════════
// TAB 1 — CLASS PERFORMANCE
// ══════════════════════════════════════════════════════════
async function loadPerformance() {
  const cls  = document.getElementById("perfClass").value;
  const exam = document.getElementById("perfExam").value;
  if (!cls || !exam) { showToast("Select class and exam", "error"); return; }

  showToast("Loading...", "info");
  try {
    const res  = await fetch(`${API}/marks?class=${encodeURIComponent(cls)}&exam=${encodeURIComponent(exam)}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const data = await res.json();

    document.getElementById("perfEmpty").style.display     = "none";
    document.getElementById("perfCards").style.display     = "grid";
    document.getElementById("gradeDist").style.display     = "flex";
    document.getElementById("perfTableWrap").style.display = "block";

    if (!data.success || !data.records.length) {
      document.getElementById("perfTable").innerHTML =
        `<tr><td colspan="9" class="ac-empty-row">No marks found for ${cls} — ${exam}</td></tr>`;
      resetPerfCards();
      if (typeof feather !== "undefined") feather.replace();
      return;
    }

    // Sort by percentage desc for ranking
    const ranked = [...data.records].sort((a, b) => b.percentage - a.percentage);
    const total  = ranked.length;
    const pass   = ranked.filter(r => r.percentage >= 35).length;
    const avg    = (ranked.reduce((s, r) => s + r.percentage, 0) / total).toFixed(1);
    const topper = ranked[0]?.studentId?.name?.split(" ")[0] || "—";

    // Grade distribution
    const dist = { "A+":0, "A":0, "B":0, "C":0, "D":0, "F":0 };
    ranked.forEach(r => { dist[getGrade(r.percentage).label]++; });

    document.getElementById("perfTotal").innerText  = total;
    document.getElementById("perfPass").innerText   = pass;
    document.getElementById("perfFail").innerText   = total - pass;
    document.getElementById("perfAvg").innerText    = avg + "%";
    document.getElementById("perfTopper").innerText = topper;
    document.getElementById("gdAP").innerText = dist["A+"];
    document.getElementById("gdA").innerText  = dist["A"];
    document.getElementById("gdB").innerText  = dist["B"];
    document.getElementById("gdC").innerText  = dist["C"];
    document.getElementById("gdD").innerText  = dist["D"];
    document.getElementById("gdF").innerText  = dist["F"];

    let rows = "";
    ranked.forEach((r, i) => {
      const s     = r.studentId;
      const grade = getGrade(r.percentage);
      const pass  = r.percentage >= 35;
      const rankBadge = i === 0 ? `<span class="rank-1">🥇 1</span>`
                      : i === 1 ? `<span class="rank-2">🥈 2</span>`
                      : i === 2 ? `<span class="rank-3">🥉 3</span>`
                      : `<strong>${i+1}</strong>`;
      rows += `<tr>
        <td>${rankBadge}</td>
        <td>${photoCell(s)}</td>
        <td><strong>${s?.name || "—"}</strong></td>
        <td>${s?.rollNo || "—"}</td>
        <td><strong>${r.total}</strong></td>
        <td>${r.maxTotal}</td>
        <td><strong>${r.percentage}%</strong></td>
        <td><span class="${grade.cls}">${grade.label}</span></td>
        <td><span class="${pass ? "pass-b" : "fail-b"}">${pass ? "Pass" : "Fail"}</span></td>
      </tr>`;
    });
    document.getElementById("perfTable").innerHTML = rows;
    showToast(`${total} students loaded`, "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch {
    showToast("Server error. Is the backend running?", "error");
  }
}

function resetPerfCards() {
  ["perfTotal","perfPass","perfFail","gdAP","gdA","gdB","gdC","gdD","gdF"]
    .forEach(id => { document.getElementById(id).innerText = "0"; });
  document.getElementById("perfAvg").innerText    = "0%";
  document.getElementById("perfTopper").innerText = "—";
}

// ══════════════════════════════════════════════════════════
// TAB 2 — STUDENT REPORT CARD
// ══════════════════════════════════════════════════════════
async function loadStudentDropdown() {
  const cls = document.getElementById("rcClass").value;
  const sel = document.getElementById("rcStudent");
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
      .sort((a, b) => (parseInt(a.rollNo)||0) - (parseInt(b.rollNo)||0))
      .forEach(s => {
        sel.innerHTML += `<option value="${s._id}">${s.rollNo ? s.rollNo + " — " : ""}${s.name}</option>`;
      });
  } catch { /* silent */ }
}

async function loadReportCard() {
  const cls = document.getElementById("rcClass").value;
  const sid = document.getElementById("rcStudent").value;
  if (!cls || !sid) { showToast("Select class and student", "error"); return; }

  showToast("Generating report card...", "info");
  try {
    // Fetch student details
    const sRes  = await fetch(`${API}/students/${sid}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const sData = await sRes.json();
    if (!sData.success) { showToast("Student not found", "error"); return; }
    const student = sData.student;

    // Fetch all marks for this student
    const mRes  = await fetch(`${API}/marks?studentId=${sid}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const mData = await mRes.json();

    // Fetch attendance summary
    const aRes  = await fetch(`${API}/attendance/summary?class=${encodeURIComponent(cls)}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const aData = await aRes.json();
    const attRecord = aData.success
      ? aData.summary.find(r => r.student.id === sid || r.student.id?.toString() === sid)
      : null;

    // Fill header
    if (student.image && student.image.startsWith("data:")) {
      document.getElementById("rcPhoto").innerHTML = `<img src="${student.image}" alt="${student.name}">`;
    }
    document.getElementById("rcName").innerText   = student.name;
    document.getElementById("rcClass2").innerText = student.class;
    document.getElementById("rcRoll").innerText   = student.rollNo || "—";

    const attPct = attRecord ? attRecord.percentage + "%" : "N/A";
    document.getElementById("rcAttPct").innerText = attPct;
    const attCircle = document.getElementById("rcAttCircle");
    const attNum = parseFloat(attRecord?.percentage || 0);
    attCircle.style.borderColor = attNum >= 75 ? "#10b981" : attNum >= 50 ? "#f59e0b" : "#ef4444";

    // Build exam cards
    const records = mData.success ? mData.records : [];
    let examHtml = "";
    let bestPct = 0, totalExams = 0, totalPctSum = 0;

    EXAMS.forEach(exam => {
      const rec = records.find(r => r.exam === exam);
      if (!rec) return;
      totalExams++;
      totalPctSum += rec.percentage;
      if (rec.percentage > bestPct) bestPct = rec.percentage;

      const grade = getGrade(rec.percentage);
      const subMap = rec.subjects instanceof Object ? rec.subjects : {};

      let subRows = "";
      Object.entries(subMap).forEach(([sub, val]) => {
        subRows += `<div class="rc-subject-row">
          <span class="rc-subject-name">${sub}</span>
          <span class="rc-subject-marks">${val}</span>
        </div>`;
      });

      examHtml += `<div class="rc-exam-card">
        <div class="rc-exam-title">
          <span>${exam}</span>
          <span class="rc-exam-pct">${rec.percentage}%</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;font-size:12px;color:#64748b;">
          <span>Total: <strong>${rec.total}/${rec.maxTotal}</strong></span>
          <span><span class="${grade.cls}">${grade.label}</span></span>
          <span class="${rec.percentage >= 35 ? "pass-b" : "fail-b"}">${rec.percentage >= 35 ? "Pass" : "Fail"}</span>
        </div>
        ${subRows}
      </div>`;
    });

    document.getElementById("rcExams").innerHTML = examHtml || `<p style="color:#94a3b8;font-size:14px;">No marks recorded yet.</p>`;

    // Overall summary
    const avgPct = totalExams ? (totalPctSum / totalExams).toFixed(1) : 0;
    const overallGrade = getGrade(parseFloat(avgPct));
    document.getElementById("rcSummary").innerHTML = `
      <h4><i data-feather="award" style="width:16px;height:16px;vertical-align:middle;margin-right:6px;"></i> Overall Academic Summary</h4>
      <div class="rc-summary-grid">
        <div class="rc-sum-item"><span>${totalExams}</span><small>Exams Taken</small></div>
        <div class="rc-sum-item"><span>${avgPct}%</span><small>Average %</small></div>
        <div class="rc-sum-item"><span>${bestPct}%</span><small>Best Score</small></div>
        <div class="rc-sum-item"><span><span class="${overallGrade.cls}">${overallGrade.label}</span></span><small>Overall Grade</small></div>
      </div>`;

    document.getElementById("reportCardWrap").style.display = "block";
    document.getElementById("rcEmpty").style.display        = "none";
    showToast("Report card generated", "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch (e) {
    showToast("Server error. Is the backend running?", "error");
  }
}

// ══════════════════════════════════════════════════════════
// TAB 3 — EXAM COMPARISON
// ══════════════════════════════════════════════════════════
async function loadComparison() {
  const cls = document.getElementById("cmpClass").value;
  if (!cls) { showToast("Select a class", "error"); return; }

  showToast("Loading comparison...", "info");
  try {
    // Fetch students
    const sRes  = await fetch(`${API}/students`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const sData = await sRes.json();
    const students = (sData.students || [])
      .filter(s => s.class === cls)
      .sort((a, b) => (parseInt(a.rollNo)||0) - (parseInt(b.rollNo)||0));

    if (!students.length) {
      showToast("No students in " + cls, "error"); return;
    }

    // Fetch all marks for this class
    const mRes  = await fetch(`${API}/marks?class=${encodeURIComponent(cls)}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const mData = await mRes.json();
    const allMarks = mData.success ? mData.records : [];

    document.getElementById("cmpEmpty").style.display     = "none";
    document.getElementById("cmpTableWrap").style.display = "block";

    let rows = "";
    students.forEach((s, i) => {
      const getExamPct = (exam) => {
        const r = allMarks.find(m =>
          (m.studentId?._id || m.studentId)?.toString() === s._id.toString() && m.exam === exam
        );
        return r ? r.percentage : null;
      };

      const ut1  = getExamPct("Unit Test-1");
      const sem1 = getExamPct("First Semester");
      const ut2  = getExamPct("Unit Test-2");
      const sem2 = getExamPct("Second Semester");

      const scores = [ut1, sem1, ut2, sem2].filter(v => v !== null);
      const best   = scores.length ? Math.max(...scores) : null;

      // Trend: compare last two available scores
      let trend = `<span class="trend-same">—</span>`;
      if (scores.length >= 2) {
        const last = scores[scores.length - 1];
        const prev = scores[scores.length - 2];
        trend = last > prev ? `<span class="trend-up">↑</span>`
              : last < prev ? `<span class="trend-down">↓</span>`
              : `<span class="trend-same">→</span>`;
      }

      const fmt = v => v !== null ? `<strong>${v}%</strong>` : `<span style="color:#cbd5e1">—</span>`;

      rows += `<tr>
        <td>${i + 1}</td>
        <td style="text-align:left;"><strong>${s.name}</strong></td>
        <td>${s.rollNo || "—"}</td>
        <td>${fmt(ut1)}</td>
        <td>${fmt(sem1)}</td>
        <td>${fmt(ut2)}</td>
        <td>${fmt(sem2)}</td>
        <td>${best !== null ? `<strong>${best}%</strong>` : "—"}</td>
        <td>${trend}</td>
      </tr>`;
    });

    document.getElementById("cmpTable").innerHTML = rows;
    showToast(`Comparison for ${students.length} students`, "success");
    if (typeof feather !== "undefined") feather.replace();
  } catch {
    showToast("Server error. Is the backend running?", "error");
  }
}
