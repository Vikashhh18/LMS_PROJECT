import mongoose from "mongoose";
const enrollmentSchema = new mongoose.Schema({
  userId: {
    type: String, 
    required: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  amount: Number,
  status: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending"
  }
}, { timestamps: true });

export default mongoose.model("Enrollment", enrollmentSchema);
