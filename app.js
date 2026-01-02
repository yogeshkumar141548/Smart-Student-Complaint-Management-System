let users = JSON.parse(localStorage.getItem("users")) || [{username:"admin",password:"admin"}];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];
let generatedOTP="";
let myChart;
let currentFilter="All";

/* REGISTER */
function register(){
 let u=ruser.value.trim(), p=rpass.value.trim();
 if(!u||!p){alert("Fill all fields");return;}
 users.push({username:u,password:p});
 localStorage.setItem("users",JSON.stringify(users));
 alert("Registered Successfully");
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
 if(otp.value===generatedOTP){
  localStorage.setItem("loginUser",user.value);
  window.location = (user.value==="admin")?"admin.html":"dashboard.html";
 } else alert("Invalid OTP");
}

function logout(){
 localStorage.removeItem("loginUser");
 window.location="index.html";
}

/* ADD COMPLAINT */
function addComplaint(){
 let t=title.value.trim(), d=desc.value.trim();
 if(!t||!d){alert("Fill all fields");return;}
 let f=file.files[0];
 let reader=new FileReader();
 reader.onload=function(){
  complaints.push({
   id:"CMP"+(complaints.length+1),
   user:localStorage.getItem("loginUser"),
   title:t, desc:d, file:reader.result,
   status:"Pending", time:new Date().toLocaleString()
  });
  localStorage.setItem("complaints",JSON.stringify(complaints));
  title.value=""; desc.value=""; file.value="";
  loadMy();
 }
 if(f) reader.readAsDataURL(f); else reader.onload();
}

/* STUDENT VIEW */
function loadMy(){
 if(!document.getElementById("myComplaints")) return;
 let u=localStorage.getItem("loginUser");
 myComplaints.innerHTML="";
 complaints.filter(c=>c.user===u).forEach((c,i)=>{
  myComplaints.innerHTML+=`
  <div class="box">
   <h3>${c.title}</h3>
   <p>${c.desc}</p>
   Status: ${c.status}<br>
   ${c.file?`<a href="${c.file}" target="_blank">View File</a>`:""}<br>
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

   ${c.file?`<a href="${c.file}" target="_blank">View File</a>`:""}<br>
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

/* SAVE STATUS */
function saveStatus(i){
 complaints[i].status=document.getElementById("status"+i).value;
 localStorage.setItem("complaints",JSON.stringify(complaints));
 loadAdmin(); loadChart();
}

/* EXPORT */
function exportExcel(){
 let csv="ID,User,Title,Description,Status,Time\n";
 complaints.forEach(c=>csv+=`${c.id},${c.user},${c.title},${c.desc},${c.status},${c.time}\n`);
 let blob=new Blob([csv],{type:"text/csv"});
 let a=document.createElement("a");
 a.href=URL.createObjectURL(blob);
 a.download="complaints.csv";
 a.click();
}

function exportPDF(){
 const {jsPDF}=window.jspdf;
 let doc=new jsPDF(), y=10;
 doc.text("Complaint Report",10,y); y+=10;
 complaints.forEach(c=>{
  doc.text(`${c.id} | ${c.user} | ${c.title} | ${c.status}`,10,y);
  y+=8;
 });
 doc.save("complaints.pdf");
}

/* DARK MODE */
function toggleDark(){
 document.body.classList.toggle("dark");
 localStorage.setItem("dark",document.body.classList.contains("dark"));
}
if(localStorage.getItem("dark")=="true") document.body.classList.add("dark");

/* CHART WITH FILTER */
function loadChart(){
 if(!document.getElementById("chart"))return;

 let statuses=["Pending","In Progress","Resolved","Cancelled"];
 let colors=["#f39c12","#3498db","#2ecc71","#e74c3c"];
 let data=statuses.map(s=>complaints.filter(c=>c.status==s).length);

 if(myChart) myChart.destroy();

 myChart=new Chart(chart,{
  type:"pie",
  data:{
   labels:statuses,
   datasets:[{data:data,backgroundColor:colors}]
  },
  options:{
   onClick:function(evt,items){
    if(items.length){
     currentFilter=statuses[items[0].index];
    }else currentFilter="All";
    loadAdmin();
   }
  }
 });
}

window.onload=function(){loadMy();loadAdmin();loadChart();}
