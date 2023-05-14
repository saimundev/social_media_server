import express from "express";
import cors from "cors";
import * as dotenv from 'dotenv' 
import connectDb from "./models/db.js";
import authRouter from "./routes/authRoute.js"
import postRouter from "./routes/postRoute.js"



//INIT APP
const app = express();

//DOTENV CONFIGE
dotenv.config()

//DATABASE CONNECT
connectDb();

//PORT
const port = process.env.PORT || 5050;

//MIDDLEARE
app.use(express.json());
app.use(cors());

//ROUTER
app.use("/api/auth",authRouter);
app.use("/api/post",postRouter)





//SERVER
app.listen(port,()=>{
    console.log(`server is raning on the port is ${port}`);
})