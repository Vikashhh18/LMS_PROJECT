import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';
import YouTube from 'react-youtube';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetail = () => {
  const { id } = useParams();
  const {
    allCourses,
    calculateRating,
    calculateTimeDuration,
    calulateNoOfLecture,
    calulateCourseDuration,
    currency,
    backendUrl,
    userData,
    getToken
  } = useContext(AppContext);

  const [openSection, setOpenSection] = useState([]);
  const [showCourse, setShowCourse] = useState(null);
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const navigate = useNavigate();

  const fetchCourse = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
      if (data.success) {
        setShowCourse(data.courseData);
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const enrollCourse = async () => {
    try {
      if (!userData) {
        toast.warn("Please log in to enroll in this course");
        return;
      }
  
      if (isAlreadyEnrolled) {
        toast.warn("You are already enrolled in this course");
        navigate('/my-enrollement');
        return;
      }
  
      const token = await getToken();
      
      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: showCourse._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (data.success) {
        // Save course ID to localStorage for manual enrollment completion
        localStorage.setItem('last_purchased_course', showCourse._id);
        console.log(`Course ID ${showCourse._id} saved to localStorage for enrollment tracking`);
        
        // Redirect to Stripe checkout
        window.location.href = data.session_url;
      } else {
        toast.error(data.message || "Failed to initiate enrollment");
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to enroll in course");
    }
  };

  const toggleSection = (index) => {
    setOpenSection((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    fetchCourse();
  }, []);

  useEffect(() => {
    if(userData&&showCourse){
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(showCourse._id));
    }
  }, [userData,showCourse]);

  return showCourse ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 item-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left relative z-0 min-h-screen bg-gradient-to-b from-cyan-100/70 to-white">
        <div className="absolute top-0 left-0 w-full inset-0 -z-1 bg-gradient-to-b from-cyan-100/70 to-white"></div>

        {/* Left side */}
        <div className="max-w-xl z-10 text-gray-500">
          <h1 className="md:text-4xl text-5xl font-semibold text-gray-800">{showCourse.courseTitle}</h1>
          <p className="pt-4 md:text-base text-sm" dangerouslySetInnerHTML={{ __html: showCourse.courseDescription.slice(0, 200) }}></p>

          <div className="flex items-center space-x-2 pt-3 pb-1 text-1xl">
            <p>{calculateRating(showCourse)}</p>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <img
                  key={i}
                  src={i < Math.floor(calculateRating(showCourse)) ? assets.star : assets.star_blank}
                  alt="star"
                  className="w-3.5 h-3.5"
                />
              ))}
            </div>

            {/* ✅ Fixed block here */}
            <p className="text-gray-500">
              ({(showCourse.courseRatings?.length || 0)}{' '}
              <span className="text-blue-600">
                {(showCourse.courseRatings?.length || 0) > 1 ? 'Ratings' : 'Rating'}
              </span>)
            </p>

            <p>
              {showCourse.enrolledStudents?.length || 0}{' '}
              {showCourse.enrolledStudents?.length > 1 ? 'Students' : 'Student'}
            </p>
          </div>

          <p className="text-sm">
            Course by <span className="text-blue-600 underline">{showCourse.educator.name}</span>
          </p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold">Course Structure</h2>
            <div className="pt-5">
              {showCourse.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-300 bg-white mb-2 rounded">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        className={`transform transition-transform ${
                          openSection[index] ? 'rotate-180' : ''
                        }`}
                        src={assets.down_arrow_icon}
                        alt="down arrow"
                      />
                      <p className="font-medium md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-sm md:text-default">
                      {chapter.chapterContent.length} lectures - {calculateTimeDuration(chapter)}
                    </p>
                  </div>

                  <div
                    className={`${
                      openSection[index] ? 'max-h-96' : 'max-h-0'
                    } overflow-hidden transition-all duration-300`}
                  >
                    <ul className="divide-y divide-gray-200">
                      {chapter.chapterContent.map((lecture, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 transition-colors duration-200"
                        >
                          <img
                            src={assets.play_icon}
                            alt="play"
                            className="w-5 h-5 mt-1 opacity-70"
                          />
                          <div className="flex flex-col">
                            <p className="text-base font-medium text-gray-800">
                              {lecture.lectureTitle}
                            </p>
                            <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                              {lecture.isPreviewFree && (
                                <span
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: lecture.lectureUrl.split('/').pop(),
                                    })
                                  }
                                  className="text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded text-xs cursor-pointer"
                                >
                                  Preview
                                </span>
                              )}
                              <span>
                                {humanizeDuration(lecture.lectureDuration * 60 * 1000, {
                                  units: ['h', 'm'],
                                })}
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
          </div>

          <div className="py-20 text-sm md:text-default">
            <h3 className="text-xl font-semibold text-gray-800">Course Description</h3>
            <p className="pt-3 rich-text" dangerouslySetInnerHTML={{ __html: showCourse.courseDescription }}></p>
          </div>
        </div>

        {/* Right Card */}
        <div className="w-full md:max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col transition-transform hover:scale-[1.01] duration-300">
          {playerData ? (
            <YouTube videoId={playerData.videoId} opts={{ playerVars: { autoplay: 1 } }} iframeClassName="w-full aspect-video" />
          ) : (
            <img
              src={showCourse.courseThumbnail}
              alt="Course Thumbnail"
              className="w-full aspect-video object-cover"
            />
          )}

          <div className="p-5 flex flex-col gap-4 flex-grow">
            <div className="flex items-center gap-2 text-sm text-red-500">
              <img className="w-4 h-4" src={assets.time_left_clock_icon} alt="time left" />
              <p>
                <span className="font-semibold">5 days</span> left at this price!
              </p>
            </div>

            <div className="flex gap-3 items-end flex-wrap">
              <p className="text-3xl font-bold text-gray-800">
                {currency}
                {(showCourse.coursePrice - (showCourse.discount * showCourse.coursePrice) / 100).toFixed(2)}
              </p>
              <p className="text-base text-gray-400 line-through">{currency}{showCourse.coursePrice}</p>
              <p className="text-base text-green-600 font-medium">{showCourse.discount}% off</p>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <img src={assets.star} alt="rating" className="w-4 h-4" />
                <p>{calculateRating(showCourse)}</p>
              </div>
              <div className="w-px h-4 bg-gray-400/30"></div>
              <div className="flex items-center gap-1">
                <img src={assets.time_clock_icon} alt="duration" className="w-4 h-4" />
                <p>{calulateCourseDuration(showCourse)} hrs</p>
              </div>
              <div className="w-px h-4 bg-gray-400/30"></div>
              <div className="flex items-center gap-1">
                <img src={assets.lesson_icon} alt="lessons" className="w-4 h-4" />
                <p>{calulateNoOfLecture(showCourse)} lessons</p>
              </div>
            </div>

            <button onClick={enrollCourse} className="w-full py-3 cursor-pointer rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
              {isAlreadyEnrolled ? 'Already Enrolled' : 'Enroll Now'}
            </button>

            <div>
              <p className="text-lg font-semibold text-gray-800 mb-2">What's included:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                <li>Lifetime access with free updates</li>
                <li>Step-by-step, hands-on project guidance</li>
                <li>Downloadable resources and source code</li>
                <li>Quizzes to test your knowledge</li>
                <li>Certificate of completion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetail;
