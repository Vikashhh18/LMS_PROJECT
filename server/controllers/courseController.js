import Course from "../models/Course.js";
import { Purchase } from "../models/purchase.js";
import Enrollment from "../models/enrollmentModel.js";
import User from "../models/user.js";

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

export const deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const educatorId = req.auth.userId;
    
    console.log('🗑️ Request to delete course:', courseId);
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    
    // Check if user is the educator who created the course
    if (course.educator !== educatorId) {
      return res.status(403).json({ success: false, message: "You are not authorized to delete this course" });
    }
    
    // Clean up related records
    console.log('🧹 Cleaning up enrollments and purchases for course:', courseId);
    
    // 1. Delete all enrollments for this course
    const deletedEnrollments = await Enrollment.deleteMany({ courseId });
    console.log(`🧹 Deleted ${deletedEnrollments.deletedCount} enrollments`);
    
    // 2. Delete all purchases for this course
    const deletedPurchases = await Purchase.deleteMany({ courseId });
    console.log(`🧹 Deleted ${deletedPurchases.deletedCount} purchases`);
    
    // 3. Remove course from users' enrolledCourses arrays
    const usersUpdated = await User.updateMany(
      { enrolledCourses: courseId },
      { $pull: { enrolledCourses: courseId } }
    );
    console.log(`🧹 Removed course from ${usersUpdated.modifiedCount} users' enrolled courses`);
    
    // Finally, delete the course
    await Course.findByIdAndDelete(courseId);
    console.log('✅ Course deleted successfully');
    
    return res.json({ 
      success: true, 
      message: "Course and all related enrollments deleted successfully"
    });
  } catch (error) {
    console.error('❌ Error deleting course:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

