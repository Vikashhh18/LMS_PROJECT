import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Youtube from 'react-youtube';
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';

const Player = () => {
  const {
    enrolledCourse,
    calculateTimeDuration,
    backendUrl,
    getToken,
    userData,
    fatchEnrolledCourse,
  } = useContext(AppContext);

  const { course_id } = useParams();
  const [showCourse, setShowCourse] = useState(null);
  const [openSection, setOpenSection] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getCourseData = async () => {
    try {
      const selected = enrolledCourse.find((course) => course._id === course_id);
      
      if (selected) {
        console.log("Found course in enrolled courses:", selected._id);
        setShowCourse(selected);
        
        const userRating = selected.courseRatings?.find(
          (item) => item.userId === userData?._id
        );
        if (userRating) {
          setInitialRating(userRating.rating);
        }
      } else {
        console.log("Course not found in enrolled courses, fetching directly...");
        const token = await getToken();
        const { data } = await axios.get(
          `${backendUrl}/api/user/course/${course_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (data.success && data.course) {
          console.log("Successfully fetched course directly:", data.course._id);
          setShowCourse(data.course);
          
          const userRating = data.course.courseRatings?.find(
            (item) => item.userId === userData?._id
          );
          if (userRating) {
            setInitialRating(userRating.rating);
          }
        } else {
          toast.error("Course not found or you don't have access to this course");
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index) => {
    setOpenSection((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    getCourseData();
  }, [course_id, enrolledCourse]);

  useEffect(() => {
    if (showCourse) {
      getCourseProgress();
    }
  }, [showCourse]);

  const markLectureAsComplete = async () => {
    try {
      if (!playerData || !playerData.lectureId) {
        toast.warn("No lecture selected");
        return;
      }
      
      console.log("Marking lecture as complete:", playerData.lectureId);
      
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { 
          courseId: course_id,
          lectureId: playerData.lectureId 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        toast.success(data.message || "Lecture marked as complete");
        await getCourseProgress(); // Wait for progress to update
      } else {
        toast.error(data.message || "Failed to mark lecture as complete");
      }
    } catch (error) {
      console.error("Error marking lecture as complete:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to mark lecture as complete");
    }
  };

  const getCourseProgress = async () => {
    try {
      if (!showCourse) return;
      
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId: course_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (data.success) {
        console.log("Progress data received:", data.progressData);
        setProgressData(data.progressData);
      } else {
        console.warn("Could not fetch course progress:", data.message);
      }
    } catch (error) {
      console.error("Error fetching course progress:", error);
    }
  };

  const handleRate = async (rating) => {
    try {
      
      const token = await getToken();
      const { data } = await axios.post(`${backendUrl}/api/user/add-rating`, {
        courseId: course_id,
        rating
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success(data.message);
        fatchEnrolledCourse();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Rating failed:", error);
      toast.error(error.response?.data?.message || error.message || "Rating request failed.");
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : !showCourse ? (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Course Not Found</h2>
          <p className="text-gray-600 mb-6">The course you're looking for is not available or you don't have access to it.</p>
          <button 
            onClick={() => navigate('/my-enrollement')}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Go to My Enrollments
          </button>
        </div>
      ) : (
        <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
          {/* left side */}
          <div className='text-gray-800'>
            <h2 className='text-xl font-semibold'>Course Structure</h2>
            <div className='pt-5'>
              {showCourse.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className='border border-gray-300 bg-white mb-2 rounded'
                >
                  <div
                    className='flex items-center justify-between px-4 py-3 cursor-pointer select-none'
                    onClick={() => toggleSection(index)}
                  >
                    <div className='flex items-center gap-2'>
                      <img
                        className={`transform transition-transform ${
                          openSection[index] ? 'rotate-180' : ''
                        }`}
                        src={assets.down_arrow_icon}
                        alt='down arrow'
                      />
                      <p className='font-medium md:text-base text-sm'>
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className='text-sm md:text-default'>
                      {chapter.chapterContent.length} lectures -{' '}
                      {calculateTimeDuration(chapter)}
                    </p>
                  </div>
                  <div
                    className={`${
                      openSection[index] ? 'max-h-96' : 'max-h-0'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <ul className='divide-y divide-gray-200'>
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          key={i}
                          className='flex items-start gap-3 px-6 py-3 hover:bg-gray-50 transition-colors duration-200'
                        >
                          <img
                            src={
                              progressData &&
                              progressData.lectureCompleted.includes(
                                lecture.lectureId
                              )
                                ? assets.blue_tick_icon
                                : assets.play_icon
                            }
                            alt='play'
                            className='w-5 h-5 mt-1 opacity-70'
                          />
                          <div className='flex flex-col'>
                            <p className='text-base font-medium text-gray-800'>
                              {lecture.lectureTitle}
                            </p>
                            <div className='text-sm text-gray-500 flex items-center gap-4 mt-1'>
                              {lecture.lectureUrl && (
                                <span
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                  className='text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded text-xs cursor-pointer'
                                >
                                  Watch
                                </span>
                              )}
                              <span>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  {
                                    units: ['h', 'm'],
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            <div className='flex items-center gap-2 py-3 mt-10'>
              <h1 className='text-xl font-bold'>Rate this Course:</h1>
              <Rating
                initialRating={initialRating}
                onRate={handleRate}
              />
            </div>
          </div>

          {/* right side */}
          <div className='md:mt-10'>
            {playerData ? (
              <div>
                <Youtube
                  videoId={playerData.lectureUrl.split('/').pop()}
                  iframeClassName='w-full aspect-video'
                />
                <div className='flex justify-between items-center mt-2'>
                  <p>
                    {playerData.chapter}.{playerData.lecture}{' '}
                    {playerData.lectureTitle}
                  </p>
                  <button
                    onClick={() => markLectureAsComplete()}
                    className={`px-4 py-1 text-sm font-semibold rounded ${
                      progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(playerData.lectureId)
                        ? 'bg-green-100 text-green-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {progressData && progressData.lectureCompleted && progressData.lectureCompleted.includes(playerData.lectureId)
                      ? '✓ Completed'
                      : 'Mark Complete'}
                  </button>
                </div>
              </div>
            ) : (
              showCourse?.courseThumbnail && (
                <img src={showCourse.courseThumbnail} alt='Course Thumbnail' />
              )
            )}
          </div>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Player;
