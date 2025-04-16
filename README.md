# Learning Management System (LMS)

A modern, full-stack Learning Management System built with the MERN stack (MongoDB, Express, React, Node.js).

![LMS Platform Screenshot](https://res.cloudinary.com/demo/image/upload/v1625123456/lms-screenshot.jpg)

## Features

### For Students
- **Course Discovery**: Browse and search through available courses
- **Course Enrollment**: Seamlessly enroll in courses with a streamlined process
- **Learning Dashboard**: Track progress across all enrolled courses
- **Video Lectures**: Watch high-quality video content with a feature-rich player
- **Progress Tracking**: Automatically track completed lectures and overall course progress
- **Responsive Design**: Access courses on any device with a fully responsive UI

### For Educators
- **Course Creation**: Intuitive interface for creating and organizing courses
- **Content Management**: Easily upload and manage lecture videos and materials
- **Student Progress Tracking**: Monitor student engagement and completion rates
- **Course Analytics**: Get insights into the most popular lectures and student progress

### System Features
- **Authentication**: Secure user authentication with Clerk
- **Media Storage**: Cloud-based media storage with Cloudinary
- **Database**: Robust data persistence with MongoDB
- **Responsive Design**: Mobile-first approach for all user interfaces

## Tech Stack

### Frontend
- **React**: UI library for building the user interface
- **Vite**: Next-generation frontend tooling
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: For client-side routing
- **Axios**: Promise-based HTTP client
- **React Icons**: Popular icon library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Cloudinary**: Cloud storage for media files
- **Clerk**: Authentication and user management

## Installation

### Prerequisites
- Node.js (v16 or later)
- MongoDB (local or Atlas)
- Cloudinary account
- Clerk account

### Backend Setup
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/lms-platform.git
   cd lms-platform
   ```

2. Install server dependencies
   ```bash
   cd server
   npm install
   ```

3. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=8000
   MONGODB_URI=mongodb://localhost:27017/lms-db
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   CLERK_SECRET_KEY=your-clerk-secret-key
   ```

4. Start the backend server
   ```bash
   npm start
   ```

### Frontend Setup
1. Open a new terminal and navigate to the client directory
   ```bash
   cd ../client
   ```

2. Install client dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the client directory with:
   ```
   VITE_APP_API_BASE_URL=http://localhost:8000
   VITE_APP_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   ```

4. Start the frontend development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
lms-platform/
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── assets/       # Images and other assets
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context providers
│   │   ├── layouts/      # Layout components
│   │   ├── pages/        # Page components
│   │   │   ├── educator/ # Educator-specific pages
│   │   │   ├── student/  # Student-specific pages
│   │   ├── App.jsx       # Main App component
│   │   └── main.jsx      # Application entry point
│   ├── .env              # Environment variables
│   └── package.json      # Frontend dependencies
│
├── server/               # Backend Express application
│   ├── controllers/      # Request handlers
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Utility functions
│   ├── server.js         # Server entry point
│   ├── .env              # Environment variables
│   └── package.json      # Backend dependencies
│
├── DEPLOYMENT.md         # Deployment guide
├── TROUBLESHOOTING.md    # Troubleshooting guide
└── README.md             # Project documentation
```

## API Documentation

The API includes the following main endpoints:

- **Authentication**
  - `/api/v1/auth/register` - Register a new user
  - `/api/v1/auth/login` - Log in an existing user
  - `/api/v1/auth/me` - Get the current user's profile

- **Courses**
  - `/api/v1/courses` - Get all published courses
  - `/api/v1/courses/:id` - Get a specific course
  - `/api/v1/courses/create` - Create a new course (educator only)
  - `/api/v1/courses/:id/lectures` - Get all lectures for a course
  
- **Enrollments**
  - `/api/v1/enrollments` - Get all enrollments for the current user
  - `/api/v1/enrollments/:courseId` - Enroll in a course
  
- **Progress**
  - `/api/v1/progress/:courseId` - Get progress for a specific course
  - `/api/v1/progress/:courseId/lectures/:lectureId` - Mark a lecture as complete

## Deployment

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Troubleshooting

For common issues and solutions, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [Vite](https://vitejs.dev/) for the frontend build tool
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) for database hosting
- [Cloudinary](https://cloudinary.com/) for media storage
- [Clerk](https://clerk.dev/) for authentication
- [Render](https://render.com/) for hosting 