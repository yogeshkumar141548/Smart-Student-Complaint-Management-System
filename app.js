let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

function register(){
 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));
 alert("Registered");
}

function login(){
 let u=user.value,p=pass.value;
 let found=users.find(x=>x.username==u && x.password==p);
 if(found){
  localStorage.setItem("loginUser",u);
  window.location = u=="admin" ? "admin.html":"dashboard.html";
 } else alert("Invalid");
}

function logout(){
 localStorage.removeItem("loginUser");
 window.location="index.html";
}

function addComplaint(){
 complaints.push({
  id:"CMP"+(complaints.length+1),
  user:localStorage.getItem("loginUser"),
  title:title.value,
  desc:desc.value,
  status:"Pending",
  time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

function loadMy(){
 let u=localStorage.getItem("loginUser");
 if(!document.getElementById("myComplaints"))return;
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u).forEach(c=>{
  myComplaints.innerHTML+=`
  <div class="box">
  <b>${c.id}</b> - ${c.title}<br>
  ${c.desc}<br>Status:${c.status}<br>${c.time}
  </div>`;
 });
}

function loadAdmin(){
 if(!document.getElementById("adminList"))return;
 let q=search.value.toLowerCase();
 adminList.innerHTML="";
 complaints.filter(c=>c.user.toLowerCase().includes(q)).forEach((c,i)=>{
  adminList.innerHTML+=`
  <div class="box">
  <b>${c.id}</b> - ${c.user}<br>${c.title}<br>${c.desc}<br>
  Status: 
  <select onchange="updateStatus(${i},this.value)">
    <option>Pending</option>
    <option>In Progress</option>
    <option>Solved</option>
  </select>
  <br>${c.time}
  </div>`;
 });
}

function updateStatus(i,v){
 complaints[i].status=v;
 localStorage.setItem("complaints",JSON.stringify(complaints));
}

loadMy();
loadAdmin();
