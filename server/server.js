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


app.get('/',(req,res)=>res.send('api working properly guys!'))
app.post('/clerk',express.json(),clerkWebHook)

const PORT=process.env.PORT||4000;

app.listen(PORT,()=>{
    console.log(`Server run in Port no ${PORT}`);
})
