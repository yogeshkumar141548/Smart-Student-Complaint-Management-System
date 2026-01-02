let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

/* REGISTER */
function register(){
 let u=ruser.value.trim();
 let p=rpass.value.trim();
 if(!u||!p){alert("Fill all fields");return;}
 users.push({username:u,password:p});
 localStorage.setItem("users",JSON.stringify(users));
 alert("Registered Successfully");
}

/* LOGIN */
function login(){
 let u=user.value.trim();
 let p=pass.value.trim();
 let found=users.find(x=>x.username===u && x.password===p);
 if(found){
  localStorage.setItem("loginUser",u);
  window.location = (u==="admin")?"admin.html":"dashboard.html";
 }else alert("Invalid Login");
}

/* LOGOUT */
function logout(){
 localStorage.removeItem("loginUser");
 window.location="index.html";
}

/* ADD COMPLAINT */
function addComplaint(){
 let t=title.value.trim();
 let d=desc.value.trim();
 if(!t||!d){alert("Title & Description required");return;}

 complaints.push({
  id:"CMP"+(complaints.length+1),
  user:localStorage.getItem("loginUser"),
  title:t,
  desc:d,
  status:"Pending",
  time:new Date().toLocaleString()
 });

 localStorage.setItem("complaints",JSON.stringify(complaints));
 title.value=""; desc.value="";
 loadMy();
}

/* STUDENT VIEW */
function loadMy(){
 if(!document.getElementById("myComplaints")) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user===u).forEach(c=>{
  myComplaints.innerHTML+=`
  <div class="box">
   <b>${c.id}</b><br>
   ${c.title}<br>${c.desc}<br>
   Status: ${c.status}<br>${c.time}
  </div>`;
 });
}

/* ADMIN VIEW */
function loadAdmin(){
 if(!document.getElementById("adminList")) return;
 let q=document.getElementById("search")?.value.toLowerCase()||"";
 adminList.innerHTML="";
 complaints.filter(c=>c.user.toLowerCase().includes(q)).forEach((c,i)=>{
  adminList.innerHTML+=`
  <div class="box">
   <b>${c.id}</b> - ${c.user}<br>
   ${c.title}<br>${c.desc}<br>
   <select onchange="updateStatus(${i},this.value)">
    <option ${c.status==="Pending"?"selected":""}>Pending</option>
    <option ${c.status==="In Progress"?"selected":""}>In Progress</option>
    <option ${c.status==="Solved"?"selected":""}>Solved</option>
   </select><br>${c.time}
  </div>`;
 });
}

function updateStatus(i,v){
 complaints[i].status=v;
 localStorage.setItem("complaints",JSON.stringify(complaints));
}

/* AUTO LOAD */
window.onload=function(){
 loadMy();
 loadAdmin();
};
