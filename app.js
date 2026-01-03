let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let otpCode="", myChart;

/* =============== AI CATEGORY ================= */
function getCategory(desc){
 desc=desc.toLowerCase();
 if(desc.includes("hostel")) return "Hostel";
 if(desc.includes("lab")) return "Lab";
 if(desc.includes("fee")) return "Fee";
 if(desc.includes("wifi")||desc.includes("network")) return "Network";
 if(desc.includes("transport")||desc.includes("bus")) return "Transport";
 return "General";
}

/* =============== AUTH ================= */
function register(){
 let ru=ruser.value.trim(), rp=rpass.value.trim();
 if(!ru||!rp) return alert("Fill all");
 users.push({username:ru,password:rp});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=rpass.value="";
 alert("Registered");
}

function login(){
 let found=users.find(x=>x.username===user.value.trim() && x.password===pass.value.trim());
 if(!found) return alert("Invalid Login");
 otpCode=Math.floor(100000+Math.random()*900000);
 alert("OTP: "+otpCode);
}

function verifyOTP(){
 if(otp.value==otpCode){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 } else alert("Wrong OTP");
}

function logout(){localStorage.clear();location="index.html";}

/* =============== ADD COMPLAINT ================= */
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
  status:"Pending",
  days:0,
  sla:sla,
  notified:false,
  time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* =============== STUDENT VIEW ================= */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML=""; archive.innerHTML="";
 complaints.filter(c=>c.user==u).forEach(c=>{
  let box=`<div class="box">
   <b>${c.title}</b> (${c.category})<br>
   Status:${c.status} | SLA:${c.sla-c.days} days
  </div>`;
  if(c.status=="Resolved") archive.innerHTML+=box;
  else myComplaints.innerHTML+=box;
 });
 checkNotify();
}

/* =============== ADMIN VIEW ================= */
function loadAdmin(){
 if(!adminList) return;
 adminList.innerHTML=""; closedList.innerHTML="";
 let q=search.value.toLowerCase();
 let d=deptFilter.value;

 complaints
 .filter(c=>c.user.toLowerCase().includes(q))
 .filter(c=>d==""||c.dept==d)
 .forEach((c,i)=>{
  let color=c.priority=="High"?"#dc3545":c.priority=="Medium"?"#f0ad4e":"#28a745";
  let late = c.days>c.sla?"style='background:#ffcccc'":"";
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

/* =============== SAVE STATUS ================= */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 complaints[i].notified=false;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

/* =============== CHART ================= */
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

/* =============== NOTIFICATION ================= */
function checkNotify(){
 let u=localStorage.getItem("loginUser");
 if(!u||!notifyCount) return;
 let n=complaints.filter(c=>c.user==u && c.notified!==true).length;
 notifyCount.innerText=n;
}

/* =============== DARK MODE ================= */
function toggleDark(){document.body.classList.toggle("dark");}

/* =============== AUTO DAY COUNTER ================= */
window.addEventListener("load",()=>{
 complaints.forEach(c=>{ if(c.status!="Resolved") c.days++; });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy(); loadAdmin(); loadChart(); checkNotify();
});
