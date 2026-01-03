let users=JSON.parse(localStorage.getItem("users"))||[{username:"admin",password:"admin"}];
let complaints=JSON.parse(localStorage.getItem("complaints"))||[];
let generatedOTP="",myChart;

function register(){
 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));
 ruser.value=rpass.value="";
 alert("Registered Successfully");
}

function login(){
 let f=users.find(u=>u.username==user.value&&u.password==pass.value);
 if(f){generatedOTP=Math.floor(100000+Math.random()*900000);alert("OTP:"+generatedOTP);}
}

function verifyOTP(){
 if(otp.value==generatedOTP){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 }
}

function logout(){localStorage.clear();location="index.html";}

function addComplaint(){
 complaints.push({
  id:"CMP"+Date.now(),
  user:localStorage.getItem("loginUser"),
  dept:dept.value,priority:priority.value,
  title:title.value,desc:desc.value,
  status:"Pending",time:new Date().toLocaleString()
 });
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadMy();
}

function loadMy(){
 if(!myComplaints)return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u).forEach(c=>{
  myComplaints.innerHTML+=`<div class="box">${c.title} - ${c.status}</div>`;
 });
}

function loadAdmin(){
 if(!adminList)return;
 adminList.innerHTML="";
 complaints.filter(c=>c.user.toLowerCase().includes(search.value.toLowerCase()))
 .forEach((c,i)=>{
  adminList.innerHTML+=`
   <div class="box">${c.title}
    <select id="s${i}">
     <option>Pending</option><option>Resolved</option>
    </select>
    <button onclick="saveStatus(${i})">Save</button>
   </div>`;
 });
}

function saveStatus(i){
 complaints[i].status=document.getElementById("s"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

function toggleDark(){document.body.classList.toggle("dark");}

window.addEventListener("load",()=>document.getElementById("loader").style.display="none");
