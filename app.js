let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart;

/* REGISTER */
function register(){
 if(!ruser.value||!rpass.value) return alert("Fill all fields");
 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=""; rpass.value="";
 alert("Registered Successfully");
}

/* LOGIN */
function login(){
 let found = users.find(u=>u.username==user.value && u.password==pass.value);
 if(found){
  generatedOTP = Math.floor(100000+Math.random()*900000);
  alert("Your OTP: "+generatedOTP);
 } else alert("Invalid Login");
}

/* VERIFY */
function verifyOTP(){
 if(otp.value==generatedOTP){
  localStorage.setItem("loginUser",user.value);
  location = (user.value=="admin")?"admin.html":"dashboard.html";
 }
}

/* LOGOUT */
function logout(){
 localStorage.clear();
 location="index.html";
}

/* ADD COMPLAINT */
function addComplaint(){
 if(!title.value||!desc.value||!dept.value) return alert("Fill all");
 complaints.push({
  id:"CMP"+Date.now(),
  user:localStorage.getItem("loginUser"),
  dept:dept.value,
  priority:priority.value,
  title:title.value,
  desc:desc.value,
  status:"Pending",
  time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* STUDENT VIEW */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 archive.innerHTML="";
 complaints.filter(c=>c.user==u).forEach(c=>{
  let box=`<div class="box">${c.title} - ${c.status}</div>`;
  if(c.status=="Resolved") archive.innerHTML+=box;
  else myComplaints.innerHTML+=box;
 });
}

/* ADMIN VIEW */
function loadAdmin(){
 if(!adminList) return;
 adminList.innerHTML="";
 closedList.innerHTML="";
 complaints
 .filter(c=>c.user.toLowerCase().includes(search.value.toLowerCase()))
 .filter(c=>deptFilter.value==""||c.dept==deptFilter.value)
 .forEach((c,i)=>{
  let box=`<div class="box">
   <b>${c.title}</b> (${c.dept})<br>
   Priority:${c.priority}<br>
   <select id="status${i}">
    <option ${c.status=="Pending"?"selected":""}>Pending</option>
    <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
   </select>
   <button onclick="saveStatus(${i})">Save</button>
  </div>`;
  if(c.status=="Resolved") closedList.innerHTML+=box;
  else adminList.innerHTML+=box;
 });
 loadChart();
}

/* SAVE STATUS */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

/* CHART */
function loadChart(){
 if(!chart) return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 if(myChart) myChart.destroy();
 myChart=new Chart(chart,{type:"pie",data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}});
}

/* EXPORT EXCEL */
function exportExcel(){
 let csv="ID,User,Dept,Priority,Title,Status,Time\n";
 complaints.forEach(c=>csv+=`${c.id},${c.user},${c.dept},${c.priority},${c.title},${c.status},${c.time}\n`);
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv]));
 a.download="complaints.csv";
 a.click();
}

/* EXPORT PDF */
function exportPDF(){
 const {jsPDF}=window.jspdf;
 let doc=new jsPDF(),y=10;
 complaints.forEach(c=>{
  doc.text(`${c.id} ${c.user} ${c.title} ${c.status}`,10,y);
  y+=8;
 });
 doc.save("complaints.pdf");
}

/* DARK MODE */
function toggleDark(){document.body.classList.toggle("dark");}

/* LOADER FIX */
window.addEventListener("load",()=>document.getElementById("loader").style.display="none");
