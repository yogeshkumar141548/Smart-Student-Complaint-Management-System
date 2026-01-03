let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart, barChart;

/* ---------- AI TAGGING ---------- */
function getCategory(desc){
 desc=desc.toLowerCase();
 if(desc.includes("hostel")) return "Hostel";
 if(desc.includes("lab")) return "Lab";
 if(desc.includes("fee")) return "Fee";
 if(desc.includes("network")||desc.includes("wifi")) return "Network";
 if(desc.includes("transport")||desc.includes("bus")) return "Transport";
 return "General";
}

/* ---------- REGISTER ---------- */
function register(){
 if(!ruser.value||!rpass.value) return alert("Fill all fields");
 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=""; rpass.value="";
 alert("Registered Successfully");
}

/* ---------- LOGIN ---------- */
function login(){
 let found=users.find(u=>u.username==user.value&&u.password==pass.value);
 if(found){generatedOTP=Math.floor(100000+Math.random()*900000);alert("OTP: "+generatedOTP);}
 else alert("Invalid Login");
}
function verifyOTP(){
 if(otp.value==generatedOTP){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 }
}

/* ---------- ADD COMPLAINT ---------- */
function addComplaint(){
 let cat=getCategory(desc.value);
 let pri=priority.value;
 let sla= pri=="High"?2:pri=="Medium"?4:7;
 complaints.push({
  id:"CMP"+Date.now(),
  user:localStorage.getItem("loginUser"),
  dept:dept.value,
  priority:pri,
  title:title.value,
  desc:desc.value,
  category:cat,
  status:"Pending",
  days:0,
  sla:sla,
  time:new Date().toLocaleDateString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 alert("Complaint Submitted!");
 loadMy();
}

/* ---------- STUDENT VIEW ---------- */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u && c.status!="Resolved").forEach(c=>{
  myComplaints.innerHTML+=`
  <div class="box modern">
   <b>${c.title}</b> (${c.category})<br>
   Status:${c.status} | SLA:${c.sla-c.days} days<br>
   <button onclick="printSlip('${c.id}')">Print Slip</button>
  </div>`;
 });
}

/* ---------- PRINT SLIP ---------- */
function printSlip(id){
 let c=complaints.find(x=>x.id==id);
 let w=window.open("","_blank");
 w.document.write(`<h2>Complaint Slip</h2>
 ID:${c.id}<br>Title:${c.title}<br>Dept:${c.dept}<br>Status:${c.status}`);
}

/* ---------- ADMIN ---------- */
function loadAdmin(){
 if(!adminList) return;
 adminList.innerHTML="";
 complaints.filter(c=>c.status!="Resolved").forEach((c,i)=>{
  let late = c.days>c.sla?"style='background:#ffcccc'":"";
  adminList.innerHTML+=`
  <div class="box modern" ${late}>
   <b>${c.title}</b> (${c.category})<br>
   Dept:${c.dept} | Days:${c.days}/${c.sla}<br>
   <select id="status${i}">
    <option>Pending</option>
    <option>Resolved</option>
   </select>
   <button onclick="saveStatus(${i})">Save</button>
  </div>`;
 });
 loadCharts();
}

/* ---------- SAVE STATUS ---------- */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 alert("Student Notified on WhatsApp ✔");
 loadAdmin();
}

/* ---------- CHARTS ---------- */
function loadCharts(){
 let p=complaints.filter(c=>c.status=="Pending").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 if(chart){
  if(myChart) myChart.destroy();
  myChart=new Chart(chart,{type:"pie",data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}});
 }

 // Bar Chart
 if(document.getElementById("barChart")){
  let depts=["Computer","Mechanical","Electrical","Civil","Electronics"];
  let data=depts.map(d=>complaints.filter(c=>c.dept==d).length);
  if(barChart) barChart.destroy();
  barChart=new Chart(barChart,{type:"bar",data:{labels:depts,datasets:[{data:data}]}});
 }
}

/* ---------- AUTO DAY COUNTER ---------- */
window.onload=()=>{
 complaints.forEach(c=>{ if(c.status!="Resolved") c.days++; });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();loadAdmin();loadCharts();
}
