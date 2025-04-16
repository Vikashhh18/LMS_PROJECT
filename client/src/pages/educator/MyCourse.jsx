import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';

const MyCourse = () => {
  const { currency, allCourses,backendUrl,isEducator,getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);

  const fetchAllCourses = async () => {
    // setCourses(allCourses);
    try {
      const token = await getToken();
      const response = await fetch(`${backendUrl}/api/educator/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if(data.success && data.courses) {
        setCourses(data.courses);
      } else {
        console.error("Failed to fetch courses:", data.message);
        setCourses([]);
      }
      console.log(data);        
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    }
  };    

  useEffect(() => {
    fetchAllCourses();
  }, []);

  return courses ? (
    <div className='min-h-screen flex flex-col items-center md:p-8 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='md:table-auto table-fixed w-full'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earning</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {courses.map((course, index) => {
                const price = course?.coursePrice || 0;
                const discount = course?.discount || 0;
                const enrolledCount = course?.enrolledStudent?.length || 0;
                const discountedPrice = Math.floor(price - (price * discount) / 100);
                const totalEarning = enrolledCount * discountedPrice;

                return (
                  <tr key={index} className='border-b border-gray-500/20'>
                    <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                      <img src={course?.courseThumbnail} className='w-16 h-10 object-cover rounded' alt="thumbnail" />
                      <span className='truncate hidden md:block'>{course?.courseTitle}</span>
                    </td>
                    <td className='px-4 py-3'>{currency}{totalEarning}</td>
                    <td className='px-4 py-3'>{enrolledCount}</td>
                    <td className='px-4 py-3'>{new Date(course?.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default MyCourse;
