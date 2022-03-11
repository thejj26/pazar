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

//klasa za spremanje local usera
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

//login
function Login() {
    let tempUser = null
    const username = document.getElementById("loginUsername")
    const password = document.getElementById("loginPassword")
    //trazenje korisnika
    database.collection("users").where("username", "==", username.value).where("password", "==", password.value).get().then((data) => {
        data.forEach((user) => {
            //spremanje korisnika u local storage
            tempUser = user.data()
            new User(user.data().username, user.data().password, user.data().email, user.data().posts, user.data().info).store()
            window.location.href = "../html/index.html"
        })
        //nije naden korisnik
        if (tempUser == null) {
            alert("Krivi korisnički podatci, pokušajte opet")
            username.value = ""
            password.value = ""
        }
    })
}

function Register() {
    //detekcija praznih polja
    let canBeRegistered = true
    const username = document.getElementById("registerUsername")
    const password = document.getElementById("registerPassword")
    const confirmPassword = document.getElementById("confirmPassword")
    const email = document.getElementById("email")

    switch ("") {
        case username.value:
            alert("Korisničko ime je obavezno")
            canBeRegistered = false
            return
        case password.value:
            alert("Lozinka je obavezna")
            canBeRegistered = false
            return
        case email.value:
            alert("Email je obavezan")
            canBeRegistered = false
            return
    }
    //provjera podudaranja lozinki
    if (password.value != confirmPassword.value) {
        alert("Lozinke se ne podudaraju")
        canBeRegistered = false
        return
    }
    //provjera korisnickog imena i emaila
    database.collection("users").get().then((data) => {
        data.forEach((user) => {
            if (user.data().username == username.value && canBeRegistered == true) {
                alert("Korisničko ime je zauzeto")
                canBeRegistered = false
                return
            } else if (user.data().email == email.value && canBeRegistered == true) {
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
                username: username.value,
                password: password.value,
                email: email.value,
                posts: ["Nije uneseno", "Nije uneseno", "Nije uneseno", "Nije uneseno", "https://i.imgur.com/UhE3TDY.png"],
                info: []
            })
            new User(username.value, password.value, email.value, [], []).store()
            window.location.href = "../html/index.html"
        }
    }
}
//logout
function Logout() {
    window.location.href = "../html/index.html"
    localStorage.removeItem("user")
}

//mijenjanje korisnickih podataka
function UpdateUserInfo() {
    const editUsername = document.getElementById("editUsername")
    const editEmail = document.getElementById("editEmail")
    const oldPassword = document.getElementById("oldPassword")
    const newPassword = document.getElementById("newPassword")
    const editPhone = document.getElementById("editPhone")
    const editLocation = document.getElementById("editLocation")
    const editBirthday = document.getElementById("editBirthday")
    const editBio = document.getElementById("editBio")
    const imageLink = document.getElementById("imageLink")
    //funkcija za update local storagea
    function UpdateLocalUser(bool, valid) {
        if (!bool) return
        if (!valid) return
        database.collection("users").where("username", "==", editUsername.value).get().then((data) => {
            data.forEach((user) => {
                new User(user.data().username, user.data().password, user.data().email, user.data().posts, user.data().info).store()
                window.location.href = "../html/index.html"
            })
        })
    }
    //dohvacanje firestore user id trenutnog korisnika
    let localuser = JSON.parse(localStorage.getItem("user"))
    let userId = ""
    let canBeEdited = true
    let birthday = editBirthday.value.split(".")

    function Valiadate() {
        //provjera dostupnosti koricniskog imena/emaila
        database.collection("users").get().then(data => {
            data.forEach(user => {
                if (user.id != userId) {
                    if (user.data().username == editUsername.value) {
                        alert("Korisničko ime je zauzeto")
                        canBeEdited = false
                    } else if (user.data().email == editEmail.value) {
                        alert("Email se već koristi")
                        canBeEdited = false
                    }
                }
            })
        }).then(() => {
            //provjera ispravnog datuma rodenja
            if (birthday[0].length == 1 && birthday[0] != 0) {
                birthday[0] = "0" + birthday[0]
            }
            if (birthday[1].length == 1 && birthday[1] != 0) {
                birthday[1] = "0" + birthday[1]
            }
            editBirthday.value = birthday.join(".")
            if (birthday[0] == 0 || birthday[1] == 0 || birthday[2] < 1920 || birthday.length > 3 || birthday.length < 3 || birthday[1] > 12) {
                alert("Unesite ispravan datum rođenja")
                canBeEdited = false
                return 0
            }
            if (birthday[1].value == "02" && birthday[0] == 29 && birthday[2] % 4 != 0) {
                alert("Unesite ispravan datum rođenja")
                canBeEdited = false
                return 0
            }
            if (["01", "03", "05", "07", "08", "10", "12"].includes(birthday[1]) && birthday[0] > 31) {
                alert("Unesite ispravan datum rođenja")
                canBeEdited = false
                return 0
            }
            if (["04", "06", "09", "11"].includes(birthday[1]) && birthday[0] > 30) {
                alert("Unesite ispravan datum rođenja")
                canBeEdited = false
                return 0
            }
            if (birthday[1] == "02" && birthday[0] > 28 && birthday[2] % 4 != 0) {
                alert("Unesite ispravan datum rođenja")
                canBeEdited = false
                return 0
            }


            //provjera lozinke
            if (oldPassword.value != "") {
                if (oldPassword.value != localuser.password) {
                    alert("Pogrešno unesena stara lozinka")
                    canBeEdited = false
                    return 0
                } else if (newPassword.value.length < 6) {
                    alert("Nova lozinka mora imati minimalno 6 znakova")
                    canBeEdited = false
                    return 0
                } else if (newPassword.value == oldPassword.value) {
                    alert("Nova lozinka ne smije biti ista kao stara")
                    canBeEdited = false
                    return 0
                }
            } else if (newPassword.value != "") {
                alert("Stara lozinka ne smije biti prazna")
                canBeEdited = false
                return 0
            }

        })
    }
    database.collection("users").where("username", "==", localuser.username).get().then(data => {
            data.forEach(user => {
                userId = user.id
            })
        }).then(Valiadate())
        //provjera validnosti unesenih podataka
        .then(() => {
            if (canBeEdited) {
                //update podataka korisnika
                if (birthday[0].length == 1 && birthday[0] != 0) {
                    birthday[0] = "0" + birthday[0]
                }
                if (birthday[1].length == 1 && birthday[1] != 0) {
                    birthday[1] = "0" + birthday[1]
                }
                editBirthday.value = birthday.join(".")
                let updated = false
                //dodavanje na firestore
                database.collection("users").doc(userId).update({
                    username: editUsername.value,
                    email: editEmail.value,
                    info: [
                        editPhone.value,
                        editLocation.value,
                        editBirthday.value,
                        editBio.value,
                        imageLink.value
                    ]
                    //update local storagea
                }).then(updated = true).then(() => {
                    UpdateLocalUser(updated, canBeEdited)
                })
            }
        })

}


//DOM user managment
if (document.location.href.includes("login.html")) { //dodaje eventove buttonima
    document.getElementById("loginBtn").addEventListener("click", () => Login())
    document.getElementById("registerBtn").addEventListener("click", () => Register())
}

window.addEventListener("load", () => {
    //sve stranice soim logina (navbar,sidebar)
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
            document.getElementById("birthday").innerHTML = user.info[2]
        }
        if (user.info[3]) {
            document.getElementById("bio").innerHTML = user.info[3]
        }
        if (user.info[4]) {
            document.getElementById("logo").src = user.info[4]
        }
    }
    //popunjavanje korisnickih podataka za accountEdit
    if (window.location.href.includes("accountEdit")) {

        let user = JSON.parse(localStorage.getItem("user"))
        imageLink.value = user.info[4]
        editUsername.value = user.username
        editEmail.value = user.email
        editPhone.value = user.info[0]
        editLocation.value = user.info[1]
        editBirthday.value = user.info[2]
        editBio.value = user.info[3]
        document.getElementById("logo").src = user.info[4]
    }
})