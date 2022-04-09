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
        return new User(owner.data().username, "", owner.data().email, owner.data().info)
    }
    async addPost() {
        let owner = await this.getOwner()
        if (window.location.href.includes("posts.html")) {
            document.getElementById("posts").innerHTML += `
        <div class="col s12 m6 l4 row">
            <div class="row col s10 m10 l0 offset-s1 offset-m1 offset-l1 post hoverable" id="${this.id}">
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
            <div class="row col s10 m10 l0 offset-s1 offset-m1 offset-l1 post hoverable" id="${this.id}">
                <p title>${this.title}</p>
                <img src="${this.image}" alt="${this.title}" post-img>
                <p description>${this.description}</p>
                <p price>Cijena: ${this.price}kn/${this.priceSuffix}</p>
                <p date>Objavljeno: ${this.date}</p>
                <p location>Lokacija: ${owner.info[1]}</p>
            </div>
        </div>`
        } else if (window.location.href.includes("account.html")) {
            userPosts.push(this)
            document.getElementById("posts").innerHTML += `
            <div class="col s12 m6 l4 row">
                <div class="row col s10 m10 l0 offset-s1 offset-m1 offset-l1 post hoverable" id="${this.id}">
                    <p title>${this.title}</p>
                    <img src="${this.image}" alt="${this.title}" post-img>
                    <p description>${this.description}</p>
                    <p price>Cijena: ${this.price}kn/${this.priceSuffix}</p>
                    <p date>Objavljeno: ${this.date}</p>
                    <p location>Lokacija: ${owner.info[1]}</p>
                    <hr>
                    <a class="waves-effect waves-light btn delete" onclick="callDeletePost(${this.id})">IZBRIŠI</a>
                </div>
            </div>`
        }
    }
    deletePost() {
        if (confirm("Ukoliko izbriše ovaj oglas on će nestati te ga nećete moći vratiti.\n Želite li nastaviti?")) {
            database.collection("posts").where("id", "==", this.id).get().then(data => {
                data.forEach(doc => {
                    doc.ref.delete()
                })
            }).then(() => {
                M.toast({
                    classes: "toast-alert",
                    html: "Oglas je uspješno izbrisan!"
                })
            })
        }
    }
}

function callDeletePost(id) {
    userPosts.find(post => post.id == id).deletePost()
}

//funkcija za ucitavanje svih postova
function getPosts() {
    allPosts = []
    database.collection("posts").get().then((data) => {
        data.forEach((post) => {
            console.log(post.data().id)
            allPosts.push(new Post(post.data().category, post.data().date, post.data().description, post.data().image, post.data().owner, post.data().price, post.data().priceSuffix, post.data().title, post.data().id))
        })
    }).then(() => {
        allPosts.forEach(post => post.addPost())
    })
    return allPosts
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
            M.toast({
                classes: "toast-alert",
                html: "Krivi korisnički podatci, pokušajte opet"
            })
            username.value = ""
            password.value = ""
        }
    })
}

//register
function Register() {
    //detekcija praznih polja
    const username = document.getElementById("registerUsername")
    const password = document.getElementById("registerPassword")
    const confirmPassword = document.getElementById("confirmPassword")
    const email = document.getElementById("email")
    let canBeRegistered = true
    switch ("") {
        case username.value:
            M.toast({
                classes: "toast-alert",
                html: "Korisničko ime je obavezno"
            })
            canBeRegistered = false
            return
        case password.value:
            M.toast({
                classes: "toast-alert",
                html: "Lozinka je obavezna"
            })
            canBeRegistered = false
            return
        case email.value:
            M.toast({
                classes: "toast-alert",
                html: "Email je obavezan"
            })
            canBeRegistered = false
            return
    }
    //provjera podudaranja lozinki
    if (password.value != confirmPassword.value) {
        M.toast({
            classes: "toast-alert",
            html: "Lozinke se ne podudaraju"
        })
        canBeRegistered = false
        return
    }
    //provjera minimalne duzine lozinke
    if (password.value.length < 6) {
        M.toast({
            classes: "toast-alert",
            html: "Lozinka mora imati minimalno 6 znakova"
        })
        canBeRegistered = false
        return
    }

    //provjera korisnickog imena i emaila
    database.collection("users").get().then((data) => {
        data.forEach((user) => {
            if (user.data().username == username.value && canBeRegistered == true) {
                M.toast({
                    classes: "toast-alert",
                    html: "Korisničko ime je zauzeto"
                })
                canBeRegistered = false
                return
            } else if (user.data().email == email.value && canBeRegistered == true) {
                M.toast({
                    classes: "toast-alert",
                    html: "Email se već koristi"
                })
                canBeRegistered = false
                return
            }
        })
        addUser(canBeRegistered)
    })
}

