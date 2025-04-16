import express from 'express'
import { addUserRating, completeEnrollment, getUserCourse, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourse } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.get("/data",getUserData);
userRouter.get("/enrolled-courses",userEnrolledCourse);
userRouter.get("/course/:courseId", getUserCourse);
userRouter.post("/purchase",purchaseCourse);
userRouter.post("/complete-enrollment", completeEnrollment);
userRouter.post("/update-course-progress",updateUserCourseProgress);
userRouter.get("/get-course-progress",getUserCourseProgress);
userRouter.post('/add-rating',addUserRating);

export default userRouter;