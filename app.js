//jshint esversion:6
//require the configuration dotenv
require('dotenv').config()

const express = require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const app = express();
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true});
//mongoose schema is used here instead of normal schema because it is used to apply encryption in level two authentication
const userSchema=new mongoose.Schema({
    email:String,
    password:String
})

//level two authenticaton
//here the unguessable string is passed as a cipher key as well as decipher key and stored in the env file

//encrypt package as a plugin is applied to the schema before creating mongoose model
//for encrypting particular field encryptedFields is used to specify
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password']});
//whenever save is used for the password field, the encrypt plugin automatically encrypt the field.
//whenever find is used for the password field, the encrpyt plugin autotmatically decrypt the field. 
const User= mongoose.model("User",userSchema);



app.get("/", function(req,res){
    res.render("home");
})

app.get("/login",function(req, res){
    res.render("login");
})

app.get("/register",function(req,res){
    res.render("register");
})

app.get("/secrets",function(req,res){
    res.render("secrets")
})

app.get("/submit",function(req, res){
    res.render("submit")
})

app.post("/register",function(req, res){
    const newUser= new User({
        email:req.body.username,
        password:req.body.password
    });
    newUser.save(function(err){
        if(!err){
            res.render("secrets")
        }else{
            console.log(err);
        }
    })
})
//level one Authentication
//equating password with the one stored in the database, if they are same then user is allowed to login 
app.post("/login",function(req, res){
    //here the username and password is taken from the login page and stored in the variables
    const username= req.body.username;
    const password=req.body.password;
    //using username as a key the document in the collection is taken and stored in foundUser
    User.findOne({email:username},function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password===password){          //if the password of foundUser from the collection 
                                                            //is equal to the password given by user in login page 
                                                            //then secrets is send
                    res.render("secrets")
                }
            }
        }
    })

})




app.listen(3000, function(){
    console.log("Successfully connected to the port");
})
