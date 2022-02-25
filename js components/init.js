//materialize
M.AutoInit()

let elem = document.querySelector(".sidenav")
let instance = new M.Sidenav(elem)

if (sessionStorage.getItem("user") == null) document.getElementById("userVisible").style.display = "none"
