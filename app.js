let users = JSON.parse(localStorage.getItem("users")) || [];
let complaints = JSON.parse(localStorage.getItem("complaints")) || [];

function register(){
  users.push({u:ruser.value,p:rpass.value});
  localStorage.setItem("users",JSON.stringify(users));
  alert("Registered Successfully");
}

function login(){
  let u = user.value;
  let p = pass.value;
  let found = users.find(x=>x.u==u && x.p==p);
  if(found){
    localStorage.setItem("login",u);
    window.location="dashboard.html";
  }else alert("Invalid Login");
}

function addComplaint(){
  complaints.push({
    user:localStorage.getItem("login"),
    title:title.value,
    desc:desc.value,
    status:"Pending"
  });
  localStorage.setItem("complaints",JSON.stringify(complaints));
  location.reload();
}

if(document.getElementById("adminList")){
  complaints.forEach((c,i)=>{
    adminList.innerHTML += `
    <div>
    <b>${c.title}</b> (${c.status})<br>${c.desc}
    <button onclick="del(${i})">Delete</button>
    </div>`;
  });
}

function del(i){
  complaints.splice(i,1);
  localStorage.setItem("complaints",JSON.stringify(complaints));
  location.reload();
}
