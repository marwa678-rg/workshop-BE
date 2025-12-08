//imports
const express = require("express");
const router= express.Router();
const crypto =require("crypto")
const bcrypt= require("bcrypt");
const jwt =require("jsonwebtoken")
const dotenv= require("dotenv")
const { default: rateLimit } = require("express-rate-limit");


//Global config
dotenv.config();
//Internal imports
const{User}=require("../model/User")
const { registerSchema, verifySchema, loginSchema, resendOtpSchema, forgotPasswordSchema, resetPassSchema } = require("../validation/userValidator");
const {sendMail}=require("../utilis/sendEmail");
const { generateOtp } = require("../utilis/generateOtp");
const { authMiddleWare } = require("../middlewares/atuth.middleware");



//ToDo :Login
router.post("/login",async function(request,response){
   try {
    //Extract Data
    const {error,value}=loginSchema.validate(request.body,{abortEarly:false})
    if(error){
  return response
  .status(400)
  .json({messages:error.details.map((e)=>e.message)})
}
const{email,password}= value;
//check user effesct
const user = await User.findOne({email});
if(!user){
  return response.status(400).json({message:"Email Or Password"})
}
//Compare password
const isMatch = await bcrypt.compare(password ,user.password)
if(!isMatch){
  
}
//check is Verify
//frontend => redirect verify otp route
if(!user.isVerify){
  return response.status(403).json({
    message:"Acount not verifird Yet ",
    isVerify:false,
    email:user.email,
  })
}
//generate Token
 const token = jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN})
 response.json({message:"Loggedin Successfully",token},)


 } catch (error) {
    console.log(error)
    response.status(500).json({message:"Interval Server Error !"})
 }
})




//TODO:REGISTER
router.post("/register",async function(request,response){
  try {
    //Validate data
    const {error,value}=
     registerSchema.validate(request.body,{abortEarly:false});

if(error){
  return response.status(400).json({messages:error.details.map((e)=>e.message)})
}
//validate Email Exist or Not
const {email,password}= value;
const existingUser = await User.findOne({email});
if(existingUser){
  return response.status(400).json({message:"Email Already Exist "})
}
//hash password
const hashPassword=  await bcrypt.hash(password,12);
//generate OTP + otpExpires
const {otp,otpExpires}= generateOtp();
//save user
const user= await User.create({
  email,
  password:hashPassword,
  otp,
  otpExpires});

  //send email
  await sendMail(email,"OTP code",`Your OTP IS: ${otp}`);

response.status(201).json({message:"OTP Sent to Your Email "})

  } catch (error) {
    console.log(error)
    response.status(500).json({message:"Interval Server Error !"})
  }
})


//TODO:VERIFY-OTP
router.post("/verify",async function(request,response){
   try {
    //validate data
    const {error,value}= verifySchema.validate(request.body,{abortEarly:false})
    if(error){
      return response.status(400).json({messages:error.details.map((e)=>e.message)})
    }
    //extract data
    const{email,otp}= value;

    //validate user
    const user = await  User.findOne({email});
    if(!user){
      return response
      .status(400)
      .json({message:"This Email not related to user"})
    }

    //validate otp not expire
    if(user.otp !== otp || user.otpExpires < Date.now()) {
       return response.status(400).json({message:"Invalid OTP  Or Expired OTP"})
    }
    //verify
    user.isVerify = true;
    //clear otp
    user.otp= undefined;
    user.otpExpires = undefined;
    //save user
    await user.save();
    response.json({message:"Account Verified Successfully"});

  } catch (error) {
    console.log(error)
    response.status(500).json({message:"Interval Server Error !"})
  }
})

//__________________Task prevent spam________________________//
//TODO:if => otpExpires

//Todo resend-OTP
router.post("/resend",async function(request,response){
  try {
    //Extract Info
    const {error,value}= resendOtpSchema.validate(request.body);
    if(error){
      return response.status(400).json({message:message.error});
    }
    //Extract Data
        const{email}=value;
//Check User
const user = await User.findOne({email});
        if(!user){
      return response.status(400).json({message:"This Email is Not Related To User"})
      }
  //Check Verify
if(user.isVerify){
  return response.status(400).json({message:"User Is Already Verified"})
}


//prevent otp spam
if(user.otpExpires && user.otpExpires > Date.now()){
  
  const timeLeft= Math.ceil((user.otpExpires - Date.now() )/ 1000)
return response.json({message:`You Can Request A new OTP After : ${timeLeft} seconds`})
}

//generate otp + otpExpires
const {otp,otpExpires} =  generateOtp();

//update userInfo
user.otp = otp;
user.otpExpires= otpExpires;

//save user
await user.save();



  //send email
  await sendMail(email,"OTP code",`Your OTP IS: ${otp}`);
response.json({message:"OTP Sent to Your Email "});








  } catch (error) {
    console.log(error)
    response.status(500).json({message:"Internal Server Error"})
  }
})

//TODO:Forget Password
router.post("/forgot-password", async function(request,response){
  try {
    //validate email
    const {error,value}= forgotPasswordSchema.validate(request.body)
    if(error){
      return response.status(400).json({message:message.error});
    }
   //Extract Info
    const{email}=value
    //Check User
    const user= await User.findOne({email});
    if(!user){
      return response.status(400).json({message:"This Email is Not Related To User"})
      }
      //randomBytes 32
    const  resetPasswordToken  = crypto.randomBytes(32).toString("hex")
      const resetPasswordExpiresIN =Date.now() + 60*1000*10;
//update User
user.resetPasswordExpiresIN = resetPasswordExpiresIN;
user.resetPasswordToken = resetPasswordToken;
await user.save();
//Origin Front + reset Password /${token}
const resetUrl = `${process.env.CLIENT_ORIGIN}/reset-password/${resetPasswordToken}`
await sendMail(email,
  "Reset Password",
  `Click this link to Reset your password:${resetUrl}`
);
response.json({message:"Reset Your Password Link Send Your mail "})

  } catch (error) {
        console.log(error)
    response.status(500).json({message:"Internal Server Error"})
  }
})

//TODO:Reset Password
router.post("/reset-password", async function(request,response){
  try {
    //validate Data
const {error,value}=resetPassSchema.validate(request.body,{abortEarly:false,})
if(error){ 
 return  response.status(400).json({messages:error.details.map((e)=>e.message)});
}
//Extract Data
const {token,newPassword}= value;
//check user
const user = await User.findOne({resetPasswordToken:token,
  resetPasswordExpiresIN:{$gt:Date.now()},
})

  if(!user){
    return response.status(400).json({message:"Invalid Token Or EXpired"})
  }  

  //hash pasword
  const password = await bcrypt.hash(newPassword,12);
  //update password
  user.password = password;
  //clear
  user.resetPasswordToken=undefined;
  user.resetPasswordExpiresIN=undefined;
//save user
  await user.save();
    response.json({messsage:"Passsword Changes Successfully"})
  } catch (error) {
        console.log(error)
    response.status(500).json({message:"Internal Server Error"})
  }
})

//TODO :get UserInfo
router.get("/my",authMiddleWare,async function (request,response){
  try {
    //extract data
    const id = request.user.id;
    //validate user
    const user= await User.findById(id);
    if(!user){
      return response.status(400).json({message:"User Not Found"})
    }
  } catch (error) {
    console.log(error)
    response.status(500).json({message:"Interval Server Error"})
  }
})
module.exports = router;