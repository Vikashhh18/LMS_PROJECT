import Stripe from "stripe";
import Course from "../models/Course.js";
import { Purchase } from "../models/PurchaseModel.js";
import User from "../models/user.js";
import { CourseProgress } from "../models/courseProgess.js";
import Enrollment from '../models/enrollmentModel.js'


export const getUserData = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const userEnrolledCourse = async (req, res) => {
  try {
    const userId = req.auth.userId;
    console.log('🔍 Fetching enrolled courses for user:', userId);

    // First method: Check enrollments with success status
    const enrollments = await Enrollment.find({ userId, status: "success" })
      .populate("courseId");

    console.log('📋 Enrollments found:', enrollments.length);

    // Second method: Check if user directly has courses in enrolledCourses array
    const user = await User.findById(userId);
    if (!user) {
      console.error('❌ User not found:', userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log('👤 User found:', user._id);
    console.log('📚 User enrolledCourses length:', user.enrolledCourses ? user.enrolledCourses.length : 0);

    // Populate user's enrolled courses
    let populatedUserCourses = [];
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      try {
        const userWithCourses = await User.findById(userId).populate("enrolledCourses");
        populatedUserCourses = userWithCourses.enrolledCourses || [];
      } catch (err) {
        console.error('❌ Error populating user courses:', err.message);
      }
    }

    // Combine results from both methods (avoiding duplicates)
    let enrolledCourses = [];

    // Add courses from enrollments that actually exist
    if (enrollments && enrollments.length > 0) {
      enrollments.forEach(enrollment => {
        if (enrollment.courseId && enrollment.courseId._id) {
          enrolledCourses.push(enrollment.courseId);
          console.log('➕ Added course from enrollment:', enrollment.courseId._id);
        } else {
          console.log('⚠️ Enrollment references a course that no longer exists:', enrollment._id);
        }
      });
    }

    // Add courses from user.enrolledCourses (if they exist and are not already included)
    if (populatedUserCourses && populatedUserCourses.length > 0) {
      const courseIds = enrolledCourses.map(course => course._id.toString());

      populatedUserCourses.forEach(course => {
        if (course && course._id && !courseIds.includes(course._id.toString())) {
          enrolledCourses.push(course);
          console.log('➕ Added course from user enrolledCourses:', course._id);
        }
      });
    }

    // Clean up any stale references in user's enrolledCourses array
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      const validCourseIds = new Set();
      for (const courseId of user.enrolledCourses) {
        // Check if course still exists
        const exists = await Course.exists({ _id: courseId });
        if (exists) {
          validCourseIds.add(courseId.toString());
        } else {
          console.log('🧹 Removing reference to deleted course:', courseId);
        }
      }

      // Update the user's enrolledCourses to include only valid courses
      const validCoursesArray = Array.from(validCourseIds).map(id => id.toString());
      if (validCoursesArray.length !== user.enrolledCourses.length) {
        user.enrolledCourses = validCoursesArray;
        await user.save();
        console.log('✅ Updated user enrolledCourses to remove deleted courses');
      }
    }

    // Also clean up stale enrollments
    const staleEnrollments = enrollments.filter(e => !e.courseId || !e.courseId._id);
    if (staleEnrollments.length > 0) {
      for (const enrollment of staleEnrollments) {
        await Enrollment.findByIdAndDelete(enrollment._id);
        console.log('🧹 Deleted stale enrollment:', enrollment._id);
      }
    }

    // Filter out any undefined or null courses
    enrolledCourses = enrolledCourses.filter(course => {
      return course && course._id && course.courseTitle;
    });

    console.log('📊 Filtered valid courses:', enrolledCourses.length);

    // Fetch progress data for each course
    const coursesWithProgress = await Promise.all(
      enrolledCourses.map(async (course) => {
        // Calculate total lecture count for the course
        let totalLectureCount = 0;
        if (course.courseContent && Array.isArray(course.courseContent)) {
          for (const chapter of course.courseContent) {
            if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
              totalLectureCount += chapter.chapterContent.length;
            }
          }
        }

        // Get progress data for this course
        const progressData = await CourseProgress.findOne({
          userId,
          courseId: course._id
        });

        // Calculate progress percentage
        const completedLectures = progressData?.lectureCompleted?.length || 0;
        const progressPercentage = totalLectureCount > 0
          ? Math.round((completedLectures / totalLectureCount) * 100)
          : 0;

        // A course is only completed if ALL lectures have been completed
        const isCompleted = totalLectureCount > 0 && completedLectures === totalLectureCount;

        console.log(`Course ${course._id}: ${completedLectures}/${totalLectureCount} lectures completed (${progressPercentage}%)`);

        // Add progress data to the course object
        return {
          ...course.toObject(),
          progress: {
            totalLectures: totalLectureCount,
            completedLectures: completedLectures,
            percentage: progressPercentage,
            isCompleted: isCompleted,
            lectureIds: progressData?.lectureCompleted || []
          }
        };
      })
    );

    // For debugging, let's see if user has courses in enrolledCourses array
    if (user.enrolledCourses && user.enrolledCourses.length > 0) {
      console.log(`User has ${user.enrolledCourses.length} courses in enrolledCourses array`);
    }

    // Get courses where user appears in the course's enrolledStudent array
    const coursesWhereUserIsEnrolled = await Course.find({
      'enrolledStudent': userId
    });

    if (coursesWhereUserIsEnrolled.length > 0) {
      console.log(`Found ${coursesWhereUserIsEnrolled.length} courses where user is in enrolledStudent array`);
    }

    res.json({
      success: true,
      enrolledCourses: coursesWithProgress,
      message: coursesWithProgress.length > 0 ?
        `${coursesWithProgress.length} enrolled courses found` :
        'No enrolled courses found'
    });
  } catch (error) {
    console.error("❌ Error in userEnrolledCourse:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const purchaseCourse = async (req, res) => {
  try {
    console.log("💳 Purchase request received:", req.body);
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    if (!courseId) {
      console.error("❌ Course ID is missing in request");
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    // Fetch user and course data
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!courseData || !userData) {
      console.error("❌ Course or user data not found");
      return res.json({ success: false, message: "Data not found!" });
    }

    // Check if user already enrolled in this course
    if (userData.enrolledCourses && userData.enrolledCourses.includes(courseData._id)) {
      console.log("⚠️ User already enrolled in this course");
      return res.json({
        success: false,
        message: "You are already enrolled in this course",
        redirect: "/my-enrollement"
      });
    }

    // Calculate discounted amount
    const amount = (courseData.coursePrice - (courseData.discount * courseData.coursePrice / 100)).toFixed(2);
    console.log(`💲 Course price: ${courseData.coursePrice}, Discount: ${courseData.discount}%, Final amount: ${amount}`);

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount,
    };

    // 1️⃣ Create Purchase
    const newPurchase = await Purchase.create(purchaseData);
    console.log("📝 Purchase record created:", newPurchase._id.toString());

    // 2️⃣ Create Enrollment with 'pending' status
    const newEnrollment = await Enrollment.create({
      userId,
      courseId: courseData._id,
      amount,
      status: "pending",
    });
    console.log("📝 Enrollment record created:", newEnrollment._id.toString());

    // 3️⃣ Setup Stripe Checkout
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY || 'USD';

    const line_items = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: courseData.courseTitle,
            description: `Enrollment for ${courseData.courseTitle}`,
            images: courseData.courseThumbnail ? [courseData.courseThumbnail] : [],
          },
          unit_amount: Math.floor(amount * 100), // Convert to cents
        },
        quantity: 1,
      },
    ];

    // Validate origin
    const validatedOrigin = origin || 'http://localhost:5173';
    console.log("🔗 Origin for redirect URLs:", validatedOrigin);

    const session = await stripeInstance.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${validatedOrigin}/my-enrollement?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${validatedOrigin}/courses?canceled=true`,
      line_items: line_items,
      customer_email: userData.email,
      client_reference_id: userId,
      metadata: {
        purchaseId: newPurchase._id.toString(),
        courseId: courseData._id.toString(),
        userId: userId
      },
    });

    console.log("✅ Stripe session created:", session.id);
    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error("❌ Error in purchaseCourse:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const completeEnrollment = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, purchaseId } = req.body;

    console.log('🔄 Manual enrollment request:', { userId, courseId, purchaseId });

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update purchase status if purchaseId is provided
    if (purchaseId) {
      const purchase = await Purchase.findById(purchaseId);
      if (purchase) {
        purchase.status = 'completed';
        await purchase.save();
        console.log('✅ Purchase status updated to completed');
      }
    }

    // Find and update enrollment
    const enrollment = await Enrollment.findOneAndUpdate(
      { userId, courseId },
      { status: 'success' },
      { new: true }
    );

    if (enrollment) {
      console.log('✅ Enrollment updated to success');
    } else {
      // Create a new enrollment if none exists
      const newEnrollment = await Enrollment.create({
        userId,
        courseId,
        status: 'success'
      });
      console.log('✅ New enrollment created with success status');
    }

    // Update the course to include this student
    if (!course.enrolledStudent.includes(userId)) {
      course.enrolledStudent.push(userId);
      await course.save();
      console.log(`Added user ${userId} to course.enrolledStudent array`);
    }

    // Add course to user's enrolled courses if not already there
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
      await user.save();
      console.log('✅ Course added to user\'s enrolled courses');
    }

    return res.json({
      success: true,
      message: "Enrollment completed successfully",
      redirectTo: "/my-enrollement"
    });

  } catch (error) {
    console.error('❌ Error in completeEnrollment:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    // Accept both courseId and course_id for backward compatibility
    const courseId = req.body.courseId || req.body.course_id;
    const { lectureId } = req.body;

    console.log('🔄 Updating course progress:', { userId, courseId, lectureId });

    if (!courseId || !lectureId) {
      return res.status(400).json({ success: false, message: 'Missing required fields (courseId, lectureId)' });
    }

    // Validate the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Count total lectures in the course
    let totalLectureCount = 0;
    // Validate the lecture exists in course
    let lectureExists = false;
    for (const chapter of course.courseContent) {
      if (chapter.chapterContent && Array.isArray(chapter.chapterContent)) {
        totalLectureCount += chapter.chapterContent.length;
        for (const lecture of chapter.chapterContent) {
          if (lecture.lectureId === lectureId) {
            lectureExists = true;
          }
        }
      }
    }

    if (!lectureExists) {
      return res.status(404).json({ success: false, message: 'Lecture not found in this course' });
    }

    // Find existing progress or create new one
    let progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      // Don't duplicate lecture IDs
      if (progressData.lectureCompleted.includes(lectureId)) {
        const completedCount = progressData.lectureCompleted.length;
        const isCompleted = completedCount === totalLectureCount;

        // Update the completed status if needed
        if (progressData.completed !== isCompleted) {
          progressData.completed = isCompleted;
          await progressData.save();
        }

        return res.json({
          success: true,
          message: 'Lecture already completed',
          progressData,
          completedCount,
          totalLectureCount,
          isCompleted
        });
      }

      // Add new lecture ID to completed list
      progressData.lectureCompleted.push(lectureId);

      // Check if all lectures are now completed
      const completedCount = progressData.lectureCompleted.length;
      const isCompleted = completedCount === totalLectureCount;

      // Update the completion status
      progressData.completed = isCompleted;

      await progressData.save();
      console.log('✅ Added lecture to existing progress record');
      console.log(`Completed ${completedCount}/${totalLectureCount} lectures (${isCompleted ? 'Course completed!' : 'In progress'})`);
    } else {
      // Create new progress record
      const isCompleted = totalLectureCount === 1; // Only completed if this is the only lecture

      progressData = await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
        completed: isCompleted
      });
      console.log('✅ Created new progress record');
      console.log(`Completed 1/${totalLectureCount} lectures (${isCompleted ? 'Course completed!' : 'In progress'})`);
    }

    // Calculate completion percentage
    const completedCount = progressData.lectureCompleted.length;
    const progressPercentage = Math.round((completedCount / totalLectureCount) * 100);

    res.json({
      success: true,
      message: 'Progress updated',
      progressData,
      completedCount,
      totalLectureCount,
      percentage: progressPercentage,
      isCompleted: progressData.completed
    });
  } catch (error) {
    console.error('❌ Error updating course progress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    // Accept both courseId and course_id for backward compatibility
    const courseId = req.body.courseId || req.body.course_id || req.query.courseId || req.query.course_id;

    console.log('🔍 Getting course progress:', { userId, courseId });

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({
      success: true,
      progressData: progressData || { userId, courseId, lectureCompleted: [] }
    });
  } catch (error) {
    console.error('❌ Error getting course progress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addUserRating = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // Validate inputs
    if (!courseId || !rating || isNaN(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Invalid rating details. Rating must be between 1-5.' });
    }

    // Find the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Verify the user has enrolled in this course
    const enrollment = await Enrollment.findOne({
      userId: userId,
      courseId: courseId,
      status: 'success'
    });

    if (!enrollment) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to rate it' });
    }

    // Check if user has already rated this course
    const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

    if (existingRatingIndex > -1) {
      // Update existing rating
      course.courseRatings[existingRatingIndex].rating = rating;
      console.log(`Updated rating for user ${userId} on course ${courseId} to ${rating}`);
    } else {
      // Add new rating
      course.courseRatings.push({ userId, rating });
      console.log(`Added new rating for user ${userId} on course ${courseId}: ${rating}`);
    }

    await course.save();
    res.json({ success: true, message: 'Rating added successfully' });

  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({ success: false, message: error.message });
  }
}

export const getUserCourse = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.params;

    console.log('🔍 Getting course details for user:', userId, 'course:', courseId);

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required" });
    }

    // Get the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify the user is enrolled in this course through one of these methods:
    // 1. Check enrollments
    const enrollment = await Enrollment.findOne({
      userId,
      courseId,
      status: 'success'
    });

    // 2. Check if user has this course in their enrolledCourses
    const user = await User.findById(userId);
    const isInUserCourses = user && user.enrolledCourses &&
      user.enrolledCourses.some(c => c.toString() === courseId);

    // 3. Check if user is in course's enrolledStudent
    const isInCourseStudents = course.enrolledStudent &&
      course.enrolledStudent.some(s => s.toString() === userId);

    // If the user is not enrolled through any method, check if they're the educator
    const isEducator = course.educator && course.educator.toString() === userId;

    if (!enrollment && !isInUserCourses && !isInCourseStudents && !isEducator) {
      return res.status(403).json({
        success: false,
        message: "You don't have access to this course"
      });
    }

    // Return the course
    res.json({ success: true, course });

  } catch (error) {
    console.error("❌ Error in getUserCourse:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};