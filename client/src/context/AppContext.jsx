import { createContext, useEffect, useState } from "react";
import { dummyCourses, dummyStudentEnrolled } from "../assets/assets";
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    // Properly handle environment variables with fallbacks
    const currency = import.meta.env.VITE_CURRENCY || 'USD';
    // Force use of a specific backend URL for debugging
    const backendUrl = "https://lms-backend.onrender.com";
    
    // Add verbose logging to help debug connection issues
    console.log('🔄 AppContext initialized');
    console.log('🌐 Using backend URL:', backendUrl);
    console.log('💲 Currency:', currency);
    console.log('⚙️ Environment variables:', {
      VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
      VITE_CURRENCY: import.meta.env.VITE_CURRENCY,
      NODE_ENV: import.meta.env.NODE_ENV
    });

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState([]);
    const [userData, setUserData] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Create an axios instance with debug settings
    const api = axios.create({
      baseURL: backendUrl,
      timeout: 30000, // Longer timeout to help with slow connections
      withCredentials: false // Disable credentials to fix potential CORS issues
    });
    
    // Log all requests for debugging
    api.interceptors.request.use(
      config => {
        console.log(`🌐 Making ${config.method.toUpperCase()} request to: ${config.baseURL}${config.url}`);
        return config;
      },
      error => {
        console.error('❌ Request error:', error);
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor for error handling
    api.interceptors.response.use(
      response => {
        console.log(`✅ Response from ${response.config.url}:`, response.status);
        return response;
      },
      error => {
        // Log and handle network errors in detail
        if (!error.response) {
          console.error('❌ Network error! Full details:', error);
          
          // Try direct fetch as a fallback to see if the API is reachable
          fetch(`${backendUrl}/health`)
            .then(res => {
              console.log('Health check response:', res.status);
              if (res.ok) {
                toast.info("API is reachable via fetch but not axios");
              }
            })
            .catch(e => {
              console.error('Health check failed:', e);
              toast.error("API is unreachable: " + e.message);
            });
            
          setApiError(`Network error: ${error.message}`);
          toast.error(`Network error: ${error.message}`);
        } else {
          console.error('❌ API error:', error.response.status, error.response.data);
          setApiError(`API error ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`);
        }
        return Promise.reject(error);
      }
    );

    // Run network test on mount
    useEffect(() => {
      // Test connectivity to backend
      console.log('🧪 Testing API connectivity...');
      fetch(`${backendUrl}/health`)
        .then(res => {
          console.log(`🧪 Health check: ${res.status}`);
          if (res.ok) {
            console.log('✅ API is reachable');
          } else {
            console.error('❌ API returned error status:', res.status);
          }
        })
        .catch(err => {
          console.error('❌ API health check failed:', err.message);
          toast.error(`API health check failed: ${err.message}`);
        });
    }, []);

    const fetchAllCourses = async () => {
        setIsLoading(true);
        try {
            setApiError(null);
            console.log('📚 Fetching all courses...');
            const {data} = await api.get("/api/course/all");
            
            console.log('📚 Courses data:', data);
            if(data.success){
                setAllCourses(data.courses);
                console.log(`✅ Loaded ${data.courses.length} courses`);
            }
            else{
                toast.error(data.message || "Failed to fetch courses");
                // Fallback to dummy data in development
                if (import.meta.env.DEV) {
                    console.log('⚠️ Using dummy course data as fallback');
                    setAllCourses(dummyCourses);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching courses:", error);
            toast.error(error.response?.data?.message || "Failed to fetch courses");
            
            // Fallback to dummy data in development
            if (import.meta.env.DEV) {
                console.log('⚠️ Using dummy course data as fallback');
                setAllCourses(dummyCourses);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const fetchUserdata = async () => {
        if (user?.publicMetadata?.role === 'educator') setIsEducator(true);
        try {
            const token = await getToken();
            const {data} = await api.get("/api/user/data", {
                headers: {Authorization: `Bearer ${token}`}
            });
            
            if(data.success){
                setUserData(data.user);
            }
            else toast.error(data.message || "Failed to fetch user data");
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast.error(error.response?.data?.message || "Failed to fetch user data");
        }
    }

    // calculate average rating
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;

        let totalRating = 0;

        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });

        return Math.floor(totalRating / course.courseRatings.length);
    };

    // calaulte chater time duration
    const calculateTimeDuration = (chapter) => {
        let time = 0;
        chapter.chapterContent.map((lecture) => time += lecture.lectureDuration);

        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    }

    // calculate course duration 
    const calulateCourseDuration = (course) => {
        let time = 0;

        (course?.courseContent ?? []).forEach((chapter) => {
            (chapter?.chapterContent ?? []).forEach((lecture) => {
                time += lecture?.lectureDuration ?? 0;
            });
        });

        return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'] });
    };

    // calculate no of lecture in course 
    const calulateNoOfLecture = (course) => {
        let totalCourse = 0;
        course.courseContent.forEach(chapter => {
            if (Array.isArray(chapter.chapterContent)) {
                totalCourse += chapter.chapterContent.length;
            }
        });
        return totalCourse;
    }

    // fatch enrolled course by student 
    const fatchEnrolledCourse = async () => {
        setIsLoading(true);
        try {
            console.log('📚 Fetching enrolled courses...');
            const token = await getToken();
            console.log('🔑 Auth token obtained');
            
            const { data } = await api.get("/api/user/enrolled-courses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('📚 Enrolled courses data:', data);
            if (data.success) {
                setEnrolledCourse(data.enrolledCourses || []);
                console.log(`✅ Loaded ${data.enrolledCourses?.length || 0} enrolled courses`);
            } else {
                console.error('❌ API returned error:', data.message);
                toast.error(data.message || "Failed to fetch enrolled courses");
                
                // Fallback to dummy data in development
                if (import.meta.env.DEV) {
                    console.log('⚠️ Using dummy enrolled courses as fallback');
                    setEnrolledCourse([]);
                }
            }
        } catch (error) {
            console.error("❌ Error fetching enrolled courses:", error);
            toast.error(error.response?.data?.message || "Failed to fetch enrolled courses");
            
            // Fallback to dummy data in development
            if (import.meta.env.DEV) {
                console.log('⚠️ Using dummy enrolled courses as fallback');
                setEnrolledCourse([]);
            }
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        fetchAllCourses();
    }, []);
    
    useEffect(() => {
        if (user) {
            fetchUserdata();
            fatchEnrolledCourse();
        }
    }, [user]);

    const updateRoleToEducator = async () => {
        try {
            const token = await getToken();

            if (!token) {
                console.error("No Clerk token found");
                return;
            }

            const { data } = await api.post('/api/educator/update-role', {}, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (data.success) {
                setIsEducator(true);
                toast.success("Successfully updated to educator role");
            }
        } catch (error) {
            console.error("Error updating role:", error);
            toast.error("Failed to update to educator role");
        }
    };

    const value = {
        currency, 
        allCourses, 
        calculateRating, 
        isEducator, 
        setIsEducator, 
        calculateTimeDuration, 
        calulateNoOfLecture,
        calulateCourseDuration, 
        enrolledCourse, 
        fatchEnrolledCourse, 
        updateRoleToEducator,
        backendUrl,
        userData,
        setUserData,
        getToken,
        fetchAllCourses,
        apiError,
        isLoading
    }
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}