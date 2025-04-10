import { Webhook } from "svix";
import User from "../models/user";

export const clerkWebHook=async(req,res)=>{
    try {
        const whook=new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await  whook.verify(JSON.stringify(req,body),{
            "svix-id":req.headers["svix-id"],
            "svix-timestamp":req.headers["svix-timestamp"],
            "svix-signature":req.headers["svix-signature"]
        })

        const {data,type}=req.body;
        switch (type) {
            case 'user.created':{
                const userData={
                    _id:data.id,
                    email:data.email_address[0].email_address,
                    name:data.first_name+" "+data.last_name,
                    imageUrl:data.imageurl,                   
                }
                await User.create(userData);
                res.json({sucess:true});
                break;
            }
            case 'user.update':{
                const userData={
                    email:data.email_address[0].email_address,
                    name:data.first_name+" "+data.last_name,
                    imageUrl:data.imageurl,                   
                }
                await User.findByIdAndUpdate(data.id,userData);
                res.json({sucess:true});
                break;
            }

            case 'user.delete':{
                await User.findByIdAndDelete(data.id);
                res.json({});
                break;
            }
        
            default:
                break;
        }
    } catch (error) {
        res.json({sucess:false,message:error.message});
    }
}