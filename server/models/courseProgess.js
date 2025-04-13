import mongoose from "mongoose";

const courseProgrossSchema=new mongoose.Schema({
    userId:{type:String,required:true},
    courseId:{type:String,required:true},
    completed:{type:Boolean,default:true},
    lectureCompleted:[]
},{minimize:false});

export const CourseProgress=mongoose.model('CourseProgress',courseProgrossSchema);