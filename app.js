let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin",role:"Admin",uid:"ADMIN"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="";
let myChart;
let currentFilter="All";

/* ================= REGISTER ================= */
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

/* ================= LOGIN ================= */
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
  if(usr.role=="Admin") window.location="admin.html";
  else if(usr.role=="Teacher") window.location="teacher.html";
  else window.location="student.html";
 } else alert("Invalid OTP");
}

function logout(){
 localStorage.removeItem("loginUser");
 window.location="index.html";
}

/* ================= ADD COMPLAINT ================= */
function addComplaint(){
 let t=title.value.trim(), d=desc.value.trim();
 if(!t||!d){alert("Fill all fields");return;}
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

/* ================= STUDENT & TEACHER VIEW ================= */
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
   <button onclick="editComplaint(${i})">✏ Edit</button>
   <button onclick="deleteComplaint(${i})">🗑 Delete</button>
   <small>${c.time}</small>
  </div>`;
 });
}

/* ================= ADMIN VIEW ================= */
function loadAdmin(){
 if(!document.getElementById("adminList")) return;
 let q=document.getElementById("search")?search.value.toLowerCase():"";
 adminList.innerHTML="";

 complaints
 .filter(c => currentFilter=="All" ? true : c.status==currentFilter)
 .filter(c => c.user.toLowerCase().includes(q))
 .forEach((c,i)=>{

 let color = c.status=="Pending"?"#f39c12":
             c.status=="In Progress"?"#3498db":
             c.status=="Resolved"?"#2ecc71":"#e74c3c";

 adminList.innerHTML+=`
  <div class="box" style="border-left:6px solid ${color}">
   <h3>${c.title}</h3>
   <p>${c.desc}</p>
   User: ${c.user}<br>

   <select id="status${i}">
    <option ${c.status=="Pending"?"selected":""}>Pending</option>
    <option ${c.status=="In Progress"?"selected":""}>In Progress</option>
    <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
    <option ${c.status=="Cancelled"?"selected":""}>Cancelled</option>
   </select>
   <button onclick="saveStatus(${i})">Save</button>
   <button onclick="deleteComplaint(${i})">Delete</button><br>

   <small>${c.time}</small>
  </div>`;
 });
}

/* ================= EDIT & DELETE ================= */
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

/* ================= SAVE STATUS ================= */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin(); loadChart();
}

/* ================= CHART FILTER WITH COLORS ================= */
function loadChart(){
 if(!document.getElementById("chart")) return;

 let statuses=["Pending","In Progress","Resolved","Cancelled"];
 let colors=["#f39c12","#3498db","#2ecc71","#e74c3c"];
 let data=statuses.map(s=>complaints.filter(c=>c.status==s).length);

 if(myChart) myChart.destroy();

 myChart=new Chart(chart,{
  type:"pie",
  data:{labels:statuses,datasets:[{data:data,backgroundColor:colors}]},
  options:{
   onClick:function(evt,items){
    if(items.length){
     currentFilter=statuses[items[0].index];
    } else currentFilter="All";
    loadAdmin();
   }
  }
 });
}

/* ================= INIT ================= */
window.onload=function(){
 loadMy();
 loadAdmin();
 loadChart();
}
