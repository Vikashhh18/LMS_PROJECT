import Stripe from "stripe";
import Course from "../models/Course.js";
import { Purchase } from "../models/purchase.js";
import User from "../models/user.js";


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

export const userEnrolledCourse=async(req,res)=>{
    try {
        const userId=req.auth.userId;
        const userData= await User.find({userId}).populate('enrolledCourses');
        // const userData = await User.findById(userId).populate('enrolledStudent');

        res.json({sucess:true,EnrolledCourse:userData.enrolledCourses});
    } catch (error) {
        res.json({sucess:false,message:error.message});
    }
}

export const purchaseCourse=async(req,res)=>{
  try {
    const {courseId}=req.body;
    const{origin}=req.headers
    const userId=req.auth.userId;
    const userData=await User.findById(userId);
    const courseData=await Course.findById(courseId);

    if(!courseData ||!userData){
      return res.json({sucess:false,message:"data not found!"});
    }

    const purchaseData={
      courseId:courseData._id,
      userId,
      amount:(courseData.coursePrice-courseData.discount*courseData.coursePrice/100).toFixed(2),
    }
    const newPurchase=await Purchase.create(purchaseData);

    // Stripe payment getway
    const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency=process.env.CURRENCY;

    const line_items = [
      {
        price_data: {
          currency: currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(newPurchase.amount * 100), 
        },
        quantity: 1, 
      }
    ];
    
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
      }
    });
    
    res.json({sucess:true,session_url:session.url})

  } catch (error) {
    res.json({success:false,message:error.message});
  }
}