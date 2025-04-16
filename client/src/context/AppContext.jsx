import { createContext, useEffect, useState } from "react";
import { dummyCourses, dummyStudentEnrolled } from "../assets/assets";
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from '@clerk/clerk-react'
import axios from 'axios'
import { toast } from "react-toastify";

export const AppContext = createContext();

export const AppContextProvider = (props) => {

    const currency = import.meta.env.VITE_CURRENCY;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState([]);
    const [userData,setUserData]=useState(null);

    const fetchAllCourses = async () => {
        // setAllCourses(dummyCourses);
        try {
            const {data}=await axios.get(backendUrl+"/api/course/all");
            // console.log(data)    
            if(data.success){
                setAllCourses(data.courses);
            }
            else{
                toast.error(data.messagse);
            }
        } catch (error) {
            toast.error(error.messagse);    
        }
    }

    const fetchUserdata=async()=>{
        if(user.publicMetadata.role==='educator')setIsEducator(true);
        try {
            const token=await getToken();
            const {data}=await axios.get(backendUrl+"/api/user/data",{headers:{Authorization:`Bearer ${token}`}});
            if(data.success){
                setUserData(data.user);
            }
            else toast.error(data.messagse);
        } catch (error) {
            toast.error(error.messagse);
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
            const { data } = await axios.get(
                `${backendUrl}/api/user/enrolled-courses`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log("Enrolled courses response:", data);
            
            if (data.success) {
                setEnrolledCourse(data.enrolledCourses || []);
            } else {
                toast.error(data.message || "Failed to fetch enrolled courses");
            }
        } catch (error) {
            console.error("Error fetching enrolled courses:", error);
            toast.error(error.message || "Failed to fetch enrolled courses");
        }
    }

    useEffect(() => {
        fetchAllCourses()
    }, [])
    
    useEffect(() => {
        if (user) {
            fetchUserdata();
            fatchEnrolledCourse()
        }
    }, [user])

    const updateRoleToEducator = async () => {
        try {
            const token = await getToken();

            if (!token) {
                console.error("❌ No Clerk token found");
                return;
            }

            const res = await fetch('http://localhost:3001/api/educator/update-role', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            console.log("✅ Role updated:", data);

            if (data.success) {
                setIsEducator(true);
            }
        } catch (error) {
            console.error("❌ Error calling update-role:", error);
        }
    };


    const value = {
        currency, allCourses, calculateRating, isEducator, setIsEducator, calculateTimeDuration, calulateNoOfLecture
        , calulateCourseDuration, enrolledCourse, fatchEnrolledCourse, updateRoleToEducator,backendUrl,userData,setUserData,getToken,fetchAllCourses
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}