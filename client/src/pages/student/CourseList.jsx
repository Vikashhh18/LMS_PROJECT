import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import SearchBar from '../../components/student/SearchBar';
import { AppContext } from '../../context/AppContext';
import CourseCart from '../../components/student/CourseCart';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/Footer';

const CourseList = () => {

  const navigate=useNavigate();
  const {input}=useParams();
  const {allCourses}=useContext(AppContext);
  const [filterCourse,setFilterCourse]=useState([]);

  useEffect(()=>{
    if(allCourses&&allCourses.length>0){
      const tempCourse=allCourses.slice();
      {console.log(tempCourse)};
      input?
      setFilterCourse(tempCourse.filter(item=>item.courseTitle.toLowerCase().includes(input.toLowerCase())))
      :setFilterCourse(tempCourse);
    }
  },[allCourses,input]);

  return (
    <>
    <div className='relative md:px-36 px-8 pt-20 text-left'>
      <div className='flex md:flex-row flex-col gap-6 items-center justify-between w-full'>
        <div>
          <h1 className='text-4xl font-semibold text-gray-800'>Course-List</h1>
          <p className='text-gray-500'><span className='text-blue-600 font-semibold cursor-pointer' onClick={()=>navigate('/')}>Home</span>/ <span>Course List</span></p>
        </div>
        <SearchBar data={input}/>
      </div>
      <div>
        {input&&
        <div className='inline-flex items-center gap-4  px-4 py-2 border-1 border-gray-300 mt-8 -mb-8 text-gray-800 rounded'>
          <p>{input}</p>
          <img src={assets.cross_icon} alt="cross" className='cursor-pointer' onClick={()=>navigate('/course-list')} />
          </div>
          }
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-4 md:px-0 md:my-16 my-10 gap-4'>
        {filterCourse.map((course,index)=><CourseCart key={index} course={course}/>)}
      </div>
    </div>
    <Footer/>
    </>
  )
}

export default CourseList