import mongoose from "mongoose";

// Define the schema here to ensure it's available
const purchaseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  userId: { type: String, ref: "User", required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' }
}, { timestamps: true });

// Use a safeguard to prevent model redefinition errors
export const Purchase = mongoose.models.Purchase || mongoose.model("Purchase", purchaseSchema); 