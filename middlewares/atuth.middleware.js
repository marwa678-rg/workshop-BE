// imports
const Jwt= require("jsonwebtoken")
const dotenv = require("dotenv")
//Global Config
dotenv.config();



function authMiddleWare(request,response,next){
try {
  //validate Headers
  const auth = request.headers["Authorization"];
  if(!auth) return response.status(401).json({message:"Unauthorized"});
//validate Token
const token = auth.split(" ")[1];
//validate Token
if(!token)return 

  //verify Token

  const payload = Jwt.verify(token,process.env.JWT_SECRET);

  request.user = payload;

  next();
} catch (error) {
  console.log(error);
  response.status(401).json({message:"Unauthorized"})
}

}
module.exports={authMiddleWare}