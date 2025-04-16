import express from 'express'
import { getAllCourse, getCourseId, deleteCourse } from '../controllers/courseController.js';

const courseRouter=express.Router();

courseRouter.get("/all",getAllCourse);
courseRouter.get("/:id",getCourseId);
courseRouter.delete("/:courseId", deleteCourse);

export default courseRouter;