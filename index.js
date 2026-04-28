
const express = require("express")
const cors= require("cors")
const mongoose = require("mongoose")
const app = express()
app.use(cors())
app.use(express.json())
const nodemailer = require("nodemailer")
require("dotenv").config()
mongoose.connect("mongodb+srv://tla808373_db_user:talhazafar123456@cluster1.p0b5dqd.mongodb.net/")
.then(()=>{
console.log("MongoDB is connected")
}).catch(()=>{
console.log("MongoDB is not connected")
})
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}))
const formSchema = new mongoose.Schema({
name: String,
gender: String,
email: {type: String,unique:true},
password: String,
otp: String,
})
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.APP_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
})
transporter.verify((error)=>{
if(error){
console.log(error)
}
else{
    console.log("Email server is ready")
}
})

const info = mongoose.model("info",formSchema)
app.post("/sign-up",async(req,res)=>{
try{
    const {signup}= req.body
    const existingUser = await info.findOne({
     email: signup.email
    })
    if(existingUser){
    return res.status(400).json({success:false,message: "User already exists"})
    }
    const getData = new info({...signup})
    const response = await getData.save()
    res.status(200).json({success:true,message:"Signup successfully"})
}
catch(error){
console.log(error)
res.status(400).json({success:false,message:"Signup failed"})
}
})
app.post("/login-page",async(req,res)=>{
try{
    const {login} = req.body
    const user = await info.findOne({
    email:login.email,
    password: login.password,
    })
    if(user){
    return res.status(200).json({success:true,message:"Login successfully"})
    }
    if(!user){
    return res.status(400).json({success:false,message:"User does not exists"})
    }
}
catch(error){
console.log(error)
res.status(400).json({success:false,message:"Login failed"})
}
})
app.post("/send-code",async(req,res)=>{
try{
    const {email} = req.body
    const user = await info.findOne({email})
    if(!user){
    return res.status(400).json({success:false,message: "Email not found"})
    }
    if(user){
    const otp = Math.floor(100000 + Math.random() * 900000)
    user.otp = otp
    await user.save()
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "OTP Verification Code",
        html: `Your OTP code is ${otp}`
      })
    }
    return res.status(200).json({success:true,message: "OTP send succcessfully"})
}
catch(error){
console.log(error)
res.status(400).json({success:false,message:"OTP sending failed"})
}})
app.post("/verify-otp",async(req,res)=>{
try{
  const {email,otp} = req.body
  const user = await info.findOne({email})
  if(!user){
  return res.status(400).json({success:true,message: "Email not found"})
  }
  if(user.otp !==otp){
  return res.status(400).json({success:false,message :"Verification failed"})
  }
user.otp = otp
return res.status(200).json({success:true,message: "Verification successful"})
}
catch(error){
console.log(error)
res.status(400).json({success:false,message: "Error Please check"})
}
})
app.post("/change-password",async(req,res)=>{
try{
const {email,newpassword,confirmpassword} = req.body
const user = await info.findOne({email})
if(!user){
return res.status(400).json({success:false,message:"Email not found"})
}
if(!newpassword || !confirmpassword){
return res.status(400).json({success:false,message:"Please enter passwords"})
}
if(newpassword !==confirmpassword){
return res.status(400).json({success:false,message:"Passwords are not match"})
}
user.password = newpassword
await user.save()
return res.status(200).json({success:true,message:"Password change successfully"})
}
catch(error){
console.log(error)
res.status(400).json({success:false,message:"Error please check"})
}
})
const Port = process.env.PORT || 7000
app.listen(Port,()=>{
console.log(`Server is running on ${Port} `)
})

