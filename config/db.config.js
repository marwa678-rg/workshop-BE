//imports
const mongoose= require("mongoose");
const dotenv = require("dotenv");

//config
dotenv.config();

//connection DB
async function connectToDatabase(){
  try {
      await mongoose.connect(process.env.CONNECTION_STRING);
      console.log(`MONGO CLOUD CONNECTION SUCCESSFUL`)


  } catch (error) {
    console.log(error)
  }
}

module.exports= {connectToDatabase};