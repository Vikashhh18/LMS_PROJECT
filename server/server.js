import express, { application } from 'express';
import 'dotenv/config'
import cors  from 'cors';
import connectDb from './config/mongoDb.js';
import { clerkWebHook, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import connectCloudinary from './config/cloudinary.js';
import courseRouter from './routes/courseRouter.js';
import userRouter from './routes/userRoute.js';

// initilaze express 
const app=express();

// db connection 
await connectDb();
await connectCloudinary();  
// middlewares 
app.use(cors());
app.use(clerkMiddleware());
app.use(ClerkExpressWithAuth());


app.get('/',(req,res)=>res.send('api working properly guys!'))
app.post('/clerk',express.json(),clerkWebHook)

app.use("/api/educator",express.json(), educatorRouter);
app.use("/api/course",express.json(),courseRouter);
app.use("/api/user",express.json(),userRouter);
app.post("/stripe",express.raw({type:'application/json'}),stripeWebhooks)

const PORT=process.env.PORT||4000;

app.listen(PORT,()=>{
    console.log(`Server run in Port no ${PORT}`);
})
