const{generate} = require('otp-generator');

 function generateOtp(){
  //Generate OTP
  
  
const otp = generate(6,{digits:true,specialChars:true});
const otpExpires= Date.now() + 60*10*1000;
  return{otp,otpExpires}
}


module.exports={generateOtp};