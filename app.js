let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin",role:"Admin",uid:"ADMIN"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart, currentFilter="All";

function register(){
 let role=role.value, uid=uid.value.trim(), u=ruser.value.trim(), p=rpass.value.trim();
 if(!u||!p||!uid){alert("Fill all fields");return;}
 users.push({username:u,password:p,role,uid});
 localStorage.setItem("users",JSON.stringify(users));
 alert(role+" Registered");
}

function login(){
 let u=user.value.trim(), p=pass.value.trim();
 let found=users.find(x=>x.username===u && x.password===p);
 if(found){ generatedOTP=(Math.floor(100000+Math.random()*900000)).toString(); alert("OTP: "+generatedOTP); }
 else alert("Invalid");
}

function verifyOTP(){
 let u=user.value;
 let usr=users.find(x=>x.username==u);
 if(otp.value===generatedOTP){
  localStorage.setItem("loginUser",u);
  if(usr.role=="Admin") location="admin.html";
  else if(usr.role=="Teacher") location="teacher.html";
  else location="student.html";
 } else alert("Wrong OTP");
}

function logout(){localStorage.removeItem("loginUser");location="index.html";}

function addComplaint(){
 let t=title.value.trim(), d=desc.value.trim();
 if(!t||!d){alert("Fill all");return;}
 let f=file.files[0];
 let reader=new FileReader();
 reader.onload=()=>{complaints.push({id:"CMP"+(complaints.length+1),user:localStorage.getItem("loginUser"),title:t,desc:d,file:reader.result,status:"Pending",time:new Date().toLocaleString()});
 localStorage.setItem("complaints",JSON.stringify(complaints)); loadMy();}
 if(f) reader.readAsDataURL(f); else reader.onload();
}

function loadMy(){
 if(!myComplaints)return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u).forEach((c,i)=>{
  myComplaints.innerHTML+=`<div class="box"><h3>${c.title}</h3><p>${c.desc}</p>Status:${c.status}<br><button onclick="deleteComplaint(${i})">Delete</button></div>`;
 });
}

function loadTeacher(){
 if(!teacherList)return;
 teacherList.innerHTML="";
 complaints.forEach(c=>{
  teacherList.innerHTML+=`<div class="box"><h3>${c.title}</h3><p>${c.desc}</p>Status:${c.status}</div>`;
 });
}

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

function saveStatus(i){complaints[i].status=document.getElementById("s"+i).value;localStorage.setItem("complaints",JSON.stringify(complaints));loadAdmin();loadChart();}
function deleteComplaint(i){complaints.splice(i,1);localStorage.setItem("complaints",JSON.stringify(complaints));loadMy();loadAdmin();loadTeacher();loadChart();}

function exportExcel(){alert("Excel Export Logic");}
function exportPDF(){alert("PDF Export Logic");}

function toggleDark(){document.body.classList.toggle("dark");}

function loadChart(){
 if(!chart)return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 myChart=new Chart(chart,{type:"pie",data:{labels:["Pending","Resolved"],datasets:[{data:[p,r]}]}});
}

window.onload=()=>{loadMy();loadTeacher();loadAdmin();loadChart();}
