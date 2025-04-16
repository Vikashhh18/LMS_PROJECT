// import { Webhook } from "svix";
// import User from "../models/user.js";
// import Stripe from "stripe";
// import { Purchase } from "../models/Purchase.js";
// import Course from "../models/Course.js";

// export const clerkWebHook = async (req, res) => {
//   try {
//     const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
//     await whook.verify(
//       JSON.stringify(req.body),
//       {
//         "svix-id": req.headers["svix-id"],
//         "svix-timestamp": req.headers["svix-timestamp"],
//         "svix-signature": req.headers["svix-signature"],
//       }
//     );

//     const { data, type } = req.body;

//     switch (type) {
//       case "user.created": {
//         const userData = {
//           _id: data.id,
//           email: data.email_addresses[0].email_address,
//           name: data.first_name + " " + data.last_name,
//           imageUrl: data.image_url, 
//         };
//         await User.create(userData);
//         res.json({});
//         break;
//       }
//       case "user.updated": {
//         const userData = {
//           email: data.email_addresses[0].email_address,
//           name: data.first_name + " " + data.last_name,
//           imageUrl: data.image_url, // ✅ fixed here too
//         };
//         await User.findByIdAndUpdate(data.id, userData);
//         res.json({});
//         break;
//       }
//       case "user.deleted": {
//         await User.findByIdAndDelete(data.id);
//         res.json({});
//         break;
//       }
//       default:
//         res.status(200).json({}); // graceful fallback
//     }
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const stripeInstance=new Stripe(process.env.STRIPE_SECRET_KEY);

// export const stripeWebhook = async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
//   let event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);

//     // Handle successful payment
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
//       const { purchaseId } = session.metadata; // Assuming you saved the purchaseId in metadata during session creation

//       // Find the corresponding purchase data
//       const purchase = await Purchase.findById(purchaseId);

//       if (purchase && purchase.status === 'pending') {
//         // Update the purchase status to completed
//         purchase.status = 'completed';
//         await purchase.save();

//         // Enroll the user in the course
//         const course = await Course.findById(purchase.courseId);
//         const user = await User.findById(purchase.userId);

//         if (course && user) {
//           // Add user to the course's enrolled students
//           course.enrolledStudents.push(user._id);
//           await course.save();

//           // Optionally, track this course in user's purchased courses
//           user.enrolledCourses.push(course._id);
//           await user.save();
//         }
//       }
//     }

//     res.status(200).send('Webhook handled successfully');
//   } catch (err) {
//     console.error('Error in Stripe webhook', err);
//     res.status(400).send(`Webhook error: ${err.message}`);
//   }
// };

import { Webhook } from "svix";
import User from "../models/user.js";
import Stripe from "stripe";
import { Purchase } from "../models/purchase.js";
import Course from "../models/Course.js";
import Enrollment from "../models/enrollmentModel.js";

