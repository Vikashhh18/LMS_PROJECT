# LMS Project Deployment Guide

This guide provides instructions for deploying the LMS application on Render.

## Backend Deployment

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the service with the following settings:
   - **Name**: lms-backend
   - **Runtime**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && node server.js`
   - **Root Directory**: Leave empty

4. Add the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 5000
   - `FRONTEND_URL`: Your frontend URL on Render (e.g., https://lms-frontend.onrender.com)
   - `MONGODB_URI`: Your MongoDB connection string
   - `CLERK_SECRET_KEY`: Your Clerk secret key
   - `CLERK_WEBHOOK_SECRET`: Your Clerk webhook secret
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret

5. Click "Create Web Service"

## Frontend Deployment

1. Create a new Static Site on Render
2. Connect your GitHub repository
3. Configure the service with the following settings:
   - **Name**: lms-frontend
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`
   - **Root Directory**: Leave empty

4. Add the following environment variables:
   - `VITE_BACKEND_URL`: Your backend URL on Render (e.g., https://lms-backend.onrender.com)
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_CURRENCY`: USD

5. Click "Create Static Site"

## Troubleshooting

If you encounter network errors or your application shows no data:

1. **Check CORS Configuration**: Ensure your backend's CORS settings include your frontend URL.
2. **Verify Environment Variables**: Make sure all required environment variables are set correctly.
3. **Check Network Requests**: Use browser developer tools to check for errors in network requests.
4. **Test API Endpoints**: Try accessing `/api/debug` or `/health` on your backend to check connectivity.
5. **Check Logs**: Review your backend logs on Render for any errors.

For any issues with the clerk auth or stripe payments, ensure the webhook URLs are configured correctly in their respective dashboards. 