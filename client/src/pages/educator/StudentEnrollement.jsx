import React, { useEffect, useState, useContext } from 'react';
import { assets } from '../../assets/assets';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const StudentEnrollement = () => {
  const [studentEnrolled, setStudentEnrolled] = useState(null);
  const [loading, setLoading] = useState(true);
  const { backendUrl, getToken } = useContext(AppContext);

  const fetchStudentEnroll = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Student enrollment data:", data);
      
      if (data.success || data.sucess) {
        setStudentEnrolled(data.enrolledStudents || []);
      } else {
        toast.error(data.message || "Failed to fetch enrolled students");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching enrolled students:", error);
      toast.error(error.message || "Failed to fetch enrolled students");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentEnroll();
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <div className='min-h-screen flex flex-col items-center justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-lg bg-white border border-gray-500/20'>
        {studentEnrolled && studentEnrolled.length > 0 ? (
          <table className='table-fixed md:table-auto w-full overflow-hidden pb-4'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>#</th>
                <th className='px-4 py-3 font-semibold'>Student Name</th>
                <th className='px-4 py-3 font-semibold'>Course Title</th>
                <th className='px-4 py-3 font-semibold hidden sm:table-cell'>Date</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {studentEnrolled.map((item, index) => (
                <tr key={index} className='border-b border-gray-500/20'>
                  <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                  <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                    <img 
                      src={item.student.imageUrl || assets.profile_img} 
                      alt="" 
                      className='w-9 h-9 rounded-full object-cover'
                      onError={(e) => {e.target.src = assets.profile_img}}
                    />
                    <span className='truncate'>{item.student.name}</span>
                  </td>
                  <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                  <td className='px-4 py-3 hidden sm:table-cell'>
                    {new Date(item.purchaseDate).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-10 text-center text-gray-500 w-full">
            No students have enrolled in your courses yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentEnrollement;