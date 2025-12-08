

const Joi = require("joi");

const registerSchema = Joi.object({
  email:Joi.string().email().required(),
  password:Joi.string().min(6).required(),
});


const verifySchema=Joi.object({
 email:Joi.string().email().required(),
 otp:Joi.string().length(6).required()
});



const loginSchema = Joi.object({
 email:Joi.string().email().required(),
  password:Joi.string().min(6).required(),
})

const resendOtpSchema = Joi.object({
   email:Joi.string().email().required(),
})


const forgotPasswordSchema=Joi.object({
  email:Joi.string().email().required(),
})


const resetPassSchema = Joi.object({
  token:Joi.string().required(),
  newPassword:Joi.string().length(6).required(),

})

module.exports={
  registerSchema,
  verifySchema,
  loginSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPassSchema,
}