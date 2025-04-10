import express from 'express';
import 'dotenv/config'
import cors  from 'cors';
import connectDb from './config/mongoDb.js';
import { clerkWebHook } from './controllers/webhooks.js';

// initilaze express 
const app=express();

// db connection 
await connectDb();

// middlewares 
app.use(cors());


app.get('/',(req,res)=>res.send('api working!'))
app.post('/clerk',express.json(),clerkWebHook)

app.listen(process.env.PORT,()=>{
    console.log(`Server run in Port no ${process.env.PORT}`);
})
