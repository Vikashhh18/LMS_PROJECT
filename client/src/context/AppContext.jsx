import { createContext, useEffect, useState } from "react";
import { dummyCourses, dummyStudentEnrolled } from "../assets/assets";
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from '@clerk/clerk-react'


export const AppContext = createContext();

export const AppContextProvider = (props) => {
    const currency = import.meta.env.VITE_CURRENCY;

    const { getToken } = useAuth();
    const { user } = useUser();

    const [allCourses, setAllCourses] = useState([]);
    const [isEducator, setIsEducator] = useState(true);
    const [enrolledCourse, setEnrolledCourse] = useState([]);

    const fetchAllCourses = async () => {
        setAllCourses(dummyCourses);
    }
    // calculate average rating
    const calculateRating = (course) => {
        if (course.courseRatings.length === 0) return 0;

        let totalRating = 0;

        course.courseRatings.forEach(rating => {
            totalRating += rating.rating;
        });

        return totalRating / course.courseRatings.length;
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
    const fatchEnrolledCourse = () => {
        setEnrolledCourse(dummyCourses);
    }

    useEffect(() => {
        fetchAllCourses(),
            fatchEnrolledCourse()
    }
        , [])

    const logToken = async () => {
        console.log(await getToken());
    }

    useEffect(() => {
        if (user) {
            logToken();
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
        , calulateCourseDuration, enrolledCourse, fatchEnrolledCourse, updateRoleToEducator
    }
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}