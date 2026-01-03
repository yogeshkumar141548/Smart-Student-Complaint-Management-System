
let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let otpCode="", myChart;

/* ================= AUTH ================= */
function register(){
 let ru=document.getElementById("ruser").value.trim();
 let rp=document.getElementById("rpass").value.trim();
 if(!ru||!rp) return alert("Fill all");
 users.push({username:ru,password:rp});
 localStorage.setItem("users",JSON.stringify(users));
 document.getElementById("ruser").value="";
 document.getElementById("rpass").value="";
 alert("Registered Successfully");
}
function login(){
 let u=document.getElementById("user").value.trim();
 let p=document.getElementById("pass").value.trim();
 let found=users.find(x=>x.username===u && x.password===p);
 if(!found){ alert("Invalid Login"); return; }
 otpCode=Math.floor(100000+Math.random()*900000);
 alert("Your OTP: "+otpCode);
}
function verifyOTP(){
 let o=document.getElementById("otp").value.trim();
 let u=document.getElementById("user").value.trim();
 if(o==otpCode){
  localStorage.setItem("loginUser",u);
  location=(u=="admin")?"admin.html":"dashboard.html";
 } else alert("Wrong OTP");
}
function logout(){localStorage.clear();location="index.html";}

/* ================= AI CATEGORY ================= */
function getCategory(desc){
 desc=desc.toLowerCase();
 if(desc.includes("hostel")) return "Hostel";
 if(desc.includes("lab")) return "Lab";
 if(desc.includes("fee")) return "Fee";
 if(desc.includes("wifi")||desc.includes("network")) return "Network";
 if(desc.includes("transport")||desc.includes("bus")) return "Transport";
 return "General";
}

/* ================= ADD COMPLAINT ================= */
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
  file: fileUpload?.files[0]?.name || "",
  status:"Pending",
  days:0,
  sla:sla,
  notified:false,
  time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* ================= STUDENT VIEW ================= */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML=""; archive.innerHTML="";
 complaints.filter(c=>c.user==u).forEach((c,i)=>{
  let box=`<div class="box">
   <b>${c.title}</b> (${c.category})<br>
   Dept:${c.dept} | Priority:${c.priority}<br>
   Status:${c.status} | SLA:${c.sla-c.days} days<br>
   ${c.file?`📎 ${c.file}<br>`:""}
   <button onclick="editComplaint(${i})">✏ Edit</button>
   <button onclick="deleteComplaint(${i})">🗑 Delete</button>
   <button onclick="printSlip(${i})">🖨 Print</button>
  </div>`;
  if(c.status=="Resolved") archive.innerHTML+=box;
  else myComplaints.innerHTML+=box;
 });
 checkNotify(); updateSolved();
}

/* ================= ADMIN VIEW (FIXED) ================= */
function loadAdmin(){
 if(!adminList) return;
 adminList.innerHTML=""; 
 closedList.innerHTML="";

 let q = search.value.trim().toLowerCase();
 let d = deptFilter.value;

 complaints
  .filter(c => q=="" || c.user.toLowerCase().includes(q))
  .filter(c => d=="" || c.dept==d)
  .forEach((c,i)=>{
   let color = c.priority=="High"?"#dc3545":c.priority=="Medium"?"#f0ad4e":"#28a745";
   let late  = c.days>c.sla?"style='background:#ffcccc'":"";

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

   if(c.status=="Resolved") closedList.innerHTML+=box;
   else adminList.innerHTML+=box;
  });

 loadChart();
}

/* ================= SAVE STATUS ================= */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 complaints[i].notified=false;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

/* ================= PRINT ================= */
function printSlip(i){
 let c=complaints[i];
 let w=window.open("","print","width=400,height=500");
 w.document.write(`<h3>GLA University</h3>
  <p>ID:${c.id}</p><p>Student:${c.user}</p><p>Dept:${c.dept}</p>
  <p>Title:${c.title}</p><p>Status:${c.status}</p><p>Time:${c.time}</p>`);
 w.print();
}

/* ================= EXPORT ================= */
function exportExcel(){
 let csv="ID,User,Dept,Priority,Title,Status,Time\n";
 complaints.forEach(c=>{
  csv+=`${c.id},${c.user},${c.dept},${c.priority},${c.title},${c.status},${c.time}\n`;
 });
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv]));
 a.download="complaints.csv";
 a.click();
}

function exportPDF(){
 let html="<h2>GLA Complaint Report</h2>";
 complaints.forEach(c=>{
  html+=`<p>${c.id} | ${c.user} | ${c.title} | ${c.status}</p>`;
 });
 let w=window.open("");
 w.document.write(html);
 w.print();
}

/* ================= SOLVED METER ================= */
function updateSolved(){
 if(!solvedMeter) return;
 let t=complaints.filter(c=>c.user==localStorage.getItem("loginUser")).length;
 let r=complaints.filter(c=>c.user==localStorage.getItem("loginUser") && c.status=="Resolved").length;
 solvedMeter.innerText=t?Math.round((r/t)*100)+"% Solved":"0% Solved";
}

/* ================= CHART ================= */
function loadChart(){
 if(!chart) return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 if(myChart) myChart.destroy();
 myChart=new Chart(chart,{
  type:"pie",
  data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}
 });
}

/* ================= NOTIFICATION ================= */
function checkNotify(){
 let u=localStorage.getItem("loginUser");
 if(!u||!notifyCount) return;
 let n=complaints.filter(c=>c.user==u && c.notified!==true).length;
 notifyCount.innerText=n;
}

/* ================= DARK MODE ================= */
function toggleDark(){document.body.classList.toggle("dark");}

/* ================= AUTO DAY COUNTER ================= */
window.addEventListener("load",()=>{
 complaints.forEach(c=>{ if(c.status!="Resolved") c.days++; });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy(); loadAdmin(); loadChart(); checkNotify(); updateSolved();
});



document.addEventListener("DOMContentLoaded",()=>{
 if(document.getElementById("adminList")) loadAdmin();
});

