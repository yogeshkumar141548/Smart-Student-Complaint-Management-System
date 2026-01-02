let users = JSON.parse(localStorage.getItem("users")) || [
  {username:"admin",password:"admin"}
];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

function register(){
  let u = ruser.value;
  let p = rpass.value;
  if(u==""||p==""){alert("Fill all fields");return;}

  users.push({username:u,password:p});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Registered Successfully");
}

function login(){
  let u = user.value;
  let p = pass.value;

  let found = users.find(x=>x.username==u && x.password==p);

  if(found){
    localStorage.setItem("loginUser",u);
    if(u=="admin"){
      window.location="admin.html";
    }else{
      window.location="dashboard.html";
    }
  }else alert("Invalid Login");
}

function addComplaint(){
  complaints.push({
    user: localStorage.getItem("loginUser"),
    title: title.value,
    desc: desc.value,
    status:"Pending"
  });
  localStorage.setItem("complaints",JSON.stringify(complaints));
  alert("Complaint Submitted");
  location.reload();
}

if(document.getElementById("adminList")){
  complaints.forEach((c,i)=>{
    adminList.innerHTML += `
    <div class="box">
    <b>${c.title}</b><br>
    ${c.desc}<br>
    User: ${c.user}<br>
    Status: ${c.status}
    <button onclick="deleteComplaint(${i})">Delete</button>
    </div>`;
  });
}

function deleteComplaint(i){
  complaints.splice(i,1);
  localStorage.setItem("complaints",JSON.stringify(complaints));
  location.reload();
}
