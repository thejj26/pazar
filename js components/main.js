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

class User {
    constructor(username = "", password = "", email = "", posts = [], info = []) {
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

    //trazenje korisnika
    database.collection("users").where("username", "==", String(document.getElementById("loginUsername").value)).where("password", "==", String(document.getElementById("loginPassword").value)).get().then((data) => {
        data.forEach((user) => {
            tempUser = user.data()
            new User(user.data().username, user.data().password, user.data().email, user.data().posts, user.data().info).store()
            window.location.href = "../html/index.html"
        })
        //nije naden korisnik
        if (tempUser == null) {
            alert("Krivi korisnički podatci, pokušajte opet")
            document.getElementById("loginUsername").value = ""
            document.getElementById("loginPassword").value = ""
        }
    })
}

function Register() {
    //detekcija praznih polja
    let canBeRegistered = true
    switch ("") {
        case document.getElementById("registerUsername").value:
            alert("Korisničko ime je obavezno")
            canBeRegistered = false
            return
        case document.getElementById("registerPassword").value:
            alert("Lozinka je obavezna")
            canBeRegistered = false
            return
        case document.getElementById("email").value:
            alert("Email je obavezan")
            canBeRegistered = false
            return
    }
    //provjera podudaranja lozinki
    if(document.getElementById("registerPassword").value != document.getElementById("confirmPassword").value){
        alert("Lozinke se ne podudaraju")
        canBeRegistered = false
        return
    }
    //provjera korisnickog imena i emaila
    database.collection("users").get().then((data) => {
        data.forEach((user) => {
            if (user.data().username == document.getElementById("registerUsername").value && canBeRegistered == true) {
                alert("Korisničko ime je zauzeto")
                canBeRegistered = false
                return
            } else if (user.data().email == document.getElementById("email").value && canBeRegistered == true) {
                alert("Email se već koristi")
                canBeRegistered = false
                return
            }
        })
        addUser(canBeRegistered)
    })
    //dadavanje novog korisnika
    function addUser(bool) {
        if (bool) {
            database.collection("users").add({
                username: String(document.getElementById("registerUsername").value),
                password: String(document.getElementById("registerPassword").value),
                email: String(document.getElementById("email").value),
                posts: [],
                info: []
            }).then(() => {
                new User(document.getElementById("registerUsername").value, document.getElementById("registerPassword").value, document.getElementById("email").value, [], []).store()
                window.location.href = "../html/index.html"
            })
        }
    }
}

function Logout() {
    window.location.href = "../html/index.html"
    localStorage.removeItem("user")
}


//DOM user managment
if (document.location.href.includes("login.html")) {    //dodaje eventove buttonima
    document.getElementById("loginBtn").addEventListener("click", () => Login())
    document.getElementById("registerBtn").addEventListener("click", () => Register())
}

window.addEventListener("load", () => {
    if (!window.location.href.includes("login.html")) { //izbjegavanje errora radi nepostojecih elemenata
        if (localStorage.getItem("user") != null) { //korisnik je ulogiran
            document.getElementById("sidebarLogin").style.display = "none"
            document.getElementById("navLogin").style.display = "none"
        } else { //korisnik nije ulogiran
            document.getElementById("userVisible").style.display = "none"
            document.getElementById("navAccount").style.display = "none"
            document.getElementById("navLogout").style.display = "none"
        }
    }

    //popunjavanje korisnickih podataka
    if (window.location.href.includes("account.html")) {
        let user = JSON.parse(localStorage.getItem("user"))
        document.getElementById("username").innerHTML = user.username
        document.getElementById("email").innerHTML = user.email
        document.getElementById("password").innerHTML = user.password.replace(/./g, "*")
        if (user.info[0]) {
            document.getElementById("phone").innerHTML = user.info[0]
        }
        if (user.info[1]) {
            document.getElementById("location").innerHTML = user.info[1]
        }
        if (user.info[2]) {
            let birthday = new Date(user.info[2].seconds * 1000).toLocaleString().split(",")[0].split("/")
            document.getElementById("birthday").innerHTML = birthday[1] + "." + birthday[0] + "." + birthday[2]
        }
        if (user.info[3]) {
            document.getElementById("bio").innerHTML = user.info[3]
        }
        if (user.info[4]) {
            document.getElementById("logo").src = user.info[4]
        }
    }
})
