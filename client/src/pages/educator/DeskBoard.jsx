import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets, dummyDashboardData } from '../../assets/assets';

const DeskBoard = () => {
  const [deshBoardData, setDeshBoardData] = useState({
    enrolledStudentsData: [],
    totalCourses: 0,
    totalEarnings: 0,
  });

  const { currency } = useContext(AppContext);

  const fetchDeshBoardData = () => {
    setDeshBoardData(dummyDashboardData);
  };

  useEffect(() => {
    fetchDeshBoardData();
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='space-y-5'>
        {/* Top summary cards */}
        <div className='flex flex-wrap gap-5 items-stretch'>
          {/* Total Enrollments */}
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-32'>
            <img src={assets.patients_icon} alt="enrollment" className='w-10 h-10' />
            <div className='flex flex-col justify-between flex-1'>
              <p className='text-2xl font-medium text-gray-600'>
                {deshBoardData?.enrolledStudentsData?.length || 0}
              </p>
              <p className='text-base text-gray-500'>Total Enrollments</p>
            </div>
          </div>

          {/* Total Courses */}
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-32'>
            <img src={assets.appointments_icon} alt="courses" className='w-10 h-10' />
            <div className='flex flex-col justify-between flex-1'>
              <p className='text-2xl font-medium text-gray-600'>
                {deshBoardData?.totalCourses || 0}
              </p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>

          {/* Total Earnings */}
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-32'>
            <img src={assets.earning_icon} alt="earnings" className='w-10 h-10' />
            <div className='flex flex-col justify-between flex-1'>
              <p className='text-2xl font-medium text-gray-600'>
                {currency}{deshBoardData?.totalEarnings || 0}
              </p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>

        {/* Latest Enrollments Table */}
        <div>
          <h2 className='pb-4 text-lg font-medium'>Latest Enrollments</h2>
          <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-300'>
            <table className='table-fixed md:table-auto w-full'>
              <thead className='text-gray-900 border-b border-gray-300 text-sm text-left'>
                <tr>
                  <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                  <th className='px-4 py-3 font-semibold'>Student Name</th>
                  <th className='px-4 py-3 font-semibold'>Course Title</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-600'>
                {deshBoardData?.enrolledStudentsData?.map((item, index) => (
                  <tr key={index} className='border-b border-gray-200'>
                    <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                    <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                      <img src={item.student.imageUrl} alt="student" className='w-9 h-9 rounded-full' />
                      <span className='truncate'>{item.student.name}</span>
                    </td>
                    <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeskBoard;
