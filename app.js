let users = JSON.parse(localStorage.getItem("users")) || [
  {username:"admin",password:"admin"}
];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

/* REGISTER */
function register(){
  let u = document.getElementById("ruser").value;
  let p = document.getElementById("rpass").value;

  if(u==""||p==""){alert("Fill all fields");return;}

  users.push({username:u,password:p});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Registered Successfully");
}

/* LOGIN */
function login(){
  let u = document.getElementById("user").value;
  let p = document.getElementById("pass").value;

  let found = users.find(x=>x.username==u && x.password==p);

  if(found){
    localStorage.setItem("loginUser",u);
    if(u=="admin"){
      window.location="admin.html";
    }else{
      window.location="dashboard.html";
    }
  }else{
    alert("Invalid Login");
  }
}

/* ADD COMPLAINT */
function addComplaint(){
  let t = document.getElementById("title").value;
  let d = document.getElementById("desc").value;

  complaints.push({
    user: localStorage.getItem("loginUser"),
    title: t,
    desc: d,
    status: "Pending"
  });

  localStorage.setItem("complaints",JSON.stringify(complaints));
  alert("Complaint Submitted");
  location.reload();
}

/* ADMIN VIEW */
if(document.getElementById("adminList")){
  complaints.forEach((c,i)=>{
    adminList.innerHTML += `
    <div class="box">
      <b>${c.title}</b> - ${c.user}<br>
      ${c.desc}<br>
      Status: ${c.status}
      <button onclick="deleteComplaint(${i})">Delete</button>
    </div>
    `;
  });
}

function deleteComplaint(i){
  complaints.splice(i,1);
  localStorage.setItem("complaints",JSON.stringify(complaints));
  location.reload();
}
