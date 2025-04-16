import { getAuth } from '@clerk/express';

import { clerkClient } from '@clerk/clerk-sdk-node';
import Course from '../models/Course.js';
import {v2 as cloudinary} from 'cloudinary';
import User from '../models/user.js';
import Enrollment from '../models/enrollmentModel.js';
import fs from 'fs';
import path from 'path';
import { Purchase } from '../models/PurchaseModel.js';

export const updateRoleToEducator = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    console.log("User ID from Clerk auth:", userId); 

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. No userId found.",
      });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'educator' }
    });

    res.status(200).json({
      success: true,
      message: "User role updated to educator",
    });
  } catch (error) {
    console.error("❌ Error in updateRoleToEducator:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// add new Courses

export const addCourse=async(req,res)=>{
  try {
    const {courseData}=req.body;
    const imageFile=req.file;
    const educatorId=req.auth.userId;

    if(!imageFile){
      return res.json({success:false,message:"thumbnail is not attached!"});
    }

    const parsedCourseData=await JSON.parse(courseData);
    parsedCourseData.educator=educatorId;
    const newCourse=await Course.create(parsedCourseData);
    const imageUpload=await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail=imageUpload.secure_url;
    await newCourse.save();

    res.json({success:true,message:"new course be added"});

  } catch (error) {
    res.json({success:false,message:error.message})
  }
}

//get eductor courses

export const getEducatorCourses=async(req,res)=>{
  try {
    const educator=req.auth.userId;
    const courses=await Course.find({educator});
    console.log(courses);
    return res.json({success:true, courses});
  } catch (error) {
    res.json({success:false, message:"Something went wrong: " + error.message});
  }
}

// get educator deshboard(earing,no of students ,no of courses)

export const educatorDeshboardData = async (req, res) => {
  try {
    console.log('📊 Fetching educator dashboard data');
    const educator = req.auth.userId;
    
    // Find all courses by this educator
    const courses = await Course.find({ educator });
    const totalCourse = courses.length;
    console.log(`Found ${totalCourse} courses for educator ${educator}`);

    if (totalCourse === 0) {
      return res.json({
        success: true, 
        dashboardData: {
          totalEarnings: 0,
          enrolledStudents: [],
          totalCourse: 0
        }
      });
    }

    const courseIds = courses.map(course => course._id);
    console.log('Course IDs:', courseIds);

    // Get completed purchases for these courses
    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed'
    });
    console.log(`Found ${purchases.length} completed purchases`);

    // Calculate total earnings from purchases
    let totalEarnings = 0;
    if (purchases.length > 0) {
      totalEarnings = purchases.reduce((sum, purchase) => {
        const amount = Number(purchase.amount) || 0;
        return sum + amount;
      }, 0);
    }
    
    // Also check successful enrollments for any additional earnings
    const enrollments = await Enrollment.find({
      courseId: { $in: courseIds },
      status: 'success'
    });
    console.log(`Found ${enrollments.length} successful enrollments`);
    
    // Add earnings from enrollments that may not be in purchases
    if (enrollments.length > 0) {
      for (const enrollment of enrollments) {
        if (enrollment.amount && Number(enrollment.amount) > 0) {
          // Check if this enrollment is already counted in purchases
          const isPurchaseExists = purchases.some(p => 
            p.courseId.toString() === enrollment.courseId.toString() && 
            p.userId === enrollment.userId
          );
          
          if (!isPurchaseExists) {
            totalEarnings += Number(enrollment.amount);
          }
        }
      }
    }
    
    console.log(`Total earnings calculated: ${totalEarnings}`);

    // Get enrollments from Enrollment collection
    const enrolledStudents = [];
    const processedStudents = new Set();

    // First add students from the courses' enrolledStudent arrays
    for (const course of courses) {
      if (!course.enrolledStudent || course.enrolledStudent.length === 0) continue;
      
      try {
        const students = await User.find({
          _id: { $in: course.enrolledStudent }
        }, 'name imageUrl');

        students.forEach(student => {
          const key = `${student._id}-${course._id}`;
          if (!processedStudents.has(key)) {
            enrolledStudents.push({
              courseTitle: course.courseTitle,
              student: {
                _id: student._id,
                name: student.name || 'Student',
                imageUrl: student.imageUrl
              }
            });
            processedStudents.add(key);
          }
        });
      } catch (err) {
        console.error(`Error fetching students for course ${course._id}:`, err);
      }
    }

    // Then add students from the Enrollment collection
    for (const enrollment of enrollments) {
      try {
        if (!enrollment.userId) continue;
        
        const student = await User.findById(enrollment.userId, 'name imageUrl');
        const course = courses.find(c => c._id.toString() === enrollment.courseId.toString());
        
        if (student && course) {
          const key = `${student._id}-${course._id}`;
          if (!processedStudents.has(key)) {
            enrolledStudents.push({
              courseTitle: course.courseTitle,
              student: {
                _id: student._id,
                name: student.name || 'Student',
                imageUrl: student.imageUrl
              }
            });
            processedStudents.add(key);
          }
        }
      } catch (err) {
        console.error(`Error processing enrollment ${enrollment._id}:`, err);
      }
    }

    console.log(`Total unique enrolled students: ${enrolledStudents.length}`);

    res.json({
      success: true, 
      dashboardData: {
        totalEarnings,
        enrolledStudents,
        totalCourse
      }
    });
  } catch (error) {
    console.error("Error in educatorDeshboardData:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrolledStudentData = async (req, res) => {
  try {
    console.log('📊 Fetching enrolled student data');
    const educator = req.auth.userId;
    
    // Find all courses by this educator
    const courses = await Course.find({ educator });
    if (courses.length === 0) {
      return res.json({ success: true, enrolledStudents: [] });
    }
    
    const courseIds = courses.map(course => course._id);
    console.log(`Found ${courses.length} courses for educator ${educator}`);
    
    // Get data from both Purchase and Enrollment collections
    const [purchases, enrollments] = await Promise.all([
      Purchase.find({
        courseId: { $in: courseIds },
        status: 'completed'
      }).populate('userId', 'name imageUrl').populate('courseId', 'courseTitle'),
      
      Enrollment.find({
        courseId: { $in: courseIds },
        status: 'success'
      })
    ]);
    
    console.log(`Found ${purchases.length} purchases and ${enrollments.length} enrollments`);
    
    // Process purchases
    const enrolledStudents = [];
    const processedStudents = new Set(); // Track already processed student+course combinations
    
    // Add students from purchases
    for (const purchase of purchases) {
      try {
        if (!purchase.userId || !purchase.courseId) continue;
        
        const key = `${purchase.userId._id}-${purchase.courseId._id}`;
        if (!processedStudents.has(key)) {
          enrolledStudents.push({
            student: purchase.userId,
            courseTitle: purchase.courseId.courseTitle,
            purchaseDate: purchase.createdAt
          });
          processedStudents.add(key);
        }
      } catch (err) {
        console.error(`Error processing purchase ${purchase._id}:`, err);
      }
    }
    
    // Add students from enrollments
    for (const enrollment of enrollments) {
      try {
        if (!enrollment.userId || !enrollment.courseId) continue;
        
        const key = `${enrollment.userId}-${enrollment.courseId}`;
        if (!processedStudents.has(key)) {
          // We need to get the user and course info
          const [user, course] = await Promise.all([
            User.findById(enrollment.userId, 'name imageUrl'),
            Course.findById(enrollment.courseId, 'courseTitle')
          ]);
          
          if (user && course) {
            enrolledStudents.push({
              student: user,
              courseTitle: course.courseTitle,
              purchaseDate: enrollment.createdAt
            });
            processedStudents.add(key);
          }
        }
      } catch (err) {
        console.error(`Error processing enrollment ${enrollment._id}:`, err);
      }
    }
    
    console.log(`Returning ${enrolledStudents.length} enrolled students`);
    res.json({ success: true, enrolledStudents });
    
  } catch (error) {
    console.error("Error in getEnrolledStudentData:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};