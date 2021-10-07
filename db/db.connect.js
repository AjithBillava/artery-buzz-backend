const mongoose = require("mongoose")

async function initialiseDatabaseConnection() {
    try{
        await mongoose.connect(process.env.db_path,{
            useUnifiedTopology:true,
            useNewUrlParser:true 
        })
        console.log("successfully connected")        
    }catch(error){
        console.error("mongoose connection failed",error)
    }
}


module.exports = {initialiseDatabaseConnection}