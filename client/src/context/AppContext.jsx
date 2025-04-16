import { createContext, useEffect, useState } from "react";
import { dummyCourses, dummyStudentEnrolled } from "../assets/assets";
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext();

// Provide fallback dummy course data
const DUMMY_COURSES = [
  {
    _id: "dummy1",
    courseTitle: "Demo Course 1",
    courseDescription: "This is a demo course since the API is unavailable",
    coursePrice: 29.99,
    discount: 20,
    courseThumbnail: "https://via.placeholder.com/300x200?text=Demo+Course+1",
    courseRatings: [],
    courseContent: [
      {
        chapterTitle: "Introduction",
        chapterContent: [
          { lectureTitle: "Welcome", lectureDuration: 5 }
        ]
      }
    ]
  },
  {
    _id: "dummy2",
    courseTitle: "Demo Course 2",
    courseDescription: "Another demo course",
    coursePrice: 49.99,
    discount: 10,
    courseThumbnail: "https://via.placeholder.com/300x200?text=Demo+Course+2",
    courseRatings: [],
    courseContent: [
      {
        chapterTitle: "Getting Started",
        chapterContent: [
          { lectureTitle: "Installation", lectureDuration: 10 }
        ]
      }
    ]
  }
];

export const AppContextProvider = (props) => {
    // Properly handle environment variables with fallbacks
    const currency = import.meta.env.VITE_CURRENCY || 'USD';
    
    // Try multiple backend URLs if the primary one fails
    const potentialBackendUrls = [
      import.meta.env.VITE_BACKEND_URL,
      "https://lms-backend.onrender.com",
      "https://lms-backend-xdgx.onrender.com", // Add your actual Render URL
      "http://localhost:5000"
    ];
    
    // Start with the first URL
    const [backendUrl, setBackendUrl] = useState(potentialBackendUrls[0] || "https://lms-backend.onrender.com");
    const [urlIndex, setUrlIndex] = useState(0);
    
    // Add verbose logging to help debug connection issues
    console.log('🔄 AppContext initialized');
    console.log('🌐 Current backend URL:', backendUrl);
    console.log('💲 Currency:', currency);

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState(DUMMY_COURSES);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState([]);
    const [userData, setUserData] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    // Function to try the next backend URL if one fails
    const tryNextBackendUrl = () => {
      const nextIndex = (urlIndex + 1) % potentialBackendUrls.length;
      const nextUrl = potentialBackendUrls[nextIndex];
      
      if (nextUrl) {
        console.log(`🔄 Switching to next backend URL: ${nextUrl}`);
        setBackendUrl(nextUrl);
        setUrlIndex(nextIndex);
        return true;
      }
      
      // If we've tried all URLs, go to offline mode
      console.log('⚠️ All backend URLs failed, switching to offline mode');
      setIsOfflineMode(true);
      toast.warning("Unable to connect to backend. Using offline mode with demo data.");
      return false;
    };

    // Create an axios instance with debug settings
    const api = axios.create({
      baseURL: backendUrl,
      timeout: 8000, // Use a shorter timeout for better user experience
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
        // Check for timeout errors
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          console.error('⏱️ Request timed out:', error.config.url);
          
          // Try the next backend URL
          if (tryNextBackendUrl()) {
            // Retry the request with the new URL
            const retryConfig = {
              ...error.config,
              baseURL: backendUrl
            };
            return axios(retryConfig);
          }
        }
        
        // Log and handle network errors in detail
        if (!error.response) {
          console.error('❌ Network error! Full details:', error);
          
          // Try the next backend URL
          if (tryNextBackendUrl()) {
            // Retry the request with the new URL
            const retryConfig = {
              ...error.config,
              baseURL: backendUrl
            };
            return axios(retryConfig);
          }
          
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
      // First try health endpoint
      console.log('🧪 Testing API connectivity...');
      testApiConnectivity();
    }, [backendUrl]);
    
    // Function to test API connectivity
    const testApiConnectivity = async () => {
      try {
        const response = await api.get('/health', { timeout: 5000 });
        if (response.status === 200) {
          console.log('✅ API health check passed');
          setIsOfflineMode(false);
          // If health check passes, fetch courses and user data
          fetchAllCourses();
          if (user) {
            fetchUserdata();
            fatchEnrolledCourse();
          }
        }
      } catch (error) {
        console.error('❌ API health check failed:', error.message);
        // Try the next URL
        tryNextBackendUrl();
      }
    };

    const fetchAllCourses = async () => {
        setIsLoading(true);
        try {
            setApiError(null);
            
            if (isOfflineMode) {
              console.log('⚠️ Using dummy course data in offline mode');
              setAllCourses(DUMMY_COURSES);
              setIsLoading(false);
              return;
            }
            
            console.log('📚 Fetching all courses...');
            const {data} = await api.get("/api/course/all");
            
            console.log('📚 Courses data:', data);
            if(data.success){
                setAllCourses(data.courses);
                console.log(`✅ Loaded ${data.courses.length} courses`);
            }
            else{
                toast.error(data.message || "Failed to fetch courses");
                // Fallback to dummy data
                console.log('⚠️ Using dummy course data as fallback');
                setAllCourses(DUMMY_COURSES);
            }
        } catch (error) {
            console.error("❌ Error fetching courses:", error);
            toast.error("Failed to fetch courses");
            
            // Fallback to dummy data
            console.log('⚠️ Using dummy course data as fallback');
            setAllCourses(DUMMY_COURSES);
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

    // calculate average rating with proper null checks
    const calculateRating = (course) => {
        // Handle case where course or courseRatings is undefined/null
        if (!course || !course.courseRatings || !Array.isArray(course.courseRatings)) {
            return 0;
        }

        if (course.courseRatings.length === 0) return 0;

        let totalRating = 0;

        course.courseRatings.forEach(rating => {
            totalRating += rating?.rating || 0;
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
            if (isOfflineMode) {
              console.log('⚠️ Using empty enrolled courses in offline mode');
              setEnrolledCourse([]);
              setIsLoading(false);
              return;
            }
            
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
                toast.error("Failed to fetch enrolled courses");
                setEnrolledCourse([]);
            }
        } catch (error) {
            console.error("❌ Error fetching enrolled courses:", error);
            toast.error("Failed to fetch enrolled courses");
            setEnrolledCourse([]);
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
        isLoading,
        isOfflineMode
    }
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}