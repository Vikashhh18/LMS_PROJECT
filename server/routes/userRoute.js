import express from 'express'
import { getUserData, purchaseCourse, userEnrolledCourse } from '../controllers/userController.js';

const userRouter=express.Router();

userRouter.get("/data",getUserData);
userRouter.get("/enrolled-courses",userEnrolledCourse)
userRouter.get("/purchase",purchaseCourse)

export default userRouter;