let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="";

function register(){
 let u=ruser.value.trim(),p=rpass.value.trim();
 if(!u||!p){alert("Fill all fields");return;}
 users.push({username:u,password:p});
 localStorage.setItem("users",JSON.stringify(users));
 alert("Registered Successfully");
}

function login(){
 let u=user.value.trim(),p=pass.value.trim();
 let found=users.find(x=>x.username===u && x.password===p);
 if(found){
  generatedOTP=Math.floor(100000+Math.random()*900000).toString();
  alert("Your OTP: "+generatedOTP);
 } else alert("Invalid Login");
}

function verifyOTP(){
 if(otp.value===generatedOTP){
  localStorage.setItem("loginUser",user.value);
  window.location = (user.value==="admin")?"admin.html":"dashboard.html";
 } else alert("Invalid OTP");
}

function logout(){
 localStorage.removeItem("loginUser");
 window.location="index.html";
}

function addComplaint(){
 let t=title.value.trim(),d=desc.value.trim();
 if(!t||!d){alert("Fill all fields");return;}
 let f=file.files[0];
 let reader=new FileReader();
 reader.onload=function(){
  complaints.push({
   id:"CMP"+(complaints.length+1),
   user:localStorage.getItem("loginUser"),
   title:t,desc:d,file:reader.result,
   status:"Pending",time:new Date().toLocaleString()
  });
  localStorage.setItem("complaints",JSON.stringify(complaints));
  title.value="";desc.value="";file.value="";
  loadMy();
 }
 if(f) reader.readAsDataURL(f); else reader.onload();
}

function loadMy(){
 if(!document.getElementById("myComplaints"))return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user===u).forEach(c=>{
  myComplaints.innerHTML+=`
  <div class="box">
   <h3>${c.title}</h3><p>${c.desc}</p>
   Status: ${c.status}<br>
   ${c.file?`<a href="${c.file}" target="_blank">View File</a>`:""}
   <small>${c.time}</small>
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
   <h3>${c.title}</h3><p>${c.desc}</p>
   User: ${c.user}<br>
   <select id="status${i}">
    <option ${c.status=="Pending"?"selected":""}>Pending</option>
    <option ${c.status=="In Progress"?"selected":""}>In Progress</option>
    <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
    <option ${c.status=="Cancelled"?"selected":""}>Cancelled</option>
   </select>
   <button onclick="saveStatus(${i})">Save</button><br>
   ${c.file?`<a href="${c.file}" target="_blank">View File</a>`:""}
   <small>${c.time}</small>
  </div>`;
 });
}

function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin(); loadChart();
}

function exportExcel(){
 let csv="ID,User,Title,Description,Status,Time\n";
 complaints.forEach(c=>csv+=`${c.id},${c.user},${c.title},${c.desc},${c.status},${c.time}\n`);
 let blob=new Blob([csv],{type:"text/csv"});
 let a=document.createElement("a");a.href=URL.createObjectURL(blob);
 a.download="complaints.csv";a.click();
}

function exportPDF(){
 const {jsPDF}=window.jspdf;
 let doc=new jsPDF(); let y=10;
 doc.text("Complaint Report",10,y); y+=10;
 complaints.forEach(c=>{doc.text(`${c.id} | ${c.user} | ${c.title} | ${c.status}`,10,y); y+=8;});
 doc.save("complaints.pdf");
}

function toggleDark(){
 document.body.classList.toggle("dark");
 localStorage.setItem("dark",document.body.classList.contains("dark"));
}
if(localStorage.getItem("dark")=="true") document.body.classList.add("dark");

let myChart;
function loadChart(){
 if(!document.getElementById("chart"))return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let ip=complaints.filter(c=>c.status=="In Progress").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 let c=complaints.filter(c=>c.status=="Cancelled").length;
 if(myChart) myChart.destroy();
 myChart=new Chart(chart,{type:"pie",data:{labels:["Pending","In Progress","Resolved","Cancelled"],datasets:[{data:[p,ip,r,c]}]}});
}

window.onload=function(){loadMy();loadAdmin();loadChart();}
