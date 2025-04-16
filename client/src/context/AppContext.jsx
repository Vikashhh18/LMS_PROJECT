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
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 
                     (window.location.hostname === 'localhost' ? 
                      'http://localhost:5000' : 
                      'https://lms-backend.onrender.com');
    
    // Log backend URL for debugging
    console.log('Using backend URL:', backendUrl);

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState([]);
    const [userData,setUserData]=useState(null);
    const [apiError, setApiError] = useState(null);

    // Create an axios instance with default config
    const api = axios.create({
      baseURL: backendUrl,
      timeout: 10000
    });
    
    // Add response interceptor for error handling
    api.interceptors.response.use(
      response => response,
      error => {
        // Handle network errors
        if (!error.response) {
          setApiError("Network error: Please check your connection");
          toast.error("Network error: Please check your connection");
          console.error("Network error:", error);
        } else {
          console.error("API error:", error.response.data);
        }
        return Promise.reject(error);
      }
    );

    const fetchAllCourses = async () => {
        try {
            setApiError(null);
            const {data} = await api.get("/api/course/all");
            
            if(data.success){
                setAllCourses(data.courses);
            }
            else{
                toast.error(data.message || "Failed to fetch courses");
            }
        } catch (error) {
            console.error("Error fetching courses:", error);
            toast.error(error.response?.data?.message || "Failed to fetch courses");
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
        try {
            const token = await getToken();
            const { data } = await api.get("/api/user/enrolled-courses", {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (data.success) {
                setEnrolledCourse(data.enrolledCourses || []);
            } else {
                toast.error(data.message || "Failed to fetch enrolled courses");
            }
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            toast.error(error.response?.data?.message || "Failed to fetch enrolled courses");
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
        apiError
    }
    
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}