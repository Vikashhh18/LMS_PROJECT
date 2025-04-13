import { User } from "@clerk/express";
import Course from "../models/Course.js";
import { Purchase } from "../models/purchase.js";

export const getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find({ courseIsPublished: true }) // corrected field name
      .select(['-courseContent', '-enrolledStudent']) // also fixed field name
      .populate({ path: "educator" });

    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getCourseId = async (req, res) => {
  const { id } = req.params;

  try {
    const courseData = await Course.findById(id).populate({ path: 'educator' });

    if (!courseData) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    courseData.courseContent.forEach(chapter => {
      chapter.chapterContent.forEach(lecture => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = ""; // hide URL
        }
      });
    });

    res.json({ success: true, courseData });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