export const clerkWebHook = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(
      JSON.stringify(req.body),
      {
        "svix-id": req.headers["svix-id"],
        "svix-timestamp": req.headers["svix-timestamp"],
        "svix-signature": req.headers["svix-signature"],
      }
    );

    const { data, type } = req.body;

    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url, 
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case "user.updated": {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + " " + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }
      case "user.deleted": {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        res.status(200).json({}); // graceful fallback
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhook = async (req, res) => {
  console.log('⚡ Stripe webhook called!');
  
  let event;
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // Log headers for debugging
  console.log('Headers:', JSON.stringify(req.headers));
  
  try {
    if (!endpointSecret) {
      console.error('⚠️ Stripe webhook secret is missing in environment variables!');
      return res.status(400).send('Webhook secret is missing');
    }

    if (!sig) {
      console.error('⚠️ Stripe signature is missing in request headers!');
      return res.status(400).send('Stripe signature is missing');
    }
    
    // Verify webhook signature
    try {
      event = stripeInstance.webhooks.constructEvent(
        req.body,
        sig,
        endpointSecret
      );
      console.log('✅ Stripe event verified:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      console.log('💰 Payment successful, session:', session.id);
      
      // Extract purchaseId from metadata
      const purchaseId = session.metadata.purchaseId;
      if (!purchaseId) {
        console.error('❌ No purchaseId found in session metadata');
        return res.status(400).send('Missing purchaseId in session metadata');
      }
      
      console.log('📦 Processing purchase:', purchaseId);
      
      try {
        // Find the purchase record
        const purchase = await Purchase.findById(purchaseId);
        if (!purchase) {
          console.error(`❌ Purchase with ID ${purchaseId} not found!`);
          return res.status(404).send(`Purchase not found: ${purchaseId}`);
        }
        
        console.log('📋 Purchase details:', JSON.stringify(purchase));
        
        // Update purchase status
        purchase.status = 'completed';
        await purchase.save();
        console.log('✅ Purchase status updated to completed');
        
        // Find and update enrollment
        const enrollment = await Enrollment.findOneAndUpdate(
          { 
            userId: purchase.userId, 
            courseId: purchase.courseId 
          },
          { status: 'success' },
          { new: true }
        );
        
        if (!enrollment) {
          console.error('⚠️ No enrollment found to update');
          // Create an enrollment if it doesn't exist
          try {
            const newEnrollment = await Enrollment.create({
              userId: purchase.userId,
              courseId: purchase.courseId,
              amount: purchase.amount,
              status: 'success'
            });
            console.log('✅ Created new enrollment:', newEnrollment._id);
          } catch (err) {
            console.error('❌ Failed to create enrollment:', err.message);
          }
        } else {
          console.log('✅ Enrollment updated:', JSON.stringify(enrollment));
        }
        
        // Retrieve course and user details
        const course = await Course.findById(purchase.courseId);
        const user = await User.findById(purchase.userId);
        
        if (!course) {
          console.error(`❌ Course with ID ${purchase.courseId} not found!`);
        }
        
        if (!user) {
          console.error(`❌ User with ID ${purchase.userId} not found!`);
        }
        
        if (course && user) {
          console.log('👥 Found course and user, updating enrollment relationships');
          console.log('Course enrolled students before:', Array.isArray(course.enrolledStudent) ? course.enrolledStudent : 'Not an array');
          
          // Make sure enrolledStudent exists and is an array
          if (!course.enrolledStudent) {
            course.enrolledStudent = [];
          }
          
          // Check if the user is already in the enrolledStudent array
          let userInEnrolledStudents = false;
          if (Array.isArray(course.enrolledStudent)) {
            userInEnrolledStudents = course.enrolledStudent.some(studentId => 
              studentId && studentId.toString() === user._id.toString()
            );
          }
          
          // Prevent duplicate entries
          if (!userInEnrolledStudents) {
            course.enrolledStudent.push(user._id);
            await course.save();
            console.log('✅ User added to course.enrolledStudent');
          } else {
            console.log('ℹ️ User already in course.enrolledStudent');
          }
          
          // Make sure enrolledCourses exists and is an array
          if (!user.enrolledCourses) {
            user.enrolledCourses = [];
          }
          
          // Check if the course is already in the user's enrolledCourses
          let courseInEnrolledCourses = false;
          if (Array.isArray(user.enrolledCourses)) {
            courseInEnrolledCourses = user.enrolledCourses.some(enrolledCourseId => 
              enrolledCourseId && enrolledCourseId.toString() === course._id.toString()
            );
          }
          
          if (!courseInEnrolledCourses) {
            user.enrolledCourses.push(course._id);
            await user.save();
            console.log('✅ Course added to user.enrolledCourses');
          } else {
            console.log('ℹ️ Course already in user.enrolledCourses');
          }
          
          console.log('🎉 Enrollment process completed successfully!');
        }
      } catch (err) {
        console.error('❌ Error processing purchase:', err);
        return res.status(500).send(`Error processing purchase: ${err.message}`);
      }
    }

    // Return a 200 response to acknowledge receipt of the event
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Error in Stripe webhook:', err);
    res.status(400).send(`Webhook error: ${err.message}`);
  }
};
