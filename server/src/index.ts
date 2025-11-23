import express from "express";
import env from 'dotenv';
import cors from 'cors';
import { userRouter } from "./modules/Users/Router";
import { urlencoded } from "body-parser";
import cookieParser from 'cookie-parser'
env.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(cors({
    origin:'http://localhost:3000',
    credentials:true,
}))

app.use('/api/users', userRouter);

app.get('/api',(req,res)=>{
    res.status(200).json({msg:'api working'});
})

app.listen(8000,()=>{
    console.log('Server running on port 8000');
})