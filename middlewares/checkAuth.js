const jwt = require("jsonwebtoken")
const checkAuth = (req,res,next) =>{
    try {
        
        const token =  req.headers.authorization?.split(" ")[1] || null

        if(token === null){
            return res.status(401).json({message:"logi for better experience"})
        }

        const jwtSecretKey = process.env.JWTSECRET
        const decoded  = jwt.verify(token,jwtSecretKey)

        req.user = decoded

        next()

    } catch (error) {
        res.status(401).json({message:"Your session is expired please login again"})
    }
}

module.exports = checkAuth