const mongoose= require("mongoose")

async function connectDB(){
    await mongoose.connect("mongodb://localhost:27017/hospitaldb")
    console.log("database connected")
}  

module.exports= connectDB
