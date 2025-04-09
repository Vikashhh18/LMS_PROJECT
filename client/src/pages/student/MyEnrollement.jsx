import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom';
import { Link} from 'react-router-dom';
import progross, { Line } from 'rc-progress';
import Footer from '../../components/student/Footer';

const MyEnrollement = () => {
  const {enrolledCourse,calulateCourseDuration} =useContext(AppContext);
  const navigate=useNavigate();
  const [processArray,setProcessArray]=useState([
    {lectureCompleted:2,totalLecture:4},
    {lectureCompleted:1,totalLecture:4},
    {lectureCompleted:5,totalLecture:5},
    {lectureCompleted:4,totalLecture:6},
    {lectureCompleted:0,totalLecture:4},
    {lectureCompleted:1,totalLecture:7},
    {lectureCompleted:4,totalLecture:4},
    {lectureCompleted:3,totalLecture:7}
  ])
  {console.log(enrolledCourse)}
  
  return (
    <>
    <div className='md:px-36 px-8 pt-10'>
      <h1 className='text-2xl font-semibold'>My Enrollments</h1>
      <table className='md:table-auto table-fixed w-full overflow-hidden border border-gray-200 mt-10'>
        <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left max-sm:hidden'>
          <tr>
            <th className='px-4 py-3 font-semibold truncate'>Course</th>
            <th className='px-4 py-3 font-semibold truncate'>Duration</th>
            <th className='px-4 py-3 font-semibold truncate'>Completed</th>
            <th className='px-4 py-3 font-semibold truncate'>Status</th>
          </tr>
        </thead>
        <tbody className='text-gray-700'>
          {enrolledCourse?.map((course, index) => (
            <tr className='border-b border-gray-500/20 ' key={index}>
              <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 '>
                <img src={course.courseThumbnail} alt="" className='w-14 sm:w-24 md:w-28' />
                <div className='flex-1 '>
                  <p className='mb-2 max-sm:text-sm'>{course.courseTitle}</p>
                  <Line strokeWidth={2} percent={processArray[index]?processArray[index].lectureCompleted/processArray[index].totalLecture*100:0 } className='bg-gray-300 rounded-full'/>
                </div>
              </td>
              <td className='px-4 py-3 max-sm:hidden'>{calulateCourseDuration(course)}</td>
              <td className='px-4 py-3 max-sm:hidden'>
                {processArray[index]&&`${processArray[index].lectureCompleted}/${processArray[index].totalLecture}`}<span className=''>Lectures</span></td>
              <td className='px-4 py-3 max-sm:text-right'>
                <button className='px-3 sm:px-5 py-1.5 sm:py-2 bg-blue-600 max-sm:text-sx text-white cursor-pointer' onClick={()=>navigate(`/player/${course._id}`)}>{processArray[index]&&processArray[index].lectureCompleted/processArray[index].totalLecture===1?'Completed':'On Going'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <Footer/>
    </>
  )
}

export default MyEnrollement