const express = require("express")
const app = express()
const dotenv = require("dotenv")
const port = 3000
const cors = require("cors")
const compression = require("compression")
const { initialiseDatabaseConnection } = require("./db/db.connect")

const users = require("./routers/users.router")
const posts = require("./routers/posts.router")

initialiseDatabaseConnection()
dotenv.config()

app.use(express.json())
app.use(cors())
app.use(compression())

app.get('/', (req, res) => {
	res.json('Welcome to artery buzz backend')
  })
app.use("/v1/api/user",users)
app.use("/v1/api",posts)

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: "An error occurred, see the errorMessage key for more details",
		errorMessage: err.message,
	});
});

app.listen(process.env.PORT || port,()=>{
  console.log(`Example app listening at http://localhost:${port}`)
})