//dadavanje novog korisnika
function addUser(bool) {
    const username = document.getElementById("registerUsername")
    const password = document.getElementById("registerPassword")
    const email = document.getElementById("email")
    if (bool) {
        database.collection("users").add({
            username: username.value,
            password: password.value,
            email: email.value,
            info: ["Nije uneseno", "Nije uneseno", "Nije uneseno", "Nije uneseno", "https://i.imgur.com/UhE3TDY.png"]
        }).then(() => {
            new User(username.value, password.value, email.value, ["Nije uneseno", "Nije uneseno", "Nije uneseno", "Nije uneseno", "https://i.imgur.com/UhE3TDY.png"]).store()
            window.location.href = "../html/index.html"
        })
    }
}
//logout
function Logout() {
    window.location.href = "../html/index.html"
    localStorage.removeItem("user")
}

//mijenjanje korisnickih podataka
async function UpdateUserInfo() {
    let editUsername = document.getElementById("editUsername")
    let editEmail = document.getElementById("editEmail")
    let oldPassword = document.getElementById("oldPassword")
    let newPassword = document.getElementById("newPassword")
    let editPhone = document.getElementById("editPhone")
    let editLocation = document.getElementById("editLocation")
    let editBirthday = document.getElementById("editBirthday")
    let editBio = document.getElementById("editBio")
    let imageLink = document.getElementById("imageLink")
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
    let birthday = editBirthday.value.split(".")
    let changePasword = false
    async function Valiadate() {
        //provjera dostupnosti koricniskog imena/emaila
        let canBeEdited = true
        await database.collection("users").get().then(data => {
            data.forEach(user => {
                if (user.id != userId) {
                    if (user.data().username == editUsername.value) {
                        M.toast({
                            classes: "toast-alert",
                            html: "Korisničko ime je zauzeto"
                        })
                        canBeEdited = false
                        return false
                    } else if (user.data().email == editEmail.value) {
                        M.toast({
                            classes: "toast-alert",
                            html: "Email se već koristi"
                        })
                        canBeEdited = false
                        return false
                    }
                }
            })
        }).then(() => {
            //provjera ispravnog datuma rodenja
            if (editBirthday.value != "Nije uneseno") {
                if (birthday[0].length == 1 && birthday[0] != 0) {
                    birthday[0] = "0" + birthday[0]
                    editBirthday.value = birthday.join(".")
                }
                if (birthday[1].length == 1 && birthday[1] != 0) {
                    birthday[1] = "0" + birthday[1]
                    editBirthday.value = birthday.join(".")
                }

                if (birthday[0] == 0 || birthday[1] == 0 || birthday[2] < 1920 || (birthday.length > 3 && birthday[3] != "") || birthday.length < 3 || birthday[1] > 12) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Unesite ispravan datum rođenja"
                    })
                    canBeEdited = false
                    return false
                }
                if (birthday[1].value == "02" && birthday[0] == 29 && birthday[2] % 4 != 0) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Unesite ispravan datum rođenja"
                    })
                    canBeEdited = false
                    return false
                }
                if (["01", "03", "05", "07", "08", "10", "12"].includes(birthday[1]) && birthday[0] > 31) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Unesite ispravan datum rođenja"
                    })
                    canBeEdited = false
                    return false
                }
                if (["04", "06", "09", "11"].includes(birthday[1]) && birthday[0] > 30) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Unesite ispravan datum rođenja"
                    })
                    canBeEdited = false
                    return false
                }
                if (birthday[1] == "02" && birthday[0] > 28 && birthday[2] % 4 != 0) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Unesite ispravan datum rođenja"
                    })
                    canBeEdited = false
                    return false
                }
            }
            //provjera lozinke
            if (oldPassword.value != "") {
                if (oldPassword.value != localuser.password) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Pogrešno unesena stara lozinka"
                    })
                    canBeEdited = false
                    return false
                } else if (newPassword.value.length < 6) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Nova lozinka mora imati minimalno 6 znakova"
                    })
                    canBeEdited = false
                    return false
                } else if (newPassword.value == oldPassword.value) {
                    M.toast({
                        classes: "toast-alert",
                        html: "Nova lozinka ne smije biti ista kao stara"
                    })
                    canBeEdited = false
                    return false
                }
            } else if (newPassword.value != "") {
                M.toast({
                    classes: "toast-alert",
                    html: "Stara lozinka ne smije biti prazna"
                })
                canBeEdited = false
                return false
            }
            if (canBeEdited && oldPassword.value == localuser.password && newPassword.value.length > 5 && newPassword.value != oldPassword.value) {
                changePasword = true
            }
        })
        if (canBeEdited) return true
        return false
    }
    database.collection("users").where("username", "==", localuser.username).get().then(data => {
            data.forEach(user => {
                userId = user.id
            })
        }).then(Valiadate())
        //provjera validnosti unesenih podataka
        .then(async () => {
            let valiadation = await Valiadate()
            console.log(valiadation)
            if (valiadation) {
                //update podataka korisnika
                if (editBirthday.value != "Nije uneseno") {
                    if (birthday[0].length == 1 && birthday[0] != 0) {
                        birthday[0] = "0" + birthday[0]
                    }
                    if (birthday[1].length == 1 && birthday[1] != 0) {
                        birthday[1] = "0" + birthday[1]
                    }
                    editBirthday.value = birthday.join(".")
                }
                let updated = false
                //dodavanje na firestore
                database.collection("users").doc(userId).update({
                    username: editUsername.value,
                    email: editEmail.value,
                    password: changePasword ? newPassword.value : localuser.password,
                    info: [
                        editPhone.value,
                        editLocation.value,
                        editBirthday.value,
                        editBio.value,
                        imageLink.value
                    ]
                    //update local storagea
                }).then(() => updated = true).then(() => {
                    UpdateLocalUser(updated, valiadation)
                })
            }
        })

}

