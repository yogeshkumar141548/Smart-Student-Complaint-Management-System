let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin",role:"Admin",uid:"ADMIN"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart;

/* REGISTER */
function register(){
 let roleVal=document.getElementById("role").value;
 let uidVal=document.getElementById("uid").value.trim();
 let u=document.getElementById("ruser").value.trim();
 let p=document.getElementById("rpass").value.trim();
 if(!u||!p||!uidVal){alert("Fill all fields");return;}
 users.push({username:u,password:p,role:roleVal,uid:uidVal});
 localStorage.setItem("users",JSON.stringify(users));
 alert(roleVal+" Registered Successfully");
}

/* LOGIN */
function login(){
 let u=user.value.trim(),p=pass.value.trim();
 let found=users.find(x=>x.username===u && x.password===p);
 if(found){generatedOTP=Math.floor(100000+Math.random()*900000)+"";alert("Your OTP: "+generatedOTP);}
 else alert("Invalid Login");
}

/* OTP VERIFY */
function verifyOTP(){
 let u=user.value;
 let usr=users.find(x=>x.username==u);
 if(otp.value===generatedOTP){
  localStorage.setItem("loginUser",u);
  if(usr.role=="Admin")location="admin.html";
  else if(usr.role=="Teacher")location="teacher.html";
  else location="student.html";
 }else alert("Invalid OTP");
}

function logout(){localStorage.removeItem("loginUser");location="index.html";}

/* ADD COMPLAINT */
function addComplaint(){
 let t=title.value.trim(),d=desc.value.trim();
 if(!t||!d){alert("Fill all");return;}
 complaints.push({id:"CMP"+(complaints.length+1),user:localStorage.getItem("loginUser"),title:t,desc:d,status:"Pending",time:new Date().toLocaleString()});
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* STUDENT VIEW */
function loadMy(){
 if(!myComplaints)return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u).forEach((c,i)=>{
  myComplaints.innerHTML+=`<div class="box"><h3>${c.title}</h3><p>${c.desc}</p>Status:${c.status}</div>`;
 });
}

/* TEACHER VIEW */
function loadTeacher(){
 if(!teacherList)return;
 teacherList.innerHTML="";
 complaints.forEach(c=>{
  teacherList.innerHTML+=`<div class="box"><h3>${c.title}</h3><p>${c.desc}</p>Status:${c.status}</div>`;
 });
}

/* ADMIN VIEW */
function loadAdmin(){
 if(!adminList)return;
 adminList.innerHTML="";
 complaints.forEach((c,i)=>{
  adminList.innerHTML+=`<div class="box"><h3>${c.title}</h3><p>${c.desc}</p>
  <select id="s${i}">
   <option ${c.status=="Pending"?"selected":""}>Pending</option>
   <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
  </select>
  <button onclick="saveStatus(${i})">Save</button>
  <button onclick="deleteComplaint(${i})">Delete</button></div>`;
 });
}

/* SAVE STATUS & DELETE */
function saveStatus(i){
 complaints[i].status=document.getElementById("s"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin(); loadChart();
}
function deleteComplaint(i){
 complaints.splice(i,1);
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy(); loadTeacher(); loadAdmin(); loadChart();
}

/* CHART */
function loadChart(){
 if(!chart)return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 myChart=new Chart(chart,{type:"pie",data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}});
}

/* DARK MODE */
function toggleDark(){document.body.classList.toggle("dark");}

window.onload=()=>{loadMy();loadTeacher();loadAdmin();loadChart();}
