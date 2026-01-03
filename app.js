let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let otpCode="", myChart;

/* ===== AUTH ===== */
function register(){
 let ru=ruser.value.trim(), rp=rpass.value.trim();
 if(!ru||!rp) return alert("Fill all");
 users.push({username:ru,password:rp});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=rpass.value="";
 alert("Registered Successfully");
}

function login(){
 let found=users.find(u=>u.username===user.value.trim() && u.password===pass.value.trim());
 if(!found) return alert("Invalid Login");
 otpCode=Math.floor(100000+Math.random()*900000);
 alert("Your OTP: "+otpCode);
}

function verifyOTP(){
 if(otp.value==otpCode){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 } else alert("Wrong OTP");
}

function logout(){
 localStorage.removeItem("loginUser");
 location="index.html";
}

/* ===== AI CATEGORY ===== */
function getCategory(desc){
 desc=desc.toLowerCase();
 if(desc.includes("hostel")) return "Hostel";
 if(desc.includes("lab")) return "Lab";
 if(desc.includes("fee")) return "Fee";
 if(desc.includes("wifi")||desc.includes("network")) return "Network";
 if(desc.includes("bus")||desc.includes("transport")) return "Transport";
 return "General";
}

/* ===== ADD COMPLAINT ===== */
function addComplaint(){
 let pri=priority.value;
 let sla = pri=="High"?2:pri=="Medium"?4:7;

 complaints.push({
  id:"CMP"+Date.now(),
  user:localStorage.getItem("loginUser"),
  dept:dept.value,
  priority:pri,
  title:title.value,
  desc:desc.value,
  category:getCategory(desc.value),
  file:fileUpload?.files[0]?.name||"",
  status:"Pending",
  days:0,
  sla:sla,
  time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* ===== STUDENT VIEW ===== */
function loadMy(){
 let my=document.getElementById("myComplaints");
 let arch=document.getElementById("archive");
 if(!my||!arch) return;

 my.innerHTML=""; arch.innerHTML="";
 let u=localStorage.getItem("loginUser");

 complaints.forEach(c=>{
  if(c.user!==u) return;

  let box=`<div class="box">
   <b>${c.title}</b> (${c.category})<br>
   Dept:${c.dept} | Priority:${c.priority}<br>
   Status:${c.status} | SLA:${c.sla-c.days} days<br>
   ${c.file?`📎 ${c.file}<br>`:""}
   <button onclick="editById('${c.id}')">✏ Edit</button>
   <button onclick="deleteById('${c.id}')">🗑 Delete</button>
   <button onclick="printById('${c.id}')">🖨 Print</button>
  </div>`;
  (c.status=="Resolved"?arch:my).innerHTML+=box;
 });
 updateSolved(); checkNotify();
}

/* ===== EDIT / DELETE / PRINT ===== */
function deleteById(id){
 complaints=complaints.filter(c=>c.id!=id);
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy(); loadAdmin();
}

function editById(id){
 let c=complaints.find(x=>x.id==id);
 if(!c) return;
 let t=prompt("Edit Title",c.title);
 let d=prompt("Edit Description",c.desc);
 if(t&&d){
  c.title=t; c.desc=d;
  localStorage.setItem("complaints",JSON.stringify(complaints));
  loadMy(); loadAdmin();
 }
}

function printById(id){
 let c=complaints.find(x=>x.id==id);
 let w=window.open("","print","width=400,height=500");
 w.document.write(`<h3>GLA University</h3>
  <p>ID:${c.id}</p><p>User:${c.user}</p><p>Dept:${c.dept}</p>
  <p>Title:${c.title}</p><p>Status:${c.status}</p><p>Time:${c.time}</p>`);
 w.print();
}

/* ===== ADMIN VIEW ===== */
function loadAdmin(){
 let admin=document.getElementById("adminList");
 let closed=document.getElementById("closedList");
 let s=document.getElementById("search");
 let d=document.getElementById("deptFilter");
 if(!admin||!closed) return;

 admin.innerHTML=""; closed.innerHTML="";
 let q=s?s.value.toLowerCase():"";
 let dep=d?d.value:"";

 complaints
  .filter(c=>q==""||c.user.toLowerCase().includes(q))
  .filter(c=>dep==""||c.dept==dep)
  .forEach((c,i)=>{
   let color=c.priority=="High"?"#dc3545":c.priority=="Medium"?"#f0ad4e":"#28a745";
   let late=c.days>c.sla?"style='background:#ffcccc'":"";
   let box=`<div class="box" style="border-left:6px solid ${color}" ${late}>
    <b>${c.title}</b> (${c.category})<br>
    Dept:${c.dept} | Priority:${c.priority}<br>
    Days:${c.days}/${c.sla}<br>
    <select id="status${i}">
     <option ${c.status=="Pending"?"selected":""}>Pending</option>
     <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
    </select>
    <button onclick="saveStatus(${i})">Save</button>
   </div>`;
   (c.status=="Resolved"?closed:admin).innerHTML+=box;
  });

 loadChart();
}

function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

/* ===== EXPORT ===== */
function exportExcel(){
 let csv="ID,User,Dept,Priority,Title,Status,Time\n";
 complaints.forEach(c=>csv+=`${c.id},${c.user},${c.dept},${c.priority},${c.title},${c.status},${c.time}\n`);
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv])); a.download="complaints.csv"; a.click();
}

function exportPDF(){
 let w=window.open("");
 w.document.write("<h2>GLA Complaint Report</h2>");
 complaints.forEach(c=>w.document.write(`<p>${c.id} | ${c.user} | ${c.title} | ${c.status}</p>`));
 w.print();
}

/* ===== METER + CHART + NOTIFY ===== */
function updateSolved(){
 let m=document.getElementById("solvedMeter");
 if(!m) return;
 let u=localStorage.getItem("loginUser");
 let t=complaints.filter(c=>c.user==u).length;
 let r=complaints.filter(c=>c.user==u&&c.status=="Resolved").length;
 m.innerText=t?Math.round(r/t*100)+"% Solved":"0% Solved";
}

function loadChart(){
 let c=document.getElementById("chart");
 if(!c) return;
 let p=complaints.filter(x=>x.status=="Pending").length;
 let r=complaints.filter(x=>x.status=="Resolved").length;
 if(myChart) myChart.destroy();
 myChart=new Chart(c,{type:"pie",data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}});
}

function checkNotify(){
 let n=document.getElementById("notifyCount");
 let u=localStorage.getItem("loginUser");
 if(!n||!u) return;
 n.innerText=complaints.filter(c=>c.user==u&&c.status!="Resolved").length;
}

function toggleDark(){document.body.classList.toggle("dark");}

window.onload=()=>{ loadMy(); loadAdmin(); loadChart(); updateSolved(); checkNotify(); };
