// API configuration is loaded from config.js
const getToken = () => localStorage.getItem("token");

const form    = document.getElementById("studentForm");
const preview = document.getElementById("previewImg");
const upload  = document.getElementById("photoUpload");

let editStudentId = localStorage.getItem("editStudentId");

// ── IMAGE PREVIEW ─────────────────────────────────────────
if (upload) {
  upload.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        preview.src = e.target.result;
        preview.style.display = "block";
        document.getElementById("photoInitials").style.display = "none";
        document.getElementById("removePhoto").style.display  = "flex";
      };
      reader.readAsDataURL(file);
    }
  });
}

// ── REMOVE PHOTO ──────────────────────────────────────────
function removePhoto() {
  preview.src = "";
  preview.style.display = "none";
  document.getElementById("photoInitials").style.display = "flex";
  document.getElementById("removePhoto").style.display   = "none";
  upload.value = "";
}

// ── EDIT MODE — pre-fill form ─────────────────────────────
if (editStudentId) {
  document.getElementById("formTitle").innerText = "Edit Student";
  document.getElementById("submitBtn").innerHTML = '<i data-feather="save"></i> Update Student';

  fetch(`${API}/students/${editStudentId}`, {
    headers: { "Authorization": "Bearer " + getToken() }
  })
  .then(r => r.json())
  .then(data => {
    if (!data.success) return;
    const s = data.student;

    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ""; };

    set("studentName",   s.name);
    set("dob",           s.dob);
    set("class",         s.class);
    set("parentMobile",  s.mobile);
    set("address",       s.address);
    set("rollNo",        s.rollNo);
    set("gender",        s.gender);
    set("caste",         s.caste);
    set("birthPlace",    s.birthPlace);
    set("motherName",    s.motherName);
    set("regNumber",     s.regNumber);
    set("studentId",     s.studentId);
    set("aadhar",        s.aadhar);
    set("bankAccount",   s.bankAccount);
    set("admissionDate", s.admissionDate);
    set("parentBank",    s.parentBank);
    set("parentAadhar",  s.parentAadhar);

    if (s.image && s.image.startsWith("data:")) {
      preview.src = s.image;
      preview.style.display = "block";
      document.getElementById("photoInitials").style.display = "none";
      document.getElementById("removePhoto").style.display   = "flex";
    }

    if (typeof feather !== "undefined") feather.replace();
  })
  .catch(() => {
    localStorage.removeItem("editStudentId");
    editStudentId = null;
  });
}

// ── SAVE / UPDATE ─────────────────────────────────────────
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const get = id => document.getElementById(id)?.value || "";

  const student = {
    name:          get("studentName"),
    dob:           get("dob"),
    class:         get("class"),
    rollNo:        get("rollNo"),
    mobile:        get("parentMobile"),
    address:       get("address"),
    image:         preview.style.display !== "none" ? preview.src : "",
    gender:        get("gender"),
    caste:         get("caste"),
    birthPlace:    get("birthPlace"),
    motherName:    get("motherName"),
    regNumber:     get("regNumber"),
    studentId:     get("studentId"),
    aadhar:        get("aadhar"),
    bankAccount:   get("bankAccount"),
    admissionDate: get("admissionDate"),
    parentBank:    get("parentBank"),
    parentAadhar:  get("parentAadhar")
  };

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i data-feather="loader"></i> Saving...';
  if (typeof feather !== "undefined") feather.replace();

  try {
    let res, data;

    if (editStudentId) {
      res  = await fetch(`${API}/students/${editStudentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify(student)
      });
      data = await res.json();
      if (data.success) {
        localStorage.removeItem("editStudentId");
        showToast("✅ Student Updated Successfully", "success");
      } else {
        showToast("❌ " + data.message, "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-feather="save"></i> Update Student';
        if (typeof feather !== "undefined") feather.replace();
        return;
      }
    } else {
      res  = await fetch(`${API}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
        body: JSON.stringify(student)
      });
      data = await res.json();
      if (data.success) {
        showToast("✅ Student Added Successfully", "success");
      } else {
        showToast("❌ " + data.message, "error");
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-feather="save"></i> Save Student Profile';
        if (typeof feather !== "undefined") feather.replace();
        return;
      }
    }

    setTimeout(() => { window.location.href = "students-list.html"; }, 1600);

  } catch {
    showToast("❌ Server error. Is the backend running?", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-feather="save"></i> Save Student Profile';
    if (typeof feather !== "undefined") feather.replace();
  }
});

// ── TOAST ─────────────────────────────────────────────────
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast ${type} show`;
  setTimeout(() => { toast.className = "toast"; }, 2800);
}
