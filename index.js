import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import env from "dotenv";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import passport from "passport";
import GoogleStratergy from "passport-google-oauth20";
import { Strategy } from "passport-local";

const app=new express();
const port=3000;
const saltRounds=10;
env.config();
const uri=process.env.MD_URI;

//middlewares

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

// Database Connection

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(error => {
        console.error('Error connecting to MongoDB', error);
    });

//Schema

const user_register=new mongoose.Schema({
    first_name:String,
    last_name:String,
    password:String,
    email:{type:String,unique:true},
    contact:String,
});

const Signup = mongoose.model('Signup', user_register);

const student_register=new mongoose.Schema({
    full_name:String,
    gender:String,
    f_name:String,
    m_name:String,
    dob:Date,
    aadhar:Number,
    course:String,
    cse:Number,
    ece:Number,
    email:String,
    phone_no:Number,
    permanent_add:String,
    temporary_add:String,
    eng_10:Number,
    sci_10:Number,
    maths_10:Number,
    sst_10:Number,
    hindi_10:Number,
    physics_12:Number,
    chem_12:Number,
    maths_12:Number,
    english_12:Number,
    elective_12:Number,
    approval: {type:String,default:'Pending'},
});

const Student_register=mongoose.model("Student_register",student_register);

const admin_login=new mongoose.Schema({
  admin_id:String,
  password:String,
});

const Adminlogin=mongoose.model("Adminlogin",admin_login);


const admin=new Adminlogin({
  admin_id:process.env.AD_ID,
  password:process.env.AD_PASS,
});

admin.save();

//get request

app.get("/",(req,res)=>{
    res.render("home.ejs");
})

app.get("/login",(req,res)=>{
    res.render("login.ejs");
})

app.get("/signup",(req,res)=>{
    res.render("signup.ejs");
})

app.get("/adminlogin",(req,res)=>{
    res.render("adminLogin.ejs");
})

app.get("/application",async(req,res)=>{
    const email=req.user.email;
    const applicationDetail=await Student_register.findOne({email:email});
    res.render("application.ejs",{applicationDetail:applicationDetail});
})

app.get("/users", async(req, res) => {
    const email=req.user.email;
    if(req.isAuthenticated()){
        const result=await Student_register.findOne({email:email});
        let isApproved=false;
        let isRegistered=false;
        if(result!=null){
          isRegistered=true;
          if(result.approval==='Pending'){
            res.render("users.ejs",{isRegistered:isRegistered,result:result,isApproved:isApproved});
          }else{
            isApproved=true;
            res.render("users.ejs",{isRegistered:isRegistered,result:result,isApproved:isApproved});
          }
        }else{
          res.render("users.ejs",{isRegistered:isRegistered,result:result,isApproved:isApproved});
        }
    }else{
        console.log("User not registered");
        res.redirect("/signup");
    }
  });

  app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });

  app.get("/adminlogin",(req,res)=>{
    res.render("adminLogin.ejs")
  })
  
  app.get("/admin",async(req,res)=>{
    const student=await Student_register.find({approval:'Pending'});
    res.render("admin.ejs",{student:student});
  })

  app.get(
    "/auth/google",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  );
  
  app.get("/auth/google/users",passport.authenticate("google",{
      successRedirect:"/users",
      failureRedirect:"/login",
  }));

//Post request

app.post(
    "/login",
    passport.authenticate("local", {
      successRedirect: "/users",
      failureRedirect: "/login",
    })
  );

