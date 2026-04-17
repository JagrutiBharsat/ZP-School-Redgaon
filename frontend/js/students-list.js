const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

let allStudents = [];

document.addEventListener("DOMContentLoaded", async function () {

  const table        = document.getElementById("studentTable");
  const searchInput  = document.getElementById("searchInput");
  const classFilter  = document.getElementById("classFilter");
  const genderFilter = document.getElementById("genderFilter");

  // ── LOAD ────────────────────────────────────────────────
  async function loadStudents() {
    table.innerHTML = `<tr><td colspan="8" class="loading-row">
      <span class="spinner"></span> Loading students...
    </td></tr>`;
    try {
      const res  = await fetch(`${API}/students`, {
        headers: { "Authorization": "Bearer " + getToken() }
      });
      const data = await res.json();
      if (data.success) {
        allStudents = data.students;
        updateStats(allStudents);
        displayStudents(allStudents);
      } else {
        table.innerHTML = `<tr><td colspan="8" class="empty-row">❌ ${data.message}</td></tr>`;
      }
    } catch {
      table.innerHTML = `<tr><td colspan="8" class="empty-row">❌ Server error. Is the backend running?</td></tr>`;
    }
  }

  // ── STATS ───────────────────────────────────────────────
  function updateStats(data) {
    document.getElementById("statTotal").innerText  = data.length;
    document.getElementById("statMale").innerText   = data.filter(s => s.gender === "Male").length;
    document.getElementById("statFemale").innerText = data.filter(s => s.gender === "Female").length;
  }

  // ── PHOTO CELL — icon circle if no photo ────────────────
  function photoCell(s) {
    if (s.image && s.image.startsWith("data:")) {
      return `<img src="${s.image}" alt="${s.name}">`;
    }
    return `<div class="avatar-icon"><i data-feather="user"></i></div>`;
  }

  // ── MODAL PHOTO — icon circle if no photo ───────────────
  function modalPhoto(s) {
    if (s.image && s.image.startsWith("data:")) {
      document.getElementById("modalImg").src   = s.image;
      document.getElementById("modalImg").style.display = "block";
      const ic = document.getElementById("modalImgIcon");
      if (ic) ic.style.display = "none";
    } else {
      document.getElementById("modalImg").style.display = "none";
      const ic = document.getElementById("modalImgIcon");
      if (ic) ic.style.display = "flex";
    }
  }

  // ── DISPLAY ─────────────────────────────────────────────
  function esc(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  function displayStudents(data) {
    document.getElementById("resultCount").innerText =
      data.length ? `Showing ${data.length} student${data.length !== 1 ? "s" : ""}` : "";

    if (data.length === 0) {
      table.innerHTML = `<tr><td colspan="8" class="empty-row">
        <i data-feather="inbox"></i><p>No students found</p>
      </td></tr>`;
      if (typeof feather !== "undefined") feather.replace();
      return;
    }

    let rows = "";
    data.forEach((s, i) => {
      const gc  = s.gender === "Male" ? "gender-m" : s.gender === "Female" ? "gender-f" : "gender-o";
      const id  = s._id;   // MongoDB ObjectId — safe, only hex chars
      rows += `<tr>
        <td>${i + 1}</td>
        <td>${photoCell(s)}</td>
        <td><div class="td-name">${esc(s.name)}</div></td>
        <td>${esc(s.rollNo) || "—"}</td>
        <td><span class="class-badge">${esc(s.class)}</span></td>
        <td><span class="${gc}">${esc(s.gender) || "—"}</span></td>
        <td>${esc(s.mobile) || "—"}</td>
        <td>
          <button class="act-btn act-view"   data-id="${id}" onclick="viewStudent(this.dataset.id)"><i data-feather="eye"></i> View</button>
          <button class="act-btn act-edit"   data-id="${id}" onclick="editStudent(this.dataset.id)"><i data-feather="edit-2"></i> Edit</button>
          <button class="act-btn act-delete" data-id="${id}" onclick="deleteStudent(this.dataset.id)"><i data-feather="trash-2"></i> Delete</button>
        </td>
      </tr>`;
    });
    table.innerHTML = rows;
    if (typeof feather !== "undefined") feather.replace();
  }

  // ── FILTER + SORT by roll no ascending ──────────────────
  function filterStudents() {
    const search = searchInput.value.toLowerCase();
    const cls    = classFilter.value;
    const gender = genderFilter.value;

    const filtered = allStudents
      .filter(s =>
        (s.name.toLowerCase().includes(search) || (s.rollNo || "").toLowerCase().includes(search)) &&
        (!cls    || s.class  === cls) &&
        (!gender || s.gender === gender)
      )
      .sort((a, b) => (parseInt(a.rollNo) || 0) - (parseInt(b.rollNo) || 0));

    displayStudents(filtered);
  }

  searchInput.addEventListener("keyup",   filterStudents);
  classFilter.addEventListener("change",  filterStudents);
  genderFilter.addEventListener("change", filterStudents);

  // ── DELETE ───────────────────────────────────────────────
  window.deleteStudent = async function (id) {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res  = await fetch(`${API}/students/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + getToken() }
      });
      const data = await res.json();
      if (data.success) {
        allStudents = allStudents.filter(s => s._id !== id);
        updateStats(allStudents);
        filterStudents();
        if (localStorage.getItem("editStudentId") === id) localStorage.removeItem("editStudentId");
      } else {
        alert("❌ " + data.message);
      }
    } catch {
      alert("❌ Server error");
    }
  };

  // ── EDIT ─────────────────────────────────────────────────
  window.editStudent = function (id) {
    localStorage.setItem("editStudentId", id);
    window.location.href = "students.html";
  };

  // ── VIEW MODAL ───────────────────────────────────────────
  window.viewStudent = async function (id) {
    try {
      const res  = await fetch(`${API}/students/${id}`, {
        headers: { "Authorization": "Bearer " + getToken() }
      });
      const data = await res.json();
      if (!data.success) return;
      const s = data.student;

      modalPhoto(s);
      document.getElementById("modalName").innerText       = s.name          || "—";
      document.getElementById("modalClassBadge").innerText = s.class         || "—";
      document.getElementById("modalRoll").innerText       = s.rollNo        || "—";
      document.getElementById("modalDob").innerText        = s.dob           || "—";
      document.getElementById("modalGender").innerText     = s.gender        || "—";
      document.getElementById("modalCaste").innerText      = s.caste         || "—";
      document.getElementById("modalMother").innerText     = s.motherName    || "—";
      document.getElementById("modalMobile").innerText     = s.mobile        || "—";
      document.getElementById("modalAadhar").innerText     = s.aadhar        || "—";
      document.getElementById("modalAdmission").innerText  = s.admissionDate || "—";
      document.getElementById("modalAddress").innerText    = s.address       || "—";

      document.getElementById("modalEditBtn").onclick = () => {
        localStorage.setItem("editStudentId", s._id);
        window.location.href = "students.html";
      };

      document.getElementById("studentModal").classList.add("open");
      if (typeof feather !== "undefined") feather.replace();
    } catch {
      alert("❌ Could not load student details");
    }
  };

  loadStudents();
});

// ── MODAL CLOSE ──────────────────────────────────────────
window.closeModal = function () {
  document.getElementById("studentModal").classList.remove("open");
};
window.onclick = function (e) {
  if (e.target === document.getElementById("studentModal"))
    document.getElementById("studentModal").classList.remove("open");
};

// ── FILTER BUTTONS ───────────────────────────────────────
function applyFilter() {
  document.getElementById("searchInput").dispatchEvent(new Event("keyup"));
}
function clearFilter() {
  document.getElementById("searchInput").value  = "";
  document.getElementById("classFilter").value  = "";
  document.getElementById("genderFilter").value = "";
  applyFilter();
}
