import mongoose from "mongoose";

const connectDb = async () => {
  try {
    console.log("Connecting to MongoDB...");
    
    // If no MONGODB_URI is provided, use a local database for development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_backup';
    
    // Add connection options for better stability and error handling
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      maxPoolSize: 10, // Maintain up to 10 socket connections
      family: 4, // Use IPv4, skip trying IPv6
    });
    
    console.log("✅ MongoDB connected successfully");
    
    // Listen for connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    // Handle disconnections gracefully
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected, trying to reconnect...');
    });
    
    // Log when connection is successfully reconnected
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
    // Handle process termination to close the connection properly
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to application termination');
      process.exit(0);
    });
    
    return mongoose.connection;
  } catch (error) {
    console.error("⚠️ MongoDB connection error:", error.message);
    
    // For development, if we can't connect to MongoDB, provide some feedback
    console.log("🔍 Troubleshooting tips:");
    console.log("- Check that your MongoDB URI is correct in .env file");
    console.log("- Verify that your MongoDB instance is running");
    console.log("- Make sure your IP is allowed in the MongoDB Atlas network settings");
    console.log("- Check if there are any network restrictions");
    
    // The application will continue (in degraded mode) rather than crashing
    return null;
  }
};

export default connectDb;
