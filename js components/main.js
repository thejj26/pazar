//materialize
M.AutoInit()

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
    constructor(username = "", password = "", email = "", info = []) {
        this.username = username
        this.password = password
        this.email = email
        this.info = info
    }
    store() {
        localStorage.setItem("user", JSON.stringify(this))
    }
    async getAllPosts() {
        let users = await database.collection("users").where("username", "==", this.username).get()
        let userid = users.docs[0].id
        let posts = await database.collection("posts").where("owner", "==", userid).get()
        return posts.docs
    }
}

//klasa za spremanje svih postova
class Post {
    constructor(category = "", date = "", description = "", image = "", owner = "", price = 0, priceSuffix = "", title = "", id = 0) {
        this.category = category
        this.date = date
        this.description = description
        this.image = image
        this.owner = owner
        this.price = price
        this.priceSuffix = priceSuffix
        this.title = title
        this.id = id
    }
    async getOwner() {
        let owner = await database.collection("users").doc(this.owner).get()
        return new User(owner.data().username, "", owner.data().email, [], owner.data().info)
    }
    async addPost() {
        let owner = await this.getOwner()
        if (window.location.href.includes("posts.html")) {
            document.getElementById("posts").innerHTML += `
        <div class="col s12 m6 l4 row">
            <div class="row col s10 m10 l0 offset-s1 offset-m1 offset-l1 post hoverable" id="post${this.id}">
                <p title>${this.title}</p>
                <img src="${this.image}" alt="${this.title}" post-img>
                <p description>${this.description}</p>
                <p price>Cijena: ${this.price}kn/${this.priceSuffix}</p>
                <p date>Objavljeno: ${this.date}</p>
                <p location>Lokacija: ${owner.info[1]}</p>
                <hr>
                <a href="../html/profile.html#user=${owner.username}">
                    <div owner>
                        <div class="col s3 m3 l3 center-align">
                        <img src="${owner.info[4]}" alt="${owner.username}" owner-img>
                        </div>
                        <div class="col s9 m9 l9 center-align">
                            <p username>${owner.username}</p>
                            <br>
                            <p phone>${owner.info[0]}</p>
                            <p email>${owner.email}</p>
                        </div>
                    </div>
                </a>
            </div>
        </div>`
        } else if (window.location.href.includes("profile.html")) {
            document.getElementById("posts").innerHTML += `
        <div class="col s12 m6 l4 row">
            <div class="row col s10 m10 l0 offset-s1 offset-m1 offset-l1 post hoverable" id="post${this.id}">
                <p title>${this.title}</p>
                <img src="${this.image}" alt="${this.title}" post-img>
                <p description>${this.description}</p>
                <p price>Cijena: ${this.price}kn/${this.priceSuffix}</p>
                <p date>Objavljeno: ${this.date}</p>
                <p location>Lokacija: ${owner.info[1]}</p>
            </div>
        </div>`
        } else {
            userPosts.push(this)
            document.getElementById("posts").innerHTML += `
            <div class="col s12 m6 l4 row">
                <div class="row col s10 m10 l0 offset-s1 offset-m1 offset-l1 post hoverable" id="post${this.id}">
                    <p title>${this.title}</p>
                    <img src="${this.image}" alt="${this.title}" post-img>
                    <p description>${this.description}</p>
                    <p price>Cijena: ${this.price}kn/${this.priceSuffix}</p>
                    <p date>Objavljeno: ${this.date}</p>
                    <p location>Lokacija: ${owner.info[1]}</p>
                    <hr>
                    <a class="waves-effect waves-light btn delete" onclick="callDeletePost(this.id)">IZBRIŠI</a>
                </div>
            </div>`
        }
    }
    deletePost() {
        if (confirm("Ukoliko izbriše ovaj oglas on će nestati te ga nećete moći vratiti.\n Želite li nastaviti?")) {
            database.collection("posts").where("id", "==", String(this.id)).get().then(data => {
                data.forEach(doc => {
                    doc.ref.delete()
                    
                })
            }).then(console.log("izrbisano"))
        }
    }
}

function callDeletePost(id) {
    userPosts.find(post => post.id == id).deletePost()
}
//funkcija za ucitavanje svih postova
let allPosts = []
let userPosts = []  //svi postovi jednog usera, koristi se za brisanje postova

