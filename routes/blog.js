const {Router} =require("express")
const express = require("express");
const multer = require("multer")
const router = Router() ;
const path = require("path")
const Blog = require("../models/blog")
const Comment = require("../models/comment")


// making storage using multer
const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null, path.resolve(`./public/uploads/`))
    },
    filename: function(req,file,cb){
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null,fileName);
    }
});

const upload = multer({storage:storage})



router.get("/add-new",(req,res)=>{
    return res.render("addBlog",{
        user:req.user,
    })
})

router.post("/comment/:BlogId",async(req,res)=>{
    await Comment.create({
        content: req.body.content,
        blogId:  req.params.BlogId,
        createdBy: req.user._id,


    });
    return res.redirect(`/blog/${req.params.BlogId}`)
})

router.post("/",upload.single("coverImage"),async(req,res)=>{
    // console.log(req.body);
    const {body,title}= req.body;
    const blog = await Blog.create({
        title,
        body,
        createdBy:req.user._id,
        coverImageURL: `/uploads/${req.file.filename}`
    })
    return res.redirect(`/blog/${blog._id}`)
})
router.use(express.static('public'));

router.get("/:id", async (req, res) => {
    try {
      const blog = await Blog.findById(req.params.id).populate("createdBy"); // or your way of fetching
    //   console.log(blog)
    const comments = await Comment.find({blogId:req.params.id}).populate("createdBy");
      if (!blog) {
        // Blog not found — send a 404 or render a "not found" page
        return res.status(404).send("Blog not found");
      }
      console.log("Comment", comments);
      // Blog is valid, render it
      res.render("blog", { 
        blog,
        user: req.user,
        comments,

       });
    } catch (err) {
      console.error(err);
      res.status(500).send("Server Error");
    }
});

module.exports = router