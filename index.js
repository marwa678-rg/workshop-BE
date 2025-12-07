 
 //imports
const express = require("express");
const dotenv= require("dotenv");
const cors = require("cors")
const rateLimit = require("express-rate-limit");

//Internal imports
const {connectToDatabase} = require("./config/db.config");
const authRoutes = require("./routes/authRoutes")
//Global config
dotenv.config();

//App
 const app = express();
 const PORT = process.env.PORT || 3000 ;

 //Global middlewares
 app.use(express.json())
app.use(cors({origin:JSON.parse(process.env.PRODUCTION_ENV)? process.env.CLIENT_ORIGIN: "*",}))



//Rate Limit
const limiter =rateLimit({
  windowMs:15*60*1000,
  max:100,
  message:"Too manny requests ,try again Later",
});
app.use(limiter);
//Main Routes
 app.get("/",(request,response)=>{
  response.send("Welcome To Backend")
 });

//API routes
app.use("/api/v1/auth",authRoutes)
 
//Connect Cloud
connectToDatabase();

//Run Server
 app.listen(PORT,function(){
  
  console.log(`SERVER RUNNING @ PORT :${PORT}`)
 });

