import express from 'express'
import { addUserRating, getUserCourseProgress, getUserData, purchaseCourse, updateUserCourseProgress, userEnrolledCourse } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.get("/data",getUserData);
userRouter.get("/enrolled-courses",userEnrolledCourse)
userRouter.get("/purchase",purchaseCourse);
userRouter.get("/update-course-progress",updateUserCourseProgress)
userRouter.get("/get-course-progress",getUserCourseProgress)
userRouter.get('/add-rating',addUserRating);

export default userRouter;