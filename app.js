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
 let u=user.value.trim(), p=pass.value.trim();
 let found=users.find(x=>x.username===u && x.password===p);
 if(found){
  generatedOTP=Math.floor(100000+Math.random()*900000).toString();
  alert("Your OTP: "+generatedOTP);
 } else alert("Invalid Login");
}

function verifyOTP(){
 let u=user.value;
 let usr=users.find(x=>x.username==u);
 if(otp.value===generatedOTP){
  localStorage.setItem("loginUser",u);
  if(usr.role=="Admin") location="admin.html";
  else if(usr.role=="Teacher") location="teacher.html";
  else location="student.html";
 } else alert("Invalid OTP");
}

function logout(){
 localStorage.removeItem("loginUser");
 location="index.html";
}

/* ADD COMPLAINT */
function addComplaint(){
 let t=title.value.trim(), d=desc.value.trim();
 if(!t||!d){alert("Fill all");return;}
 complaints.push({
  id:"CMP"+(complaints.length+1),
  user:localStorage.getItem("loginUser"),
  title:t,
  desc:d,
  status:"Pending",
  time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

/* STUDENT & TEACHER VIEW */
function loadMy(){
 if(!document.getElementById("myComplaints")) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user===u).forEach((c,i)=>{
  myComplaints.innerHTML+=`
   <div class="box">
    <h3>${c.title}</h3>
    <p>${c.desc}</p>
    <b>Status:</b> ${c.status}<br>
    <button onclick="editComplaint(${i})">Edit</button>
    <button onclick="deleteComplaint(${i})">Delete</button>
    <small>${c.time}</small>
   </div>`;
 });
}

/* ADMIN VIEW */
function loadAdmin(){
 if(!document.getElementById("adminList")) return;
 let q=search.value.toLowerCase();
 adminList.innerHTML="";
 complaints.filter(c=>c.user.toLowerCase().includes(q)).forEach((c,i)=>{
  adminList.innerHTML+=`
   <div class="box">
    <h3>${c.title}</h3>
    <p>${c.desc}</p>
    User: ${c.user}<br>
    <b>Status:</b> ${c.status}<br>
    <button onclick="deleteComplaint(${i})">Delete</button>
    <small>${c.time}</small>
   </div>`;
 });
}

/* EDIT & DELETE */
function editComplaint(i){
 let nt=prompt("Edit Title",complaints[i].title);
 let nd=prompt("Edit Description",complaints[i].desc);
 if(nt && nd){
  complaints[i].title=nt;
  complaints[i].desc=nd;
  localStorage.setItem("complaints",JSON.stringify(complaints));
  loadMy(); loadAdmin(); loadChart();
 }
}

function deleteComplaint(i){
 if(confirm("Delete this complaint?")){
  complaints.splice(i,1);
  localStorage.setItem("complaints",JSON.stringify(complaints));
  loadMy(); loadAdmin(); loadChart();
 }
}

/* CHART */
function loadChart(){
 if(!document.getElementById("chart")) return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 new Chart(chart,{
  type:"pie",
  data:{labels:["Pending","Resolved"],
        datasets:[{data:[p,r],backgroundColor:["#f39c12","#2ecc71"]}]}
 });
}

window.onload=function(){
 loadMy();
 loadAdmin();
 loadChart();
}
