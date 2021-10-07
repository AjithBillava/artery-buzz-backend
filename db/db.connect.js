const mongoose = require("mongoose")

const initialiseDatabaseConnection = async() =>{
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