const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const preview = document.getElementById("preview");
const photo = document.getElementById("photo");

let students = JSON.parse(localStorage.getItem("students")) || [];

photo.onchange=()=>{
preview.src=URL.createObjectURL(photo.files[0]);
}

form.addEventListener("submit",function(e){

e.preventDefault();

const student={
photo:preview.src,
register:register.value,
name:name.value,
class:document.getElementById("class").value,
division:division.value,
mobile:mobile.value,
father:father.value,
mother:mother.value,
aadhaar:aadhaar.value,
apaar:apaar.value,
address:address.value
}

students.push(student);

saveData();
displayStudents(students);

form.reset();
preview.src="https://via.placeholder.com/100";

});

function saveData(){
localStorage.setItem("students",JSON.stringify(students));
}

function displayStudents(data){

table.innerHTML="";

data.forEach((s,i)=>{

table.innerHTML+=`

<tr>

<td><img src="${s.photo}" width="40" style="border-radius:50%"></td>

<td>${s.name}</td>

<td>${s.class}</td>

<td>${s.division}</td>

<td>${s.mobile}</td>

<td>

<button onclick="viewProfile(${i})">View</button>
<button onclick="deleteStudent(${i})">Delete</button>

</td>

</tr>

`

});

updateDashboard();

}

function deleteStudent(i){
students.splice(i,1);
saveData();
displayStudents(students);
}

function viewProfile(i){

const s=students[i];

profileData.innerHTML=`

<img src="${s.photo}" width="100"><br>
<h3>${s.name}</h3>

<p><b>Register:</b> ${s.register}</p>
<p><b>Class:</b> ${s.class}-${s.division}</p>
<p><b>Father:</b> ${s.father}</p>
<p><b>Mother:</b> ${s.mother}</p>
<p><b>Mobile:</b> ${s.mobile}</p>
<p><b>Aadhaar:</b> ${s.aadhaar}</p>
<p><b>APAAR:</b> ${s.apaar}</p>
<p><b>Address:</b> ${s.address}</p>

`;

profileModal.style.display="block";

}

close.onclick=()=>{
profileModal.style.display="none";
}

function updateDashboard(){

total.innerText=students.length;

c1.innerText=students.filter(s=>s.class=="1").length;
c2.innerText=students.filter(s=>s.class=="2").length;
c3.innerText=students.filter(s=>s.class=="3").length;

}

displayStudents(students);

searchInput.addEventListener("keyup",filterStudents);
classFilter.addEventListener("change",filterStudents);

function filterStudents(){

const search=searchInput.value.toLowerCase();
const cls=classFilter.value;

const filtered=students.filter(s=>
s.name.toLowerCase().includes(search)&&
(cls==""||s.class==cls)
);

displayStudents(filtered);

}