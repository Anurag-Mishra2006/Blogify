require("dotenv").config();

const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8000;

const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./middleware/authentication");
app.use(express.urlencoded({extended: false }))
const Blog = require("./models/blog")

const userRoute = require("./routes/user")
const blogRoute = require("./routes/blog")


app.set('view engine','ejs');
app.set('views', path.resolve('./views'))
app.use(cookieParser());
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve("./public"))) // this tell express to server the content in public folder

// mongoose.connect("mongodb://localhost:27017/blogify").then(e=>console.log("MongoDB connected"));
mongoose.connect(process.env.MONGO_URL).then((e)=>console.log("MongoDB is connected.."))


app.get("/",async(req,res)=>{
    const allBlogs = await Blog.find({}).sort({ createdAt: -1 });//decending sorts
    res.render("home",{
        user: req.user,
        blogs : allBlogs,
    });
});

app.use("/user",userRoute)
app.use("/blog",blogRoute)

app.listen(PORT,()=>console.log(`Server is started on ${PORT}`));