//firebase
const firebaseConfig = {
    apiKey: "AIzaSyD2GC10JQEjDIZ3SrpGXBE1PbQTxpTv830",
    authDomain: "pazar-d123a.firebaseapp.com",
    projectId: "pazar-d123a",
    storageBucket: "pazar-d123a.appspot.com",
    messagingSenderId: "245300399104",
    appId: "1:245300399104:web:f919e668646d1791a19ce5"
}
const app = firebase.initializeApp(firebaseConfig)
let database = app.firestore()


//user managment
class User {
    constructor(username = "", password = "", email = "", posts = [], info = {
        location: "",
        phone: "",
        birthday: new Date(),
        bio: "",
        logo: ""
    }) {
        this.username = username
        this.password = password
        this.email = email
        this.posts = posts
        this.info = info
    }
    store() {
        localStorage.setItem("user", JSON.stringify(this))
    }
}


function Login() {
    let tempUser = null

    database.collection("users").where("username", "==", String(document.getElementById("loginUsername").value)).where("password", "==", String(document.getElementById("loginPassword").value)).get().then((data) => {
        data.forEach((user) => {
            tempUser = user.data()
            console.log(user)
            new User(user.data().username, user.data().password, user.data().email, user.data().posts, user.data().info).store()
            window.location.href = "../html/index.html"
        })
        if (tempUser == null) {
            alert("Krivi korisnički podatci, pokušajte opet")
            document.getElementById("loginUsername").value = ""
            document.getElementById("loginPassword").value = ""
        }
    })
}

function Register() {}

function Logout() {
    localStorage.removeItem("user")
    window.location.href = "../html/index.html"
}


//DOM user managment
if (document.getElementById("loginBtn")) {
    document.getElementById("loginBtn").addEventListener("click", () => Login())
}

window.addEventListener("load", () => {
    if(window.location.href.includes("login.html")) return
    if (localStorage.getItem("user") != null) {
        document.getElementById("sidebarLogin").style.display = "none"
        document.getElementById("navLogin").style.display = "none"
    } else {
        document.getElementById("userVisible").style.display = "none"
        document.getElementById("navAccount").style.display = "none"
        document.getElementById("navLogout").style.display = "none"
    }
})