app.post("/signup", async (req, res) => {
    const first_name = req.body.first_name;
    const last_name = req.body.last_name;
    const user_password = req.body.user_password;
    const user_email = req.body.user_email;
    const user_mobile = req.body.contact_no;
    const check= await Signup.findOne({email:user_email});
    try{
        if(check!=null){
            console.log("User is already registered");
            res.redirect("/login");
        }else{
            bcrypt.hash(user_password,saltRounds,async(err,hash)=>{
                if(err){
                    console.log("Error while encrypting password");
                }else{
                    const user=new Signup({
                        first_name:first_name,
                        last_name:last_name,
                        password:hash,
                        email:user_email,
                        contact:user_mobile,
                    });
                    user.save();
                    console.log("User is registered Succesfully");
                    res.redirect("/login");
                }
            })
        }
    }catch(err){
        console.log(err);
    }
  });

  app.post("/registration",async(req,res)=>{
    const full_name= req.body.full_name;
    const gender=req.body.gender;
    const f_name= req.body.fathers_name;
    const m_name= req.body.mothers_name;
    const dob=req.body.dob;
    const aadhar= req.body.aadhar;
    const course= req.body.courses;
    const cse= req.body.cse;
    const ece= req.body.ece;
    const email= req.body.email;
    const phone_no= req.body.phone_no;
    const permanent_add= req.body.permanent_address
    const temporary_add= req.body.temporary_address;
    const eng_10= req.body.eng_10;
    const sci_10= req.body.sci_10;
    const maths_10= req.body.maths_10;
    const sst_10= req.body.sst_10;
    const hindi_10= req.body.hindi_10;
    const physics_12= req.body.physics_12;
    const chem_12= req.body.chemistry_12;
    const maths_12= req.body.maths_12;
    const english_12= req.body.english_12;
    const elective_12= req.body.elective_12;
    try{
        const check=await Student_register.findOne({aadhar:aadhar});
        if(check!=null){
          console.log("Aadhar card is already registered");
            res.redirect("/users");
        }else{
            const user=new Student_register({
                full_name:full_name,
                gender:gender,
                f_name:f_name,
                m_name:m_name,
                dob:dob,
                aadhar:aadhar,
                course:course,
                cse:cse,
                ece:ece,
                email:email,
                phone_no:phone_no,
                permanent_add:permanent_add,
                temporary_add:temporary_add,
                eng_10:eng_10,
                sci_10:sci_10,
                maths_10:maths_10,
                sst_10:sst_10,
                hindi_10:hindi_10,
                physics_12:physics_12,
                chem_12:chem_12,
                maths_12:maths_12,
                english_12:english_12,
                elective_12:elective_12,
            });
            user.save();
            console.log("Student is registered Successfully");
            res.redirect("/application");
        }
    }catch(err){
        console.log(err);
    }
  });

  app.post('/approve', async (req, res) => {
    try {
        const studentId = req.body.id;
        console.log('Approving application for:', studentId); // Debug log

        const result = await Student_register.updateOne(
            { email: studentId },
            { $set: { approval: 'Approved' } }
        );

        console.log(result); // Log the result of the update

        if (result.modifiedCount > 0) {
            res.json({ message: 'Application approved successfully.' });
        } else {
            res.status(404).json({ message: 'No application found to approve.' });
        }
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'An error occurred while approving the application.' });
    }
});

  
  app.post('/decline', async (req, res) => {
    try {
        const studentId = req.body.id;
        const result = await Student_register.updateOne(
            { email: studentId },
            { $set: { approval: 'Declined' } }
        );
        if (result.modifiedCount > 0) {
            res.json({ message: 'Application declined successfully.' });
        } else {
            res.status(404).json({ message: 'No application found to decline.' });
        }
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ message: 'An error occurred while declining the application.' });
    }
});

  
  app.post("/adminlogin",passport.authenticate("admin", {
      successRedirect: "/admin",
      failureRedirect: "/adminlogin",
    })
  );

//Passport

passport.use(
    "local",
    new Strategy(async function verify(username, password, cb) {
      try {
        const check=await Signup.findOne({email:username});
        if(check!=null){
            const user_password=check.password;
            bcrypt.compare(password,user_password,(err,result)=>{
                if(err){
                    return cb(err);
                }else{
                    if(result){
                        console.log("User logged in");
                        return cb(null,check);
                    }else{
                        return cb(null,false);
                    }
                }
            });
        }else{
            console.log("User not found");
            res.redirect("/signup");
        }
      } catch (err) {
        return cb(err);
      }
    })
  );

  passport.use("admin",new Strategy(async function verify(username,password,cb) {
    try{
      const user=await Adminlogin.findOne({admin_id:username});
      if(user!=null){
        const admin_password=user.password;
        if(admin_password===password){
          console.log("Admin Logged in successfully");
          return cb(null,user);
        }
        else{
          console.log("Password didn't match");
          return cb(null,false);
        }
      }
    }catch(err){
      console.log(err);
    }
  }));

  passport.use(
    "google",
    new GoogleStratergy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/users",
        userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
      },
      async (accessToken, refreshToken, profile, cb) => {
        try{
        const result=await Signup.findOne({email:profile.emails[0].value});
          if(result==null){
            const user=new Signup({
                first_name:profile.displayName,
                password:profile.id,
                email:profile.emails[0].value,
            });
            user.save();
              cb(null,result);
          }else{
              cb(null,result);
          }
        }catch(err){
          cb(err);
        }
      }
    )
  );

  passport.serializeUser((user, cb) => {
    cb(null, user);
  });
  passport.deserializeUser((user, cb) => {
    cb(null, user);
  });

app.listen(port,()=>{
    console.log("App is listening");
});