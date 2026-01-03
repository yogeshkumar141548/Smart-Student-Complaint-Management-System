let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart;

/* Register */
function register(){
 if(!ruser.value||!rpass.value) return alert("Fill all fields");
 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=""; rpass.value="";
 alert("Registered Successfully");
}

/* Login */
function login(){
 let found=users.find(u=>u.username==user.value&&u.password==pass.value);
 if(found){
   generatedOTP=Math.floor(100000+Math.random()*900000);
   alert("Your OTP: "+generatedOTP);
   pass.value="";
 } else alert("Invalid Login");
}

function verifyOTP(){
 if(otp.value==generatedOTP){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 } else alert("Wrong OTP");
}

function logout(){localStorage.clear();location="index.html";}

/* Add Complaint */
function addComplaint(){
 if(!dept.value||!title.value||!desc.value) return alert("Fill all fields");
 let f=file.files[0], reader=new FileReader();
 reader.onload=function(){
  complaints.push({
   id:"CMP"+Date.now(),
   user:localStorage.getItem("loginUser"),
   dept:dept.value,
   priority:priority.value,
   title:title.value,
   desc:desc.value,
   file:reader.result,
   status:"Pending",
   days:0,
   notified:false,
   time:new Date().toLocaleString()
  });
  localStorage.setItem("complaints",JSON.stringify(complaints));
  if(document.getElementById("bellSound")) bellSound.play();
  loadMy();
 }
 f?reader.readAsDataURL(f):reader.onload();
}

/* Student Complaints */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u).forEach((c,i)=>{
  if(c.notified===false) c.notified=true;
  myComplaints.innerHTML+=`
  <div class="box modern">
   <b>${c.title}</b> (${c.dept})<br>
   ${c.desc}<br>
   Priority:${c.priority}<br>
   Status:${c.status}<br>
   <button onclick="editComplaint(${i})">Edit</button>
  </div>`;
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 checkNotify();
}

/* Edit Complaint */
function editComplaint(i){
 let c=complaints[i];
 title.value=c.title;
 desc.value=c.desc;
 dept.value=c.dept;
 priority.value=c.priority;
 complaints.splice(i,1);
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* Admin Panel */
function loadAdmin(){
 if(!adminList) return;
 adminList.innerHTML="";
 let q=search.value.toLowerCase();
 let dpt=deptFilter.value;

 complaints
 .filter(c=>c.user.toLowerCase().includes(q))
 .filter(c=>dpt==""||c.dept==dpt)
 .forEach((c,i)=>{
  let color=c.priority=="High"?"#dc3545":c.priority=="Medium"?"#f0ad4e":"#28a745";
  adminList.innerHTML+=`
  <div class="box modern" style="border-left:6px solid ${color}">
   <b>${c.title}</b> (${c.dept})<br>
   ${c.desc}<br>
   Priority:${c.priority}<br>
   <small>Days Pending:${c.days}</small><br>
   <select id="status${i}">
    <option ${c.status=="Pending"?"selected":""}>Pending</option>
    <option ${c.status=="In Progress"?"selected":""}>In Progress</option>
    <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
    <option ${c.status=="Cancelled"?"selected":""}>Cancelled</option>
   </select>
   <button onclick="saveStatus(${i})">Save</button>
   <button onclick="deleteComplaint(${i})" style="background:#dc3545">Delete</button>
  </div>`;
 });
 updateCounts();
 loadChart();
}

/* Save Status */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 complaints[i].notified=false;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

/* Delete */
function deleteComplaint(i){
 if(confirm("Delete this complaint?")){
  complaints.splice(i,1);
  localStorage.setItem("complaints",JSON.stringify(complaints));
  loadAdmin();
 }
}

/* Chart */
function loadChart(){
 if(!chart) return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let ip=complaints.filter(c=>c.status=="In Progress").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 let c=complaints.filter(c=>c.status=="Cancelled").length;
 if(myChart) myChart.destroy();
 myChart=new Chart(chart,{type:"pie",data:{labels:["Pending","In Progress","Resolved","Cancelled"],datasets:[{data:[p,ip,r,c]}]}});
}

/* Counters + % */
function updateCounts(){
 let total=complaints.length;
 let pending=complaints.filter(c=>c.status=="Pending").length;
 let ip=complaints.filter(c=>c.status=="In Progress").length;
 let resolved=complaints.filter(c=>c.status=="Resolved").length;
 let cancel=complaints.filter(c=>c.status=="Cancelled").length;

 pCount.innerText=pending;
 ipCount.innerText=ip;
 rCount.innerText=resolved;
 cCount.innerText=cancel;

 let percent=total?Math.round((resolved/total)*100):0;
 solveBar.innerText=percent+"% Solved";
 solveBar.style.width=percent+"%";
}

/* Notification Bell */
function checkNotify(){
 let u=localStorage.getItem("loginUser");
 if(!u||!notifyCount) return;
 let n=complaints.filter(c=>c.user==u&&c.notified!==true).length;
 notifyCount.innerText=n;
}

/* Export */
function exportExcel(){
 let csv="ID,User,Dept,Priority,Title,Status,Time\n";
 complaints.forEach(c=>csv+=`${c.id},${c.user},${c.dept},${c.priority},${c.title},${c.status},${c.time}\n`);
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv]));
 a.download="complaints.csv";a.click();
}

/* Department PDF */
function exportPDF(){
 const {jsPDF}=window.jspdf;
 let doc=new jsPDF();
 doc.text("Department Wise Complaint Report",10,10);
 let y=20;
 ["Computer","Mechanical","Electrical","Civil","Electronics"].forEach(d=>{
  doc.text("Department: "+d,10,y);y+=8;
  complaints.filter(c=>c.dept==d).forEach(c=>{
   doc.text(`${c.id} ${c.title} ${c.status}`,12,y);y+=6;
  });
  y+=8;
 });
 doc.save("Dept_Report.pdf");
}

/* Auto Day Counter */
window.onload=()=>{
 complaints.forEach(c=>{
  if(c.status!="Resolved") c.days++;
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();loadAdmin();loadChart();checkNotify();
}
