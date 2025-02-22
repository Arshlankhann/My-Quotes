const express = require("express")
const app = express()
const userModel = require("./models/user")
const postModel = require("./models/post")
const cookieParser = require("cookie-parser")
const path = require("path")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const post = require("./models/post")
// const upload = require("./config/multerconfig")
const { read } = require("fs")
const crypto = require("crypto")
const multer = require("multer")
const mongoose = require("mongoose")
let dotenv = require('dotenv')
require("dotenv").config()

const connectDB = async()=>{
    await mongoose.connect(process.env.MONGODB_URI)
}
connectDB()

app.set("view engine", "ejs");
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser())




const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
        crypto.randomBytes(12, function(err,bytes){
            const fn =bytes.toString("hex") + path.extname(file.originalname)
            cb(null, fn)
        })
      
    }
  })
  
  const upload = multer({ storage: storage })

  

// Making Rought
app.get("/", (req, res) => {
    res.render("login")
})

app.get("/home", isLoggedIn, async (req, res) => {
    let posts = await postModel.find().populate("user")
    res.render("home", { posts })
    // console.log("allpost :", posts)

})




// app.get("/home", isLoggedIn, async (req, res) => {
//     let user = await userModel.findOne({ email: req.user.email }).populate("posts")
//     res.render("home", { user })
// })

app.get("/profile/upload", (req, res) => {
    res.render("profileupload")
})

app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })
    user.profilepic = req.file.filename;
    await user.save()
    res.redirect("/profile")
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/profile", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email }).populate("posts")
    res.render("profile", { user })
})

app.get("/like/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user")

    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid)
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }

    await post.save()
    res.redirect("/profile")
})

app.get("/homelike/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user")

    if (post.likes.indexOf(req.user.userid) === -1) {
        post.likes.push(req.user.userid)
    } else {
        post.likes.splice(post.likes.indexOf(req.user.userid), 1)
    }

    await post.save()
    res.redirect("/home")
})

app.get("/edit/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOne({ _id: req.params.id }).populate("user")
    res.render("edit", { post })
})

app.post("/update/:id", isLoggedIn, async (req, res) => {
    let post = await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content })
    res.redirect("/profile")
})

app.post("/upload", isLoggedIn, (req, res) => {
    res.render(profile)
})

app.post("/post", isLoggedIn, async (req, res) => {
    let user = await userModel.findOne({ email: req.user.email })

    let { content } = req.body

    let post = await postModel.create({
        user: user._id,
        content
    })
    user.posts.push(post._id)
    await user.save()
    res.redirect("/profile")
})

app.post("/register", async (req, res) => {
    // extracting data from body
    let { email, username, password, age, name } = req.body
    // checking user avalibility
    let user = await userModel.findOne({ email })
    if (user) return res.status(500).send("User already registered")
    // if available then converting password into hash
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(password, salt, async (err, hash) => {
            // console.log(hash)
            let user = await userModel.create({
                username,
                name,
                password: hash,
                email,
                age
            })
            // setting token
            let token = jwt.sign({ email: email, userid: user._id }, "Protect")
            res.cookie("token", token)
            res.redirect("/")
        })
    })
})


// app.post("/login", async (req, res) => {

//     // extracting data from body
//     let { email, password } = req.body

//     // checking user avalibility
//     let user = await userModel.findOne({ email })
//     if (!user) return res.status(500).send("Something went wrong")

//     // comparing ginven password to original password
//     bcrypt.compare(password, user.password, function (err, result) {
//         if (result) {
//             let token = jwt.sign({ email: email, userid: user._id }, "Protect")
//             res.cookie("token", token)
//             res.status(200).redirect("home")
//         }
//         else res.send("/login")
//     })
// })

app.post("/login", async (req, res) => {
    try {
        // Extract and sanitize input
        let { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).send("<script>alert('Please enter both email and password.'); window.location='/';</script>");
        }

        email = email.trim().toLowerCase();

        // Check if user exists
        let user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send("<script>alert('Incorrect email or password. Please try again.'); window.location='/';</script>");
        }

        // Compare passwords securely
        bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
                return res.status(401).send("<script>alert('Incorrect email or password. Please try again.'); window.location='/';</script>");
            }

            // Generate JWT token
            let token = jwt.sign({ email: email, userid: user._id }, "Protect", { expiresIn: "1h" });

            // Set cookie and redirect
            res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production" });
            res.status(200).redirect("home");
        });

    } catch (error) {
        console.error(error);
        res.status(500).send("<script>alert('Something went wrong. Please try again later.'); window.location='/';</script>");
    }
});


app.get("/logout", (req, res) => {
    res.cookie("token", "")
    res.redirect("/")
})

app.post("/delete/:id", async (req, res) => {
    let { id } = req.params
    let deletepost = await post.findByIdAndDelete(id)
    res.redirect("/profile")
})

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") res.redirect("login")
    else {
        // checking valid token
        let data = jwt.verify(req.cookies.token, "Protect")
        req.user = data
        next()
    }
}


app.listen(process.env.PORT, () => {
    console.log("App is listening to port 3000")
})