import bcrypt from "bcrypt";
import bodyParser from "body-parser";
import env from "dotenv";
import express from "express";
import session from "express-session";
import passport from "passport";
import GoogleStratergy from "passport-google-oauth20";
import { Strategy } from "passport-local";
import pg from "pg";

const app = express();
const port = 3000;
const saltRounds = 10;
env.config();

//Middlewares

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());

//DATABASE SETUP

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

//Get Request

let student=[];

const result=await db.query("SELECT * FROM student_register WHERE approval='Pending'");

student=result.rows;

app.get("/signup", (req, res) => {
  // const enroll="ST000000"+(Math.floor(Math.random()*10000));
  res.render("signup.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/users", async(req, res) => {
  const email=req.user.email;
  if (req.isAuthenticated()) {
    const result=await db.query("SELECT * FROM student_register WHERE email=($1)",[email]);
    const userDetails=result.rows[0];
    let isApproved=false;
    let isRegistered=true;
    if(userDetails.approval==='Pending'){
      if(result.rows.length>0){
        res.render("users.ejs",{isRegistered:isRegistered,userDetails:userDetails,isApproved:isApproved});
      }else{
        isRegistered=false;
        res.render("users.ejs",{isRegistered:isRegistered,isApproved:isApproved});
      }
    }else{
      isApproved=true;
      res.render("users.ejs",{isRegistered:isRegistered,userDetails:userDetails,isApproved:isApproved});
    }
  } else {
    res.redirect("/login");
  }
});

app.get("/application",async(req,res)=>{
  const email=req.user.email;
  const result=await db.query("SELECT * FROM student_register WHERE email=($1)",[email]);
  let applicationDetail=result.rows[0];
  res.render("application.ejs",{applicationDetail:applicationDetail});
})

app.get("/adminlogin",(req,res)=>{
  res.render("adminLogin.ejs")
})

app.get("/admin",(req,res)=>{
  res.render("admin.ejs",{student:student});
})

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

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
  try {
    const result = await db.query(
      "SELECT * FROM user_register WHERE email=($1)",
      [user_email]
    );
    if (result.rows.length > 0) {
      res.send("User is already Registerd, try logging in!!!");
    } else {
      bcrypt.hash(user_password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error while encrypting password", err);
        } else {
          await db.query(
            "INSERT INTO user_register(first_name,last_name,password,email,contact) VALUES($1,$2,$3,$4,$5)",
            [first_name, last_name, hash, user_email, user_mobile]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            console.log("User is Registered Successfully");
            res.redirect("/login");
          });
        }
      });
    }
  } catch (err) {
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
    const result=await db.query("SELECT * FROM student_register WHERE aadhar_no=($1)",[aadhar]);
    if(result.rows.length>0){
      res.redirect("/users");
    }else{
      await db.query("INSERT INTO student_register(full_name,gender,fathers_name,mothers_name,dob,aadhar_no,course,cse,ece,email,contact_no,permanent_address,temporary_address,eng_10,sci_10,maths_10,sst_10,hindi_10,physics_12,chemistry_12,maths_12,english_12,elective_12) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)",[full_name,gender,f_name,m_name,dob,aadhar,course,cse,ece,email,phone_no,permanent_add,temporary_add,eng_10,sci_10,maths_10,sst_10,hindi_10,physics_12,chem_12,maths_12,english_12,elective_12]);
      console.log("User is registered");
      res.redirect("/application");
    }
  }catch(err){
    console.log(err);
  }
});

app.post('/approve', async(req, res) => {
  const studentId = req.body.id;
  await db.query("UPDATE student_register SET approval='Approved' WHERE email=($1)",[studentId]);
  res.json({ message: 'Application approved successfully.' });
});

app.post('/decline', async(req, res) => {
  const studentId = req.body.id;
  await db.query("UPDATE student_register SET approval='Declined' WHERE email=($1)",[studentId]);
  res.json({ message: 'Application declined successfully.' });
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
      const result = await db.query(
        "SELECT * FROM user_register WHERE email=($1)",
        [username]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const user_password = user.password;
        bcrypt.compare(password, user_password, (err, result) => {
          if (err) {
            return cb(err);
          } else {
            if (result) {
              // const username = user.first_name;
              console.log("User logged in successfully!!");
              return cb(null, user);
            } else {
              return cb(null, false);
            }
          }
        });
      } else {
        return cb("User not found");
      }
    } catch (err) {
      return cb(err);
    }
  })
);

passport.use("admin",new Strategy(async function verify(username,password,cb) {
  // console.log(username);
  try{
    const result=await db.query("SELECT * FROM admin_login WHERE admin_id=($1)",[username]);
    if(result.rows.length>0){
      const user=result.rows[0];
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
}))

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
      // console.log(profile.displayName);
      try{
        const result =await db.query("SELECT * FROM user_register WHERE email=($1)",[profile.emails[0].value]);
        if(result.rows.length===0){
            await db.query("INSERT INTO user_register(first_name,password,email) VALUES($1,$2,$3)",[profile.diplayName,profile.id,profile.emails[0].value]);
            cb(null,result.rows[0]);
        }else{
            cb(null,result.rows[0]);
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

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});