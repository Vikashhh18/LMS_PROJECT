# LMS Platform Deployment Guide

This guide will walk you through deploying the Learning Management System (LMS) platform to a production environment.

## Prerequisites

Before deploying, ensure you have:

- A MongoDB Atlas account for database hosting
- A Cloudinary account for media storage
- A Clerk account for authentication
- A deployment platform account (e.g., Render, Vercel, Heroku)
- Node.js version 16+ installed locally

## Environment Variables

### Backend Environment Variables

Create a `.env` file in the `server` directory with the following variables:

```
# Server Configuration
PORT=8000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/lms-db?retryWrites=true&w=majority

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Clerk Authentication
CLERK_SECRET_KEY=your-clerk-secret-key

# Email Configuration (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-password
SMTP_FROM_EMAIL=noreply@your-domain.com
```

### Frontend Environment Variables

Create a `.env` file in the `client` directory with:

```
VITE_APP_API_BASE_URL=https://your-backend-domain.com
VITE_APP_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
```

## Deployment Steps

### Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database named `lms-db`
3. Create a database user with read/write permissions
4. Add your IP address or allow access from anywhere (0.0.0.0/0)
5. Copy the connection string to use in your environment variables

### Backend Deployment (Render)

1. Sign up or log in to Render (https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: lms-backend
   - **Root Directory**: server
   - **Build Command**: npm install
   - **Start Command**: npm start
   - **Environment**: Node
   - **Plan**: Starter or higher (based on needs)
5. Add all environment variables from your backend `.env` file
6. Click "Create Web Service"

After deployment, verify your backend is running by visiting:
- Health check: `https://your-backend-domain.com/health`
- Debug info: `https://your-backend-domain.com/api/debug`

### Frontend Deployment (Render/Vercel)

#### Render Deployment

1. Create a new Static Site in Render
2. Connect your GitHub repository
3. Configure the site:
   - **Name**: lms-frontend
   - **Root Directory**: client
   - **Build Command**: npm install && npm run build
   - **Publish Directory**: dist
4. Add environment variables
5. Click "Create Static Site"

#### Vercel Deployment

1. Sign up or log in to Vercel (https://vercel.com)
2. Import your GitHub repository
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: client
   - **Build Command**: npm run build
   - **Output Directory**: dist
4. Add environment variables
5. Click "Deploy"

## Post-Deployment Verification

After deploying both services, verify the system is working correctly:

1. Visit the frontend URL
2. Try to register and log in
3. Create a test course (as an educator)
4. Enroll in a course (as a student)
5. Play a lecture and test course completion

If you encounter issues, check the [Troubleshooting Guide](TROUBLESHOOTING.md).

## Health Monitoring

The backend includes health check endpoints for monitoring:

- `/health`: Returns basic server status information
  ```json
  {
    "status": "ok",
    "uptime": "10h 5m 30s",
    "timestamp": "2023-07-19T12:30:45.123Z",
    "environment": "production"
  }
  ```

- `/api/debug`: Returns detailed diagnostic information
  ```json
  {
    "serverTime": "2023-07-19T12:30:45.123Z",
    "nodeVersion": "v16.15.0",
    "environment": "production",
    "databaseConnected": true,
    "corsSettings": {
      "origin": "https://your-frontend-domain.com",
      "methods": ["GET", "POST", "PUT", "DELETE"]
    },
    "memoryUsage": {
      "rss": "75MB",
      "heapTotal": "50MB",
      "heapUsed": "45MB"
    }
  }
  ```

Use these endpoints with monitoring services like UptimeRobot or Pingdom to ensure your application remains available.

## Updating Your Deployment

When you make updates to your code:

1. Push changes to your GitHub repository
2. Render will automatically deploy the changes
3. If needed, manually trigger a deployment in the Render dashboard

## SSL Configuration

Render automatically provides SSL certificates for all deployments. For custom domains:

1. Add your custom domain in the Render dashboard
2. Update your DNS settings to point to Render
3. Render will automatically issue an SSL certificate

## Backup Strategy

Regularly backup your database to prevent data loss:

1. Use MongoDB Atlas scheduled backups
2. Export your database periodically
3. Store backups in a secure location

## Production Optimization

For better performance in production:

1. Enable MongoDB Atlas Performance Advisor
2. Set up Cloudinary image transformations for optimized media delivery
3. Configure proper caching headers in your frontend application
4. Consider implementing a CDN for static assets

## Scaling Considerations

As your application grows:

1. Upgrade your MongoDB Atlas cluster
2. Increase resources for your Render web service
3. Implement database indexing for frequently accessed data
4. Consider microservices architecture for specific features

## Security Best Practices

Enhance your application security:

1. Regularly update dependencies
2. Use MongoDB Atlas IP whitelisting
3. Implement rate limiting for API endpoints
4. Conduct regular security audits

## Support and Maintenance

For ongoing support:

1. Monitor application logs in Render dashboard
2. Set up alerts for health check failures
3. Keep dependencies updated
4. Maintain documentation for new developers 