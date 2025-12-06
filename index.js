 
 //imports
 const express = require("express");
const dotenv= require("dotenv");
const {connectToDatabase} = require("./config/db.config")
//Global config
dotenv.config();
//App
 const app = express();

 const PORT = process.env.PORT || 3000 ;
 

//Main Routes
 app.get("/",(request,response)=>{
  response.send("Welcome To Backend")
 });


 
//Connect Cloud
connectToDatabase();

//Run Server
 app.listen(PORT,function(){
  
  console.log(`SERVER RUNNING @ PORT :${PORT}`)
 });

