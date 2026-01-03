let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="", myChart;

/* Register */
function register(){
 if(!ruser.value||!rpass.value) return alert("Fill all fields");

 users.push({username:ruser.value,password:rpass.value});
 localStorage.setItem("users",JSON.stringify(users));

 ruser.value="";
 rpass.value="";

 alert("Registered Successfully");
}


/* Login */
function login(){
 let found=users.find(u=>u.username==user.value&&u.password==pass.value);
 if(found){
   generatedOTP=Math.floor(100000+Math.random()*900000);
   alert("Your OTP: "+generatedOTP);
 } else alert("Invalid Login");
}

function verifyOTP(){
 if(otp.value==generatedOTP){
  localStorage.setItem("loginUser",user.value);
  location=(user.value=="admin")?"admin.html":"dashboard.html";
 } else alert("Wrong OTP");
}

function logout(){localStorage.clear();location="index.html";}

/* Add Complaint */
function addComplaint(){
 if(!dept.value||!title.value||!desc.value) return alert("Fill all fields");
 let f=file.files[0], reader=new FileReader();
 reader.onload=function(){
  complaints.push({
   id:"CMP"+(complaints.length+1),
   user:localStorage.getItem("loginUser"),
   dept:dept.value,
   priority:priority.value,
   title:title.value,
   desc:desc.value,
   file:reader.result,
   status:"Pending",
   time:new Date().toLocaleString()
  });
  localStorage.setItem("complaints",JSON.stringify(complaints));
  loadMy();
 }
 f?reader.readAsDataURL(f):reader.onload();
}

/* Student Complaints */
function loadMy(){
 if(!myComplaints) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user==u).forEach(c=>{
  myComplaints.innerHTML+=`
  <div class="box modern">
   <b>${c.title}</b> (${c.dept})<br>
   ${c.desc}<br>
   Priority: ${c.priority}<br>
   Status: ${c.status}
  </div>`;
 });
}

/* Admin Panel */
function loadAdmin(){
 if(!document.getElementById("adminList")) return;

 adminList.innerHTML="";

 let q = search ? search.value.toLowerCase() : "";
 let dpt = deptFilter ? deptFilter.value : "";

 complaints
 .filter(c => c.user.toLowerCase().includes(q))
 .filter(c => dpt=="" || c.dept==dpt)
 .forEach((c,i)=>{
  adminList.innerHTML+=`
   <div class="box modern">
    <b>${c.title}</b> (${c.dept})<br>
    ${c.desc}<br>
    Priority: ${c.priority}<br>
    <select id="status${i}">
     <option ${c.status=="Pending"?"selected":""}>Pending</option>
     <option ${c.status=="In Progress"?"selected":""}>In Progress</option>
     <option ${c.status=="Resolved"?"selected":""}>Resolved</option>
     <option ${c.status=="Cancelled"?"selected":""}>Cancelled</option>
    </select>
    <button onclick="saveStatus(${i})">Save</button>
    <button onclick="deleteComplaint(${i})" style="background:#dc3545">Delete</button>
   </div>`;
 });

 updateCounts();
 loadChart();
}

function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin();
}

function deleteComplaint(i){
 if(confirm("Delete this complaint?")){
  complaints.splice(i,1);
  localStorage.setItem("complaints",JSON.stringify(complaints));
  loadAdmin();
 }
}

/* Chart */
function loadChart(){
 if(!chart) return;
 let p=complaints.filter(c=>c.status=="Pending").length;
 let ip=complaints.filter(c=>c.status=="In Progress").length;
 let r=complaints.filter(c=>c.status=="Resolved").length;
 let c=complaints.filter(c=>c.status=="Cancelled").length;
 if(myChart) myChart.destroy();
 myChart=new Chart(chart,{
   type:"pie",
   data:{labels:["Pending","In Progress","Resolved","Cancelled"],
   datasets:[{data:[p,ip,r,c]}]}
 });
}

/* Status Counter + Percentage */
function updateCounts(){
 let total=complaints.length;
 let pending=complaints.filter(c=>c.status=="Pending").length;
 let ip=complaints.filter(c=>c.status=="In Progress").length;
 let resolved=complaints.filter(c=>c.status=="Resolved").length;
 let cancel=complaints.filter(c=>c.status=="Cancelled").length;

 pCount.innerText=pending;
 ipCount.innerText=ip;
 rCount.innerText=resolved;
 cCount.innerText=cancel;

 let percent= total ? Math.round((resolved/total)*100) : 0;
 solveBar.innerText=percent+"% Solved";
 solveBar.style.width=percent+"%";
}

/* Export */
function exportExcel(){
 let csv="ID,User,Dept,Priority,Title,Status,Time\n";
 complaints.forEach(c=>csv+=`${c.id},${c.user},${c.dept},${c.priority},${c.title},${c.status},${c.time}\n`);
 let a=document.createElement("a");
 a.href=URL.createObjectURL(new Blob([csv]));
 a.download="complaints.csv";a.click();
}

function exportPDF(){
 const {jsPDF}=window.jspdf;
 let doc=new jsPDF(),y=15;
 doc.text("GLA University Complaint Report",10,10);
 complaints.forEach(c=>{
  doc.text(`ID:${c.id} User:${c.user} Dept:${c.dept} Priority:${c.priority}`,10,y);y+=7;
  doc.text(`Title:${c.title} Status:${c.status}`,10,y);y+=10;
 });
 doc.save("Complaint_Report.pdf");
}

/* Dark Mode */
function toggleDark(){document.body.classList.toggle("dark");}

window.onload=()=>{loadMy();loadAdmin();loadChart();}