function getPosts() {
    allPosts = []
    database.collection("posts").get().then((data) => {
        data.forEach((post) => {
            allPosts.push(new Post(post.data().category, post.data().date, post.data().description, post.data().image, post.data().owner, post.data().price, post.data().priceSuffix, post.data().title, post.data().id))
        })
    }).then(() => {
        allPosts.forEach(post => post.addPost())
    })
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
            new User(user.data().username, user.data().password, user.data().email, user.data().info).store()
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
    const username = document.getElementById("registerUsername")
    const password = document.getElementById("registerPassword")
    const confirmPassword = document.getElementById("confirmPassword")
    const email = document.getElementById("email")
    let canBeRegistered = true
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
    //provjera minimalne duzine lozinke
    if (password.value.length < 6) {
        alert("Lozinka mora imati minimalno 6 znakova")
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
}
//dadavanje novog korisnika
function addUser(bool) {
    if (bool) {
        database.collection("users").add({
            username: username.value,
            password: password.value,
            email: email.value,
            info: ["Nije uneseno", "Nije uneseno", "Nije uneseno", "Nije uneseno", "https://i.imgur.com/UhE3TDY.png"]
        })
        new User(username.value, password.value, email.value, []).store()
        window.location.href = "../html/index.html"
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
                new User(user.data().username, user.data().password, user.data().email, user.data().info).store()
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
                    password: newPassword.value,
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

async function Sort_Filter() {
    //sort
    let sort = ""
    let filter = ""
    switch (true) {
        case (document.getElementById("price-lh").checked):
            allPosts.sort((a, b) => a.price > b.price ? 1 : -1)
            sort = "price-lh"
            break;
        case (document.getElementById("price-hl").checked):
            allPosts.sort((a, b) => a.price < b.price ? 1 : -1)
            sort = "price-hl"
            break;
        case (document.getElementById("date-lh").checked):
            //todo
            sort = "date-lh"
            break;
        case (document.getElementById("date-hl").checked):
            //todo
            sort = "date-hl"
            break;
    }
    //filter
    let filters = [document.getElementById("fruit").checked ? "fruit" : null,
        document.getElementById("vegetables").checked ? "vegetables" : null,
        document.getElementById("meat").checked ? "meat" : null,
        document.getElementById("nonMeat").checked ? "nonMeat" : null,
        document.getElementById("other").checked ? "other" : null
    ].filter(x => x != null)

    let search = document.getElementById("search")
    let location = document.getElementById("locationSearch")

    function FormatText(text) {
        return text.toLowerCase().replace("č", "c").replace("ć", "c").replace("š", "s").replace("ž", "z")
    }

    let filtered = allPosts
        //filter po imenu/opisu
        .filter(post => post.title.includes(FormatText(search.value)) || post.description.includes(FormatText(search.value)))
        //filter po kategoriji
        .filter(post => filters.includes(post.category) || filters.length == 0)
    //filter po lokaciji
    for (let i = 0; i < filtered.length; i++) {
        let owner = await filtered[i].getOwner()
        if (!(FormatText(owner.info[1]).includes(FormatText(location.value)) || FormatText(location.value) == "")) {
            filtered.splice(i, 1)
            i--
        }
    }
    //primjena filtera u HTML
    document.getElementById("posts").innerHTML = ""
    filtered.forEach(post => {
        post.addPost()
    })
    if (filters.length > 0) {
        filter = filters.join("&")
    }
    window.location.href = `../html/posts.html#sort=${sort} filter=${filter} search=${search.value} location=${location.value}`
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
        //popunjavanje podataka
        async function localUser() {
            let getuser = JSON.parse(localStorage.getItem("user"))
            let user = new User(getuser.username, getuser.password, getuser.email, getuser.info)
            return user
        }
        async function fillInfo() {
            let user = await localUser()
            document.getElementById("username").innerHTML = user.username
            document.getElementById("email").innerHTML = user.email
            document.getElementById("password").innerHTML = user.password.replace(/./g, "*")
            document.getElementById("phone").innerHTML = user.info[0]
            document.getElementById("location").innerHTML = user.info[1]
            document.getElementById("birthday").innerHTML = user.info[2]
            document.getElementById("bio").innerHTML = user.info[3]
            document.getElementById("logo").src = user.info[4]
            //objave
            let get = await user.getAllPosts()
            let posts = []
            get.forEach(post => posts.push(
                new Post(post.data().category, post.data().date, post.data().description, post.data().image, post.data().owner, post.data().price, post.data().priceSuffix, post.data().title)
            ))
            posts.forEach(post => post.addPost())
        }
        fillInfo()
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
    //posts
    if (window.location.href.includes("posts.html")) {
        getPosts()
    }

    if (window.location.href.includes("profile.html")) {
        //dohvacanje podataka
        let userProfile
        database.collection("users").where("username", "==", window.location.href.split("#user=")[1]).get().then(data => {
            data.forEach(user => {
                userProfile = new User(user.data().username, "", user.data().email, user.data().info)
            })
        }).then(async () => {
            //popunjavanje podataka
            document.querySelector("title").innerHTML = `Pazar | ${userProfile.username}`
            document.getElementById("username").innerHTML = userProfile.username
            document.getElementById("email").innerHTML = userProfile.email
            document.getElementById("phone").innerHTML = userProfile.info[0] ? userProfile.info[0] : "Nije uneseno"
            document.getElementById("location").innerHTML = userProfile.info[1] ? userProfile.info[1] : "Nije uneseno"
            document.getElementById("birthday").innerHTML = userProfile.info[2] ? userProfile.info[2] : "Nije uneseno"
            document.getElementById("bio").innerHTML = userProfile.info[3] ? userProfile.info[3] : "Nije uneseno"
            document.getElementById("logo").src = userProfile.info[4]
            //objave korisnika
            let get = await userProfile.getAllPosts()
            let posts = []
            get.forEach(post => posts.push(
                new Post(post.data().category, post.data().date, post.data().description, post.data().image, post.data().owner, post.data().price, post.data().priceSuffix, post.data().title)))
            posts.forEach(post => post.addPost())
        })
    }
})