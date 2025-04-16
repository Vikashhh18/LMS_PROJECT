# LMS Deployment Troubleshooting Guide

This guide helps you troubleshoot common issues that may occur during deployment of your Learning Management System.

## Quick Health Checks

Before diving into specific issues, check the system health:

- Backend Health: Visit `https://your-backend-url.com/health`
- API Debug Info: Visit `https://your-backend-url.com/api/debug`

These endpoints provide information about server status and configuration to help diagnose issues.

## Common Issues and Solutions

### Network Error: Timeout

**Symptoms:**
- "Network Error" messages in the browser console
- API calls not completing
- Infinite loading states

**Possible Solutions:**
1. Check if the backend server is running by visiting the `/health` endpoint
2. Verify your API base URL configuration in your frontend environment variables
3. Check for network restrictions (firewalls, VPNs) that might block connections
4. Ensure your deployment platform (Render, Heroku, etc.) hasn't put your service to sleep due to inactivity

### Database Connection Issues

**Symptoms:**
- 500 errors from backend API calls
- Error logs mentioning "MongoDB connection" issues
- Empty data responses

**Possible Solutions:**
1. Verify MongoDB connection string in your environment variables
2. Check if your IP address is whitelisted in MongoDB Atlas
3. Ensure your MongoDB user has correct permissions
4. Check MongoDB Atlas status page for service outages
5. Visit the `/api/debug` endpoint to check MongoDB connection status

### CORS Issues

**Symptoms:**
- Console errors mentioning "CORS policy"
- API requests failing despite backend being online
- Errors only happening in browser but not in API testing tools

**Possible Solutions:**
1. Verify the `CORS_ORIGIN` environment variable is set correctly
2. Check if your frontend URL exactly matches the allowed origin
3. For local testing, ensure you're using the same protocol (http/https)
4. Visit the `/api/debug` endpoint to view current CORS settings

### Clerk Authentication Issues

**Symptoms:**
- Unable to login or register
- 401/403 errors when accessing protected routes
- Authentication sessions not persisting

**Possible Solutions:**
1. Verify Clerk API keys are correctly set in environment variables
2. Ensure the Clerk application domain settings match your deployed domain
3. Check browser console for Clerk-specific errors
4. Try clearing browser cookies and local storage

## Debugging Steps

1. **Check Backend Health**:
   - Visit the `/health` endpoint
   - Verify server is running and responding with status "ok"

2. **Use API Debug Endpoint**:
   - Visit `/api/debug` to see detailed server configuration
   - Check MongoDB connection status and environment settings

3. **Test Direct API Calls**:
   - Use Postman or curl to test API endpoints directly
   - Compare responses with browser requests to isolate frontend vs. backend issues

4. **Check Frontend Console**:
   - Open browser developer tools (F12)
   - Look for error messages in the Console tab
   - Check Network tab for failed requests

5. **Check Backend Logs**:
   - Review logs in your deployment platform (Render, Heroku, etc.)
   - Look for error messages or warnings

## Quick Fixes

1. **Restart Backend Service**:
   - In your deployment platform, restart the backend service
   - This can resolve temporary issues with memory or connections

2. **Force Redeploy Frontend**:
   - Trigger a new build and deployment of your frontend
   - This ensures latest environment variables are applied

3. **Try Offline Mode**:
   - If using service workers, try disabling them temporarily
   - Clear application cache in browser developer tools

4. **Check Environment Variables**:
   - Verify all required environment variables are set
   - Ensure values don't have extra spaces or quotation marks

## Advanced Debugging

For persistent issues, you may need to run the application locally to debug:

1. Clone the repository
2. Set up local environment variables
3. Run the backend: `npm run dev` in the server directory
4. Run the frontend: `npm run dev` in the client directory
5. Test functionality locally to isolate deployment-specific issues

## Additional Resources

- [Render Deployment Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Clerk Documentation](https://clerk.dev/docs)
- [GitHub Repository README](/README.md) 