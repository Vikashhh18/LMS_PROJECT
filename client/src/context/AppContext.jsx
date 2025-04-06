import { createContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from 'humanize-duration';

export const AppContext=createContext();

export const AppContextProvider=(props)=>{
    const currency=import.meta.env.VITE_CURRENCY;
    
    const [allCourses,setAllCourses]=useState([]);
    const [isEducator,setIsEducator]=useState(true);

    const fetchAllCourses=async()=>{
        setAllCourses(dummyCourses);
    }

    useEffect(()=>{fetchAllCourses()},[])

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
    const calculateTimeDuration=(chapter)=>{
        let time=0;
        chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration);

        return humanizeDuration(time*60*1000,{units:['h','m']});
    }

    // calculate course duration 
    const calulateCourseDuration=(course)=>{
        let time=0;
        course.courseContent.map((chapter)=>chapter.chapterContent.map((lecture)=>time+=lecture.lectureDuration));
        return  humanizeDuration(time*60*1000,{units:['h','m']});
    }

    // calculate no of lecture in course 
    const calulateNoOfLecture=(course)=>{
        let totalCourse=0;
        course.courseContent.forEach(chapter=>{
            if(Array.isArray(chapter.chapterContent)){
                totalCourse+=chapter.chapterContent.length;
            }
        });
        return totalCourse;
    }

    const value={
        currency,allCourses,calculateRating,isEducator,setIsEducator,calculateTimeDuration,calulateNoOfLecture
        ,calulateCourseDuration
    }
    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}