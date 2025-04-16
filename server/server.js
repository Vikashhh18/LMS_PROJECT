import express, { application } from 'express';
import 'dotenv/config'
import cors from 'cors';
import connectDb from './config/mongoDb.js';
import { clerkWebHook, stripeWebhook } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import connectCloudinary from './config/cloudinary.js';
import courseRouter from './routes/courseRouter.js';
import userRouter from './routes/userRoute.js';

// initilaze express 
const app = express();

// db connection 
await connectDb();
await connectCloudinary();

// IMPORTANT: Stripe webhook route must come before any other middleware that parses the request body
// This route should match what you have configured in your Stripe dashboard
app.post("/webhook", express.raw({ type: 'application/json' }), stripeWebhook);

// middlewares 
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://checkout.stripe.com',
    // Allow requests from your Render frontend domain
    process.env.FRONTEND_URL || 'https://your-render-app.onrender.com'
  ],
  credentials: true
}));

app.use(clerkMiddleware());
app.use(ClerkExpressWithAuth());

app.get('/', (req, res) => res.send('api working properly guys!'))
// Add a dedicated health check endpoint for Render
app.get('/health', (req, res) => res.status(200).send('OK'))
app.post('/clerk', express.json(), clerkWebHook)

app.use("/api/educator", express.json(), educatorRouter); // done
app.use("/api/course", express.json(), courseRouter);
app.use("/api/user", express.json(), userRouter);

const PORT = process.env.PORT || 5000;

// Update the listen call to bind to all network interfaces (0.0.0.0)
// This is required for Render to be able to connect to your server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
})
