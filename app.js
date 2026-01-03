document.addEventListener("DOMContentLoaded", function(){

 window.login = function(){
   let u = document.getElementById("user").value;
   let p = document.getElementById("pass").value;

   let found = users.find(x=>x.username===u && x.password===p);
   if(!found){ alert("Invalid Login"); return; }

   otpCode = Math.floor(100000+Math.random()*900000);
   alert("Your OTP: " + otpCode);
 };

 window.verifyOTP = function(){
   let o = document.getElementById("otp").value;
   if(o==otpCode){
     localStorage.setItem("loginUser", document.getElementById("user").value);
     location = (document.getElementById("user").value=="admin")?"admin.html":"dashboard.html";
   } else alert("Wrong OTP");
 };

 window.register = function(){
   let ru = document.getElementById("ruser").value;
   let rp = document.getElementById("rpass").value;
   if(!ru||!rp){alert("Fill all"); return;}
   users.push({username:ru,password:rp});
   localStorage.setItem("users",JSON.stringify(users));
   document.getElementById("ruser").value="";
   document.getElementById("rpass").value="";
   alert("Registered Successfully");
 };
});


/* AI Category */
function getCategory(desc){
 desc=desc.toLowerCase();
 if(desc.includes("hostel")) return "Hostel";
 if(desc.includes("lab")) return "Lab";
 if(desc.includes("fee")) return "Fee";
 if(desc.includes("wifi")||desc.includes("network")) return "Network";
 if(desc.includes("bus")||desc.includes("transport")) return "Transport";
 return "General";
}

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
 if(!found) return alert("Invalid Login");
 otpCode = Math.floor(100000+Math.random()*900000);
 alert("Your OTP: "+otpCode);
}

/* VERIFY OTP */
function verifyOTP(){
 if(otp.value==otpCode){
  localStorage.setItem("loginUser",user.value);
  location = (user.value=="admin")?"admin.html":"dashboard.html";
 } else alert("Wrong OTP");
}

/* LOGOUT */
function logout(){
 localStorage.clear();
 location="index.html";
}

/* ADD COMPLAINT */
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

/* STUDENT VIEW */
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

/* ADMIN VIEW */
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
 myChart=new Chart(chart,{
  type:"pie",
  data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}
 });
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
 loadMy(); loadAdmin(); loadChart(); checkNotify();
});


function toggleDark(){
 document.body.classList.toggle("dark");
}


document.getElementById("loginBtn")?.addEventListener("click",function(){
 let u=document.getElementById("user").value;
 let p=document.getElementById("pass").value;

 let found=users.find(x=>x.username===u && x.password===p);
 if(!found){alert("Invalid Login");return;}

 otpCode=Math.floor(100000+Math.random()*900000);
 alert("Your OTP: "+otpCode);
});
document.getElementById("verifyBtn")?.addEventListener("click",function(){
 let o=document.getElementById("otp").value;
 if(o==otpCode){
  localStorage.setItem("loginUser",document.getElementById("user").value);
  location=(document.getElementById("user").value=="admin")?"admin.html":"dashboard.html";
 }else alert("Wrong OTP");
});



document.addEventListener("DOMContentLoaded",()=>{

 /* Login */
 document.getElementById("loginBtn")?.addEventListener("click",login);

 /* OTP Verify */
 document.getElementById("verifyBtn")?.addEventListener("click",verifyOTP);

 /* Register */
 document.getElementById("regBtn")?.addEventListener("click",register);

 /* Add Complaint */
 document.getElementById("addBtn")?.addEventListener("click",addComplaint);

});
document.addEventListener("DOMContentLoaded", function () {

 let loginBtn = document.getElementById("loginBtn");
 let verifyBtn = document.getElementById("verifyBtn");

 if(loginBtn){
  loginBtn.addEventListener("click", function(){
    let u = document.getElementById("user").value.trim();
    let p = document.getElementById("pass").value.trim();

    let found = users.find(x=>x.username===u && x.password===p);
    if(!found){ alert("Invalid Login"); return; }

    otpCode = Math.floor(100000+Math.random()*900000);
    alert("Your OTP: " + otpCode);
  });
 }

 if(verifyBtn){
  verifyBtn.addEventListener("click", function(){
    let o = document.getElementById("otp").value.trim();
    if(o === otpCode.toString()){
      localStorage.setItem("loginUser", document.getElementById("user").value);
      location = document.getElementById("user").value === "admin" ? "admin.html" : "dashboard.html";
    } else {
      alert("Wrong OTP");
    }
  });
 }

});
