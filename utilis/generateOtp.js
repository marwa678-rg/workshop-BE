//imports
const{generate} = require('otp-generator');





 function generateOtp(){
  //Generate OTP
const otp = generate(6,{digits:true,specialChars:true});
const otpExpires= Date.now() + 1*60*1000;


  return{otp,otpExpires}
}


module.exports={generateOtp};