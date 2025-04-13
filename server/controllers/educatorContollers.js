import { getAuth } from '@clerk/express';

import { clerkClient } from '@clerk/clerk-sdk-node';
import Course from '../models/Course.js';
import {v2 as cloudinary} from 'cloudinary';
import { Purchase } from '../models/Purchase.js';

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
      publicMetadata: {
        role: 'educator'
      }
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
    return res.json({sucess:true,courses:courses});
  } catch (error) {
    res.json({sucess:false,message:"something went wrong   "+error.message});
  }
}

// get educator deshboard(earing,no of students ,no of courses)

export const educatorDeshboardData=async(req,res)=>{
  try {
    const educator=req.auth.userId;
    const courses=await Course.find({educator});
    const totalCourse=courses.length;

    const courseIds=courses.map(course=>course._id);

    // calculate total earning of coureses 
    const purchases=await Purchase.find({
      courseId:{$in:courseIds},
      status:'completed'
    })

    const totalEarnings=purchases.reduce((sum,purchase)=>sum+purchase.amount,0);

    // collect unique enrolled student ids with there courses titles 
    const enrolledStudent=[];
    for(const course of courses){
      const students=await User.find({
        _id:{$in:course.enrolledStudent}
      },'name imageUrl');

      students.forEach(student => {
        enrolledStudent.push({
          courseTitle:course.courseTitle,
          student
        });
      });
    }
    res.json({success:true,deshBoardData:totalEarnings,enrolledStudent,totalCourse});
  } catch (error) {
    res.json({success:false,message:error.message});
  }
}

export const getEnrolledStudentData=async(req,res)=>{
  try {
    const educator=req.auth.userId;
    const courses=await Course.find({educator});
    const courseIds=courses.map(course=>course._id);
    const purchase=await Purchase.find({
      courseId:{$in:courseIds},
      status:'completed'
    }).populate('userId','name imageUrl').populate('courseId','courseTitle');

    const enrolledStudent=purchase.map(purchase=>({
      student:purchase.userId,
      courseTitle:purchase.courseId.courseTitle,
      purchaseDate:purchase.createdAt
    }));

    res.json({sucess:true,enrolledStudent})
    
  } catch (error) {
    res.json({success:false,message:error.message})
  }
}