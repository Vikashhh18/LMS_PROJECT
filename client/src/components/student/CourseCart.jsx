import React, { useContext } from 'react'
import {assets} from '../../assets/assets.js'
import { AppContext } from '../../context/AppContext.jsx'
import { Link } from 'react-router-dom';

const CourseCart = ({course}) => {
  const {currency,calculateRating}=useContext(AppContext); 

  // Add null checks to prevent errors when data is not fully loaded
  if (!course) {
    return <div className="border border-gray-500/30 p-4 rounded-lg">Loading course...</div>;
  }

  return (
    <Link to={'/course/'+course._id} onClick={()=>{scrollTo(0,0)} } className='border border-gray-500/30 pb-6 overflow-hidden rounded-lg'>
      <img src={course.courseThumbnail || assets.thumbnail_placeholder} alt="" className='w-full' />
      <div className='p-3 text-left'>
      <h3 className='text-base font-semibold'>{course.courseTitle || 'Untitled Course'}</h3>
      {/* Add null check for course.educator */}
      <p className='text-gray-500'>{course.educator?.name || 'Instructor'}</p>
      <div className='flex items-center space-x-2'>
        <p>{calculateRating(course)}</p>
        <div className='flex'>
          {[...Array(5)].map((_,i)=>(<img key={i} src={i < Math.floor(calculateRating(course)) ? assets.star : assets.star_blank} alt='star' className='w-3.5 h-3.5 '/>))}
        </div>
        <p className='text-gray-500'>{course.courseRatings?.length || 0}</p>
      </div>
      <p className='text-base font-semibold text-gray-800'>{currency}{(course.coursePrice - (course.discount || 0) * course.coursePrice / 100).toFixed(2)}</p>
      </div>
    </Link>
  )
}

export default CourseCart