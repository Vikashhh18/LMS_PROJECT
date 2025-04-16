import React, { useContext, useState } from 'react'
import logo from '../../assets/logo.svg';
import user_icon from '../../assets/user_icon.svg'
import { Link, useNavigate } from 'react-router-dom';
import { useClerk,useUser,UserButton } from '@clerk/clerk-react';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const isCourseList=location.pathname.includes('/course-list');
  const {isEducator,setIsEducator,backendUrl,getToken,}=useContext(AppContext);
  const navigate=useNavigate();

  const {openSignIn}=useClerk();
  const {user}=useClerk();

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }
  
      const token = await getToken();
      console.log("JWT Token:", token);
  
      const { data } = await axios.get(`${backendUrl}/api/educator/update-role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log("Backend response:", data);
  
      if (data.success) {
        setIsEducator(true);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Educator error:", error);
      toast.error(error?.response?.data?.message || error.message || "Error becoming educator");
    }
  };
  

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${!isCourseList?'bg-cyan-100/70':'bg-white'} border-gray-300 shadow-sm`}>
      <Link to={'/'}><img src={logo} alt="logo" className='w-28 lg:w-32 cursor-pointer  hover:scale-105 transition duration-200' /></Link>
      {/* for bigger screen like laptop or pc */}
      <div className='hidden md:flex items-center gap-5 text-gray-500'>
        <div className='flex items-center gap-5'>
          {user &&<>  
            <button className='cursor-pointer' onClick={becomeEducator}>{isEducator?'Educator DeskBoard':'Become Educator'}</button>
        | <Link to='/my-enrollement'>My Enrollment</Link> </>
        }  
        </div>
        <div>
       {
        user?<UserButton/>:
        <button onClick={()=>openSignIn() } className='bg-blue-600 text-white px-5 py-2 rounded-full cursor-pointer '>Create Account</button>}
  </div>    
        </div >
      {/* for mobile screen */}
      <div className='md:hidden flex items-center gap-2 sm:gap-5 text-gray-500'>
        <div className='flex items-center gap-1 sm:gap-2 max -sm:text-xs'>
        {user &&<>  
          <button className='cursor-pointer' onClick={becomeEducator}>{isEducator?'Educator DeskBoard':'Become Educator'}</button>
        | <Link to='/my-enrollement'>My Enrollment</Link> </>
        }  
        </div>
        {
          user?<UserButton/>:
          <button onClick={()=>openSignIn()}><img src={user_icon} alt="" /></button>
        }
      </div>
    </div>
  )
}

export default Navbar