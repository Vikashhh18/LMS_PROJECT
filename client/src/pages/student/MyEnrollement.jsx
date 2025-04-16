import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import Footer from '../../components/student/Footer';

// Simple beginner-friendly component
const MyEnrollement = () => {
  // Basic state and context setup
  const { enrolledCourse, calulateCourseDuration, fatchEnrolledCourse, backendUrl, getToken } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Complete enrollment function (simplified)
  const completePendingEnrollment = async () => {
    const lastPurchasedCourse = localStorage.getItem('last_purchased_course');
    
    if (lastPurchasedCourse) {
      try {
        const token = await getToken();
        const response = await axios.post(
          `${backendUrl}/api/user/complete-enrollment`,
          { courseId: lastPurchasedCourse },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
          toast.success("Course enrollment completed successfully!");
          localStorage.removeItem('last_purchased_course');
          await fatchEnrolledCourse();
        } else {
          toast.error(response.data.message || "Failed to complete enrollment");
        }
      } catch (error) {
        console.error("Error completing enrollment:", error);
        toast.error("Failed to complete enrollment");
      }
    }
  };
  
  // Simple useEffect for data loading
  useEffect(() => {
    // Check if coming from successful payment
    const params = new URLSearchParams(location.search);
    const isSuccess = params.get('success') === 'true';
    
    // Function to load data
    async function loadData() {
      setLoading(true);
      
      try {
        // Complete any pending enrollments
        await completePendingEnrollment();
        
        // Fetch enrolled courses
        await fatchEnrolledCourse();
        
        if (isSuccess) {
          toast.success("Payment successful! You are now enrolled in the course.");
          navigate('/my-enrollement', { replace: true });
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);
  
  // Function to handle course navigation
  function handleCourseClick(courseId) {
    navigate(`/player/${courseId}`);
  }
  
  // Helper function to get button text
  function getButtonText(progress) {
    if (progress && progress.isCompleted) {
      return "Completed";
    } else if (progress && progress.completedLectures > 0) {
      return "Continue Learning";
    } else {
      return "Start Learning";
    }
  }
  
  // Helper function to calculate progress percentage
  function getProgressPercent(progress) {
    if (!progress) return 0;
    if (progress.totalLectures === 0) return 0;
    return Math.round((progress.completedLectures / progress.totalLectures) * 100);
  }
  
  // Render loading state
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: '50px' 
        }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p>Loading your courses...</p>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Render empty state
  if (!enrolledCourse || enrolledCourse.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh' 
      }}>
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          maxWidth: '800px', 
          margin: '0 auto', 
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>My Learning Journey</h1>
          <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '40px 20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <img 
              src="https://cdn-icons-png.flaticon.com/512/2436/2436874.png" 
              alt="No courses" 
              style={{ width: '80px', height: '80px', margin: '0 auto 20px' }}
            />
            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>You haven't enrolled in any courses yet</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>Start your learning journey by enrolling in a course</p>
            <button 
              onClick={() => navigate('/course-list')}
              style={{
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '10px 20px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Browse Courses
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  // Main component render with courses
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh' 
    }}>
      <div style={{ 
        flex: 1, 
        maxWidth: '1000px', 
        margin: '0 auto', 
        padding: '20px',
        width: '100%'
      }}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>My Learning Journey</h1>
        
        {/* Simple Course List */}
        <div style={{ 
          background: 'white', 
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          {/* Table Header */}
          <div style={{ 
            display: 'flex', 
            background: '#f5f5f5', 
            padding: '12px 16px',
            fontWeight: 'bold',
            borderBottom: '1px solid #e0e0e0'
          }}>
            <div style={{ flex: '2' }}>Course</div>
            <div style={{ flex: '1' }}>Duration</div>
            <div style={{ flex: '1' }}>Progress</div>
            <div style={{ flex: '1', textAlign: 'center' }}>Action</div>
          </div>
          
          {/* Course List */}
          {enrolledCourse.map((course, index) => {
            const progress = course.progress || { totalLectures: 0, completedLectures: 0, isCompleted: false };
            const progressPercent = getProgressPercent(progress);
            
            return (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  padding: '16px', 
                  alignItems: 'center',
                  borderBottom: index < enrolledCourse.length - 1 ? '1px solid #e0e0e0' : 'none',
                  background: index % 2 === 0 ? '#fff' : '#f9f9f9'
                }}
              >
                {/* Course Info */}
                <div style={{ flex: '2', display: 'flex', alignItems: 'center' }}>
                  <img 
                    src={course.courseThumbnail} 
                    alt="" 
                    style={{ 
                      width: '80px', 
                      height: '50px', 
                      objectFit: 'cover',
                      borderRadius: '4px',
                      marginRight: '16px'
                    }} 
                  />
                  <div>
                    <p style={{ fontWeight: 'medium', marginBottom: '4px' }}>{course.courseTitle}</p>
                    {/* Simple progress bar */}
                    <div style={{ position: 'relative', height: '8px', width: '150px', background: '#e0e0e0', borderRadius: '4px' }}>
                      <div style={{ 
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: progress.isCompleted ? '#4caf50' : '#3498db',
                        borderRadius: '4px'
                      }}></div>
                    </div>
                    <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {progressPercent}% complete
                    </p>
                  </div>
                </div>
                
                {/* Duration */}
                <div style={{ flex: '1' }}>
                  {calulateCourseDuration(course)}
                </div>
                
                {/* Progress */}
                <div style={{ flex: '1' }}>
                  <span style={{ 
                    color: progress.isCompleted ? '#4caf50' : '#3498db',
                    fontWeight: 'medium'
                  }}>
                    {progress.completedLectures}/{progress.totalLectures}
                  </span> Lectures
                </div>
                
                {/* Action Button */}
                <div style={{ flex: '1', textAlign: 'center' }}>
                  <button 
                    onClick={() => handleCourseClick(course._id)}
                    style={{
                      background: progress.isCompleted ? '#4caf50' : '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 16px',
                      cursor: 'pointer'
                    }}
                  >
                    {getButtonText(progress)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Pending Enrollment Notification */}
      {localStorage.getItem('last_purchased_course') && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'white',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          border: '1px solid #e0e0e0',
          maxWidth: '300px',
          zIndex: 100
        }}>
          <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Pending Enrollment</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
            You have a course enrollment that needs to be completed.
          </p>
          <button 
            onClick={completePendingEnrollment}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Complete Enrollment
          </button>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default MyEnrollement