//sortiranje i filtriranje postova
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

//dodavanje novog oglasa
async function NewPost() {
    if (localStorage.getItem("user") == null) {
        M.toast({
            classes: "toast-alert",
            html: "Morate biti prijavljeni kako bi mogli objaviti oglas"
        })
        return
    }
    let localuser = JSON.parse(localStorage.getItem("user"))
    for (let i = 0; i < localuser.info.length; i++) {
        if (localUser.info[i] == "Nije uneseno") {
            M.toast({
                classes: "toast-alert",
                html: "Morate unijeti sve korisničke podatke prije nego što objavite oglas"
            })
            return
        }
    }
    let postIDs = allPosts.map(post => post.id)
    let title = document.getElementById("postTitle").value
    let imageLink = document.getElementById("postImageLink").value
    let price = document.getElementById("price").value
    let priceSuffix = document.querySelector("input[name='suffix']:checked").id
    let category = document.querySelector("input[name='category']:checked").id
    let description = document.getElementById("postDescription").value
    let today = new Date()
    let date = today.getDate() + "." + (today.getMonth() + 1) + "." + today.getFullYear()
    date = date.split(".")
    if (date[0].length == 1) date[0] = "0" + date[0]
    if (date[1].length == 1) date[1] = "0" + date[1]
    date = date.join(".")
    //generiranje random pos id
    let postID = Math.floor(Math.random() * 1000000)
    while (postIDs.includes(postID)) {
        postID = Math.floor(Math.random() * 1000000)
    }
    //dohvacanje owner id i stvaranje post objekta
    let owner = await database.collection("users").where("username", "==", String(JSON.parse(localStorage.getItem("user")).username)).get()
    let post = new Post(category, date, description, imageLink, owner.docs[0].id, price, priceSuffix, title, postID)
    //provjera unesenih podataka
    switch ("") {
        case title:
            M.toast({
                classes: "toast-alert",
                html: "Oglas treba sadržavati naslov"
            })
            return
        case imageLink:
            M.toast({
                classes: "toast-alert",
                html: "Oglas treba sadržavati sliku"
            })
            return
        case price:
            M.toast({
                classes: "toast-alert",
                html: "Nema unesene cijene"
            })
            return
        case description:
            M.toast({
                classes: "toast-alert",
                html: "Oglas treba sadržavati opis"
            })
            return
    }
    if (price <= 0) {
        M.toast({
            classes: "toast-alert",
            html: "Cijena mora biti veća od 0"
        })
        return
    }
    //stvaranje posta
    database.collection("posts").add({
        category: post.category,
        description: post.description,
        image: post.image,
        owner: post.owner,
        price: post.price,
        priceSuffix: post.priceSuffix,
        title: post.title,
        id: post.id,
        date: post.date
    }).then(() => {
        M.toast({
            classes: "toast-alert",
            html: "Oglas je objavljen"
        })
        window.location.href = "../html/posts.html"
    })
}
let allPosts = []
let userPosts = [] //svi postovi jednog usera, koristi se za brisanje postova

//DOM user managment
if (document.location.href.includes("login.html")) { //dodaje eventove buttonima
    document.getElementById("loginBtn").addEventListener("click", () => Login())
    document.getElementById("registerBtn").addEventListener("click", () => Register())
}

window.addEventListener("load", () => {
    //sve stranice osim logina (navbar,sidebar)
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
                new Post(post.data().category, post.data().date, post.data().description, post.data().image, post.data().owner, post.data().price, post.data().priceSuffix, post.data().title, post.data().id)
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
    //popunjavanje podataka kod javnog profila
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
                new Post(post.data().category, post.data().date, post.data().description, post.data().image, post.data().owner, post.data().price, post.data().priceSuffix, post.data().title, post.data().id)))
            posts.forEach(post => post.addPost())
        })
    }
    //modal
    if (window.location.href.includes("index.html")) {
        let modal = M.Modal.init(document.querySelector(".modal"), {
            dismissible: false
        })
        getPosts()
    }
})