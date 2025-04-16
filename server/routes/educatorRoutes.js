import express from 'express';
import { requireAuth } from "@clerk/express";
import {addCourse, educatorDeshboardData, getEducatorCourses, getEnrolledStudentData, updateRoleToEducator} from '../controllers/educatorContollers.js'
import upload from '../config/multer.js';
import { protectEducator } from '../middlewares/authMiddlewares.js';

const router = express.Router();

router.get('/update-role', requireAuth(), updateRoleToEducator);
router.post('/add-course',upload.single('image'),protectEducator,addCourse); 
router.get('/courses',protectEducator,getEducatorCourses);
router.get('/deshboard',protectEducator,educatorDeshboardData);
router.get('/enrolled-students',protectEducator,getEnrolledStudentData);

export default router;