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

// *** Fixed CORS configuration - allow all origins for now to debug connectivity issues ***
app.use(cors({
  origin: '*', // Allow all origins temporarily to debug
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(clerkMiddleware());
app.use(ClerkExpressWithAuth());

app.get('/', (req, res) => res.send('api working properly guys!'))
// Add a dedicated health check endpoint for Render
app.get('/health', (req, res) => res.status(200).send('OK'))

// Add a diagnostic route to help with debugging
app.get('/api/debug', (req, res) => {
  res.json({
    success: true,
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    cors: {
      allowedOrigins: typeof corsOptions.origin === 'function' 
        ? 'dynamic function' 
        : corsOptions.origin
    },
    connections: {
      mongodb: !!process.env.MONGODB_URI,
      clerk: !!process.env.CLERK_SECRET_KEY,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      cloudinary: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    }
  });
});

app.post('/clerk', express.json(), clerkWebHook)

app.use("/api/educator", express.json(), educatorRouter); // done
app.use("/api/course", express.json(), courseRouter);
app.use("/api/user", express.json(), userRouter);

// Global error handling middleware
app.use((err, req, res, next) => {
  // Log the error (but not in production)
  if (process.env.NODE_ENV !== 'production') {
    console.error('Error:', err.stack);
  }
  
  // Send back an appropriate response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Handle 404 errors for any unmatched routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

const PORT = process.env.PORT || 5000;

// Update the listen call to bind to all network interfaces (0.0.0.0)
// This is required for Render to be able to connect to your server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on 0.0.0.0:${PORT}`);
})
