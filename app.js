let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart;

/* AI CATEGORY */
function getCategory(desc){
 desc=desc.toLowerCase();
 if(desc.includes("hostel")) return "Hostel";
 if(desc.includes("lab")) return "Lab";
 if(desc.includes("fee")) return "Fee";
 if(desc.includes("wifi")||desc.includes("network")) return "Network";
 if(desc.includes("transport")||desc.includes("bus")) return "Transport";
 return "General";
}

/* REGISTER */
function register(){
 if(!ruser.value||!rpass.value) return alert("Fill all");
 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=""; rpass.value="";
 alert("Registered");
}

/* LOGIN */
function login(){
 let f=users.find(u=>u.username==user.value&&u.password==pass.value);
 if(f){
  generatedOTP=Math.floor(100000+Math.random()*900000);
  alert("OTP:"+generatedOTP);
 } else alert("Invalid Login");
}

/* VERIFY */
function verifyOTP(){
 if(otp.value==generatedOTP){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 }
}

/* LOGOUT */
function logout(){localStorage.clear();location="index.html";}

/* ADD COMPLAINT */
function addComplaint(){
 let pri=priority.value;
 let sla = pri=="High"?2 : pri=="Medium"?4 : 7;
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

/* STUDENT VIEW */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML=""; archive.innerHTML="";
 complaints.filter(c=>c.user==u).forEach(c=>{
  let box=`<div class="box modern">${c.title} (${c.category})<br>
   Status:${c.status} | SLA:${c.sla-c.days} days</div>`;
  if(c.status=="Resolved") archive.innerHTML+=box;
  else myComplaints.innerHTML+=box;
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 checkNotify();
}

/* ADMIN VIEW */
function loadAdmin(){
 if(!adminList) return;
 adminList.innerHTML=""; closedList.innerHTML="";
 complaints
 .filter(c=>c.user.toLowerCase().includes(search.value.toLowerCase()))
 .filter(c=>deptFilter.value==""||c.dept==deptFilter.value)
 .forEach((c,i)=>{
  let color = c.priority=="High"?"#dc3545":c.priority=="Medium"?"#f0ad4e":"#28a745";
  let late = c.days>c.sla ? "style='background:#ffcccc'" : "";
  let box=`<div class="box modern" style="border-left:6px solid ${color}" ${late}>
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

/* SAVE STATUS */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 complaints[i].notified=false;
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

/* NOTIFICATION */
function checkNotify(){
 let u=localStorage.getItem("loginUser");
 if(!u||!notifyCount) return;
 let n=complaints.filter(c=>c.user==u && c.notified!==true).length;
 notifyCount.innerText=n;
}

/* AUTO DAY COUNTER */
window.addEventListener("load",()=>{
 complaints.forEach(c=>{ if(c.status!="Resolved") c.days++; });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 document.getElementById("loader")?.style.display="none";
 loadMy(); loadAdmin(); loadChart(); checkNotify();
});
