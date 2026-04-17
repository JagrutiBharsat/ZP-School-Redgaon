// API configuration is loaded from config.js
const getToken = () => localStorage.getItem("token");

let currentStudents = [];
let coreSubjects    = [];
let otherSubjects   = [];
let allSubjects     = [];

// ── SUBJECT CONFIG (mirrors backend) ─────────────────────
const SUBJECTS = {
  "Class 1": {
    core:  ["Marathi", "English", "Math"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 2": {
    core:  ["Marathi", "English", "Math"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 3": {
    core:  ["Marathi", "English", "Math", "Environmental Studies"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 4": {
    core:  ["Marathi", "English", "Math", "Environmental Studies"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 5": {
    core:  ["Marathi", "English", "Math", "Hindi", "Environmental Studies"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 6": {
    core:  ["Marathi", "English", "Math", "Hindi", "Science", "Social Science"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  },
  "Class 7": {
    core:  ["Marathi", "English", "Math", "Hindi", "Science", "Social Science"],
    other: ["Art", "Work Experience", "Physical Education and Health"]
  }
};

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = "toast"; }, 3000);
}

// ── TAB SWITCH ────────────────────────────────────────────
function switchTab(tab) {
  ["enter","view","report"].forEach(t => {
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
  if (pct >= 90) return { label: "A+", cls: "grade-ap" };
  if (pct >= 75) return { label: "A",  cls: "grade-a"  };
  if (pct >= 60) return { label: "B",  cls: "grade-b"  };
  if (pct >= 50) return { label: "C",  cls: "grade-c"  };
  if (pct >= 35) return { label: "D",  cls: "grade-d"  };
  return           { label: "F",  cls: "grade-f"  };
}

// ── LOAD STUDENTS FOR ENTERING MARKS ─────────────────────
async function loadStudents() {
  const cls  = document.getElementById("classSelect").value;
  const exam = document.getElementById("examSelect").value;

  if (!cls)  { showToast("Please select a class", "error"); return; }
  if (!exam) { showToast("Please select an exam",  "error"); return; }

  showToast("Loading students...", "info");

  try {
    // Fetch students
    const sRes  = await fetch(`${API}/students`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const sData = await sRes.json();
    if (!sData.success) { showToast("Failed to load students", "error"); return; }

    currentStudents = sData.students
      .filter(s => s.class === cls)
      .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));

    if (currentStudents.length === 0) {
      showToast("No students found in " + cls, "error"); return;
    }

    // Set subjects
    coreSubjects  = SUBJECTS[cls]?.core  || [];
    otherSubjects = SUBJECTS[cls]?.other || [];
    allSubjects   = [...coreSubjects, ...otherSubjects];

    // Fetch existing marks for this class + exam
    const mRes  = await fetch(`${API}/marks?class=${encodeURIComponent(cls)}&exam=${encodeURIComponent(exam)}`, {
      headers: { "Authorization": "Bearer " + getToken() }
    });
    const mData = await mRes.json();

    // Build map: studentId → subjects map
    const existingMap = {};
    if (mData.success) {
      mData.records.forEach(r => {
        existingMap[r.studentId._id || r.studentId] = r.subjects || {};
      });
    }

    renderTable(cls, exam, existingMap);

    document.getElementById("marksCards").style.display     = "grid";
    document.getElementById("marksTitleRow").style.display  = "flex";
    document.getElementById("marksTableWrap").style.display = "block";
    document.getElementById("marksSaveRow").style.display   = "flex";
    document.getElementById("marksEmpty").style.display     = "none";
    document.getElementById("marksTitle").innerText         = `${cls}  —  ${exam}`;
    document.getElementById("statTotal").innerText          = currentStudents.length;

    // Show/hide other subjects legend based on exam type
    const legend = document.querySelector(".leg-other");
    if (legend) legend.style.display = isUnitTest(exam) ? "none" : "inline-block";

    updateLiveStats();
    showToast(`Loaded ${currentStudents.length} students`, "success");
    if (typeof feather !== "undefined") feather.replace();

  } catch {
    showToast("Server error. Is the backend running?", "error");
  }
}

// ── EXAM CONFIG HELPER ───────────────────────────────────
function isUnitTest(exam) {
  return exam === "Unit Test-1" || exam === "Unit Test-2";
}

// ── SEMESTER EVAL MAX MARKS PER CLASS ────────────────────
// Returns { fa, ca } for core subjects per class
// Other subjects always 50 FA + 50 CA = 100 (not split, single column)
function getSemesterMax(cls) {
  const n = parseInt(cls.replace("Class ", ""));
  if (n <= 2) return { fa: 70, ca: 30 };
  if (n <= 4) return { fa: 60, ca: 40 };
  if (n <= 6) return { fa: 50, ca: 50 };
  return             { fa: 40, ca: 60 }; // Class 7
}

// ── RENDER TABLE ──────────────────────────────────────────
function renderTable(cls, exam, existingMap) {
  const unitTest = isUnitTest(exam);

  if (unitTest) {
    renderUnitTestTable(cls, existingMap);
  } else {
    renderSemesterTable(cls, exam, existingMap);
  }
}

// ── UNIT TEST TABLE (core only, max 20 each) ──────────────
function renderUnitTestTable(cls, existingMap) {
  const maxCore = 20;

  let head = `<tr>
    <th class="th-fixed">#</th>
    <th class="th-fixed" style="text-align:left;min-width:140px;">Name</th>
    <th class="th-fixed">Roll No</th>`;
  coreSubjects.forEach(s => {
    head += `<th class="th-core">${s}<br><small style="opacity:.7;font-size:9px;">/ ${maxCore}</small></th>`;
  });
  head += `<th class="th-fixed">Total</th><th class="th-fixed">%</th><th class="th-fixed">Grade</th></tr>`;
  document.getElementById("marksHead").innerHTML = head;

  let rows = "";
  currentStudents.forEach((s, i) => {
    const saved = existingMap[s._id] || {};
    rows += `<tr>
      <td>${i + 1}</td>
      <td style="text-align:left;"><strong>${s.name}</strong></td>
      <td>${s.rollNo || "—"}</td>`;
    coreSubjects.forEach((sub, j) => {
      const val = saved[sub] !== undefined ? saved[sub] : "";
      rows += `<td><input class="marks-input" type="number" min="0" max="${maxCore}"
        id="m_${i}_${j}" value="${val}" oninput="calcRow(${i})" placeholder="0"></td>`;
    });
    rows += `<td class="total-cell" id="tot_${i}">0</td>
      <td class="pct-cell" id="pct_${i}">0%</td>
      <td id="grd_${i}"><span class="grade-f">F</span></td></tr>`;
  });
  document.getElementById("marksTable").innerHTML = rows;
  currentStudents.forEach((_, i) => calcRow(i));
}

// ── SEMESTER TABLE (FA + CA per subject) ─────────────────
function renderSemesterTable(cls, exam, existingMap) {
  const { fa, ca } = getSemesterMax(cls);
  const maxOther   = 100; // single column for other subjects

  // ROW 1: subject group headers (span 2 cols each for core, 1 for other)
  let row1 = `<tr>
    <th class="th-fixed" rowspan="3">#</th>
    <th class="th-fixed" rowspan="3" style="text-align:left;min-width:140px;">Name</th>
    <th class="th-fixed" rowspan="3">Roll No</th>`;
  coreSubjects.forEach(s => {
    row1 += `<th class="th-core" colspan="3" style="border-bottom:1px solid rgba(255,255,255,.2);">${s}</th>`;
  });
  otherSubjects.forEach(s => {
    row1 += `<th class="th-other" rowspan="3">${s}<br><small style="opacity:.7;font-size:9px;">/ ${maxOther}</small></th>`;
  });
  row1 += `<th class="th-fixed" rowspan="3">Total</th>
    <th class="th-fixed" rowspan="3">%</th>
    <th class="th-fixed" rowspan="3">Grade</th></tr>`;

  // ROW 2: FA / CA / Total labels per core subject
  let row2 = `<tr>`;
  coreSubjects.forEach(() => {
    row2 += `
      <th class="th-fa">FA<br><small style="opacity:.8;font-size:9px;">/${fa}</small></th>
      <th class="th-ca">CA<br><small style="opacity:.8;font-size:9px;">/${ca}</small></th>
      <th class="th-sub-total">Sub<br><small style="opacity:.8;font-size:9px;">/${fa+ca}</small></th>`;
  });
  row2 += `</tr>`;

  // ROW 3: Full label row
  let row3 = `<tr>`;
  coreSubjects.forEach(() => {
    row3 += `
      <th class="th-fa-label">Formative</th>
      <th class="th-ca-label">Comprehensive</th>
      <th class="th-sub-total"></th>`;
  });
  row3 += `</tr>`;

  document.getElementById("marksHead").innerHTML = row1 + row2 + row3;

  // DATA ROWS
  let rows = "";
  currentStudents.forEach((s, i) => {
    const saved = existingMap[s._id] || {};
    rows += `<tr>
      <td>${i + 1}</td>
      <td style="text-align:left;"><strong>${s.name}</strong></td>
      <td>${s.rollNo || "—"}</td>`;

    coreSubjects.forEach((sub, j) => {
      const faKey = `${sub}_FA`;
      const caKey = `${sub}_CA`;
      const faVal = saved[faKey] !== undefined ? saved[faKey] : "";
      const caVal = saved[caKey] !== undefined ? saved[caKey] : "";

      rows += `
        <td><input class="marks-input fa-input" type="number" min="0" max="${fa}"
          id="fa_${i}_${j}" value="${faVal}" oninput="calcRow(${i})" placeholder="0"></td>
        <td><input class="marks-input ca-input" type="number" min="0" max="${ca}"
          id="ca_${i}_${j}" value="${caVal}" oninput="calcRow(${i})" placeholder="0"></td>
        <td class="sub-total-cell" id="st_${i}_${j}">0</td>`;
    });

    otherSubjects.forEach((sub, j) => {
      const val = saved[sub] !== undefined ? saved[sub] : "";
      rows += `<td><input class="marks-input other-input" type="number" min="0" max="${maxOther}"
        id="ot_${i}_${j}" value="${val}" oninput="calcRow(${i})" placeholder="0"></td>`;
    });

    rows += `<td class="total-cell" id="tot_${i}">0</td>
      <td class="pct-cell" id="pct_${i}">0%</td>
      <td id="grd_${i}"><span class="grade-f">F</span></td></tr>`;
  });

  document.getElementById("marksTable").innerHTML = rows;
  currentStudents.forEach((_, i) => calcRow(i));
}

// ── CALC ROW ──────────────────────────────────────────────
function calcRow(i) {
  const exam     = document.getElementById("examSelect").value;
  const cls      = document.getElementById("classSelect").value;
  const unitTest = isUnitTest(exam);

  let total = 0, maxTotal = 0;

  if (unitTest) {
    const maxCore = 20;
    coreSubjects.forEach((_, j) => {
      const val = parseFloat(document.getElementById(`m_${i}_${j}`)?.value) || 0;
      total    += val;
      maxTotal += maxCore;
    });
  } else {
    const { fa, ca } = getSemesterMax(cls);
    const maxOther   = 100;

    coreSubjects.forEach((_, j) => {
      const faVal = parseFloat(document.getElementById(`fa_${i}_${j}`)?.value) || 0;
      const caVal = parseFloat(document.getElementById(`ca_${i}_${j}`)?.value) || 0;
      const sub   = faVal + caVal;
      // Update sub-total cell
      const stEl = document.getElementById(`st_${i}_${j}`);
      if (stEl) stEl.innerText = sub;
      total    += sub;
      maxTotal += (fa + ca);
    });

    otherSubjects.forEach((_, j) => {
      const val = parseFloat(document.getElementById(`ot_${i}_${j}`)?.value) || 0;
      total    += val;
      maxTotal += maxOther;
    });
  }

  const pct   = maxTotal ? ((total / maxTotal) * 100).toFixed(1) : 0;
  const grade = getGrade(parseFloat(pct));

  document.getElementById(`tot_${i}`).innerText = total;
  document.getElementById(`pct_${i}`).innerText = pct + "%";
  document.getElementById(`grd_${i}`).innerHTML = `<span class="${grade.cls}">${grade.label}</span>`;

  updateLiveStats();
}

// ── LIVE STATS ────────────────────────────────────────────
function updateLiveStats() {
  let filled = 0, totalPct = 0, topperName = "—", topperPct = -1;

  currentStudents.forEach((s, i) => {
    const pctEl = document.getElementById(`pct_${i}`);
    if (!pctEl) return;
    const pct = parseFloat(pctEl.innerText) || 0;

    // Check if any mark entered
    const hasData = allSubjects.some((_, j) => {
      const el = document.getElementById(`m_${i}_${j}`);
      return el && el.value !== "";
    });
    if (hasData) filled++;

    totalPct += pct;
    if (pct > topperPct) { topperPct = pct; topperName = s.name.split(" ")[0]; }
  });

  const avg = currentStudents.length ? (totalPct / currentStudents.length).toFixed(1) : 0;
  document.getElementById("statFilled").innerText = filled;
  document.getElementById("statAvg").innerText    = avg + "%";
  document.getElementById("statTopper").innerText = topperPct > 0 ? topperName : "—";
}

// ── SAVE MARKS ────────────────────────────────────────────
async function saveMarks() {
  const cls  = document.getElementById("classSelect").value;
  const exam = document.getElementById("examSelect").value;
  if (!currentStudents.length) { showToast("No students loaded", "error"); return; }

  const unitTest = isUnitTest(exam);
  const { fa, ca } = getSemesterMax(cls);
  const maxOther   = 100;

  const records = currentStudents.map((s, i) => {
    const subjectsMap = {};
    let total = 0, maxTotal = 0;

    if (unitTest) {
      const maxCore = 20;
      coreSubjects.forEach((sub, j) => {
        const val = parseFloat(document.getElementById(`m_${i}_${j}`)?.value) || 0;
        subjectsMap[sub] = val;
        total    += val;
        maxTotal += maxCore;
      });
    } else {
      coreSubjects.forEach((sub, j) => {
        const faVal = parseFloat(document.getElementById(`fa_${i}_${j}`)?.value) || 0;
        const caVal = parseFloat(document.getElementById(`ca_${i}_${j}`)?.value) || 0;
        subjectsMap[`${sub}_FA`] = faVal;
        subjectsMap[`${sub}_CA`] = caVal;
        total    += faVal + caVal;
        maxTotal += fa + ca;
      });
      otherSubjects.forEach((sub, j) => {
        const val = parseFloat(document.getElementById(`ot_${i}_${j}`)?.value) || 0;
        subjectsMap[sub] = val;
        total    += val;
        maxTotal += maxOther;
      });
    }

    const pct = maxTotal ? parseFloat(((total / maxTotal) * 100).toFixed(1)) : 0;

    return {
      studentId:  s._id,
      class:      cls,
      exam,
      subjects:   subjectsMap,
      total,
      maxTotal,
      percentage: pct
    };
  });

  try {
    const res  = await fetch(`${API}/marks/bulk`, {
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

// ── VIEW MARKS ────────────────────────────────────────────
async function loadViewMarks() {
  const cls  = document.getElementById("viewClass").value;
  const exam = document.getElementById("viewExam").value;

  let url = `${API}/marks?`;
  if (cls)  url += `class=${encodeURIComponent(cls)}&`;
  if (exam) url += `exam=${encodeURIComponent(exam)}`;

  try {
    const res  = await fetch(url, { headers: { "Authorization": "Bearer " + getToken() } });
    const data = await res.json();
    const tbody = document.getElementById("viewTable");

    if (!data.success || !data.records.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="marks-empty-row">No records found</td></tr>`;
      return;
    }

    const sorted = data.records.sort((a, b) =>
      (parseInt(a.studentId?.rollNo) || 0) - (parseInt(b.studentId?.rollNo) || 0)
    );

    let rows = "";
    sorted.forEach((r, i) => {
      const s     = r.studentId;
      const grade = getGrade(r.percentage);
      const pass  = r.percentage >= 35;
      rows += `<tr>
        <td>${i + 1}</td>
        <td style="text-align:left;"><strong>${s?.name || "—"}</strong></td>
        <td>${s?.rollNo || "—"}</td>
        <td>${r.class}</td>
        <td>${r.exam}</td>
        <td><strong>${r.total}</strong></td>
        <td>${r.maxTotal}</td>
        <td><strong>${r.percentage}%</strong></td>
        <td><span class="${grade.cls}">${grade.label}</span></td>
      </tr>`;
    });
    tbody.innerHTML = rows;
    showToast(`${data.records.length} records found`, "success");
  } catch {
    showToast("❌ Server error", "error");
  }
}

// ── CLASS REPORT ──────────────────────────────────────────
async function loadReport() {
  const cls  = document.getElementById("reportClass").value;
  const exam = document.getElementById("reportExam").value;

  if (!cls || !exam) { showToast("Select class and exam", "error"); return; }

  let url = `${API}/marks?class=${encodeURIComponent(cls)}&exam=${encodeURIComponent(exam)}`;

  try {
    const res  = await fetch(url, { headers: { "Authorization": "Bearer " + getToken() } });
    const data = await res.json();
    const tbody = document.getElementById("reportTable");

    if (!data.success || !data.records.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="marks-empty-row">No data found</td></tr>`;
      document.getElementById("reportCards").style.display = "none";
      return;
    }

    // Sort by percentage descending for ranking
    const ranked = [...data.records].sort((a, b) => b.percentage - a.percentage);

    const total  = ranked.length;
    const pass   = ranked.filter(r => r.percentage >= 35).length;
    const avgPct = (ranked.reduce((s, r) => s + r.percentage, 0) / total).toFixed(1);

    document.getElementById("rTotal").innerText = total;
    document.getElementById("rPass").innerText  = pass;
    document.getElementById("rFail").innerText  = total - pass;
    document.getElementById("rAvg").innerText   = avgPct + "%";
    document.getElementById("reportCards").style.display = "grid";

    let rows = "";
    ranked.forEach((r, i) => {
      const s     = r.studentId;
      const grade = getGrade(r.percentage);
      const pass  = r.percentage >= 35;
      rows += `<tr>
        <td><strong>#${i + 1}</strong></td>
        <td style="text-align:left;"><strong>${s?.name || "—"}</strong></td>
        <td>${s?.rollNo || "—"}</td>
        <td><strong>${r.total}</strong></td>
        <td>${r.maxTotal}</td>
        <td><strong>${r.percentage}%</strong></td>
        <td><span class="${grade.cls}">${grade.label}</span></td>
        <td><span class="${pass ? "pass-badge" : "fail-badge"}">${pass ? "Pass" : "Fail"}</span></td>
      </tr>`;
    });
    tbody.innerHTML = rows;
    showToast(`Report for ${total} students`, "success");
  } catch {
    showToast("❌ Server error", "error");
  }
}
