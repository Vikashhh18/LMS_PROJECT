import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { toast } from 'react-toastify';

const DeskBoard = () => {
  const [dashboardData, setDashboardData] = useState({
    enrolledStudents: [],
    totalCourse: 0,
    totalEarnings: 0,
    loading: true
  });

  const { currency, backendUrl, getToken } = useContext(AppContext);

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/deshboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Dashboard data from API:", data);
      
      if (data.success) {
        setDashboardData({
          ...data.dashboardData,
          loading: false
        });
      } else {
        toast.error(data.message || "Failed to fetch dashboard data");
        setDashboardData(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error(error.message || "Failed to fetch dashboard data");
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      {dashboardData.loading ? (
        <div className="flex justify-center items-center w-full py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className='space-y-5 w-full'>
          {/* Top summary cards */}
          <div className='flex flex-wrap gap-5 items-stretch'>
            {/* Total Enrollments */}
            <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-32'>
              <img src={assets.patients_icon} alt="enrollment" className='w-10 h-10' />
              <div className='flex flex-col justify-between flex-1'>
                <p className='text-2xl font-medium text-gray-600'>
                  {dashboardData?.enrolledStudents?.length || 0}
                </p>
                <p className='text-base text-gray-500'>Total Enrollments</p>
              </div>
            </div>

            {/* Total Courses */}
            <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-32'>
              <img src={assets.appointments_icon} alt="courses" className='w-10 h-10' />
              <div className='flex flex-col justify-between flex-1'>
                <p className='text-2xl font-medium text-gray-600'>
                  {dashboardData?.totalCourse || 0}
                </p>
                <p className='text-base text-gray-500'>Total Courses</p>
              </div>
            </div>

            {/* Total Earnings */}
            <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 w-56 rounded-md h-32'>
              <img src={assets.earning_icon} alt="earnings" className='w-10 h-10' />
              <div className='flex flex-col justify-between flex-1'>
                <p className='text-2xl font-medium text-gray-600'>
                  {currency}{dashboardData?.totalEarnings?.toFixed(2) || 0}
                </p>
                <p className='text-base text-gray-500'>Total Earnings</p>
              </div>
            </div>
          </div>

          {/* Latest Enrollments Table */}
          <div>
            <h2 className='pb-4 text-lg font-medium'>Latest Enrollments</h2>
            <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-300'>
              {dashboardData?.enrolledStudents?.length > 0 ? (
                <table className='w-full'>
                  <thead className='text-gray-900 border-b border-gray-300 text-sm text-left'>
                    <tr>
                      <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                      <th className='px-4 py-3 font-semibold'>Student Name</th>
                      <th className='px-4 py-3 font-semibold'>Course Title</th>
                    </tr>
                  </thead>
                  <tbody className='text-sm text-gray-600'>
                    {dashboardData.enrolledStudents.map((item, index) => (
                      <tr key={index} className='border-b border-gray-200'>
                        <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                        <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                          <img 
                            src={item.student.imageUrl || assets.profile_img} 
                            alt="student" 
                            className='w-9 h-9 rounded-full object-cover' 
                            onError={(e) => {e.target.src = assets.profile_img}}
                          />
                          <span className='truncate'>{item.student.name}</span>
                        </td>
                        <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-10 text-center text-gray-500">
                  No enrollments found. Once students enroll in your courses, they will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeskBoard;
