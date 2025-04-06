import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../../context/AppContext';
import Loading from '../../components/student/Loading';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Footer from '../../components/student/Footer';

const CourseDetail = () => {
  const { id } = useParams();
  const { allCourses, calculateRating, calculateTimeDuration, calulateNoOfLecture
    , calulateCourseDuration } = useContext(AppContext);
  
  const [openSection,setOpenSection]=useState([]);

  const [showCourse, setShowCourse] = useState(null);

  const fetchCourse = async () => {
    const course = allCourses.find((item) => item._id === id);
    setShowCourse(course);
  }

  const toggleSection=(index)=>{
    setOpenSection((prev)=>(
      {...prev,[index]:!prev[index]}
    ))
  }

  useEffect(() => {
    fetchCourse();
  }, [id])

  return showCourse ? (
    <>
    <div className="flex md:flex-row flex-col-reverse gap-10 item-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left relative z-0 min-h-screen bg-gradient-to-b from-cyan-100/70 to-white">
      {/* Gradient BG */}
      <div className="absolute top-0 left-0 w-full inset-0 -z-1 bg-gradient-to-b from-cyan-100/70 to-white"></div>
      <div className='max-w-xl z-10 text-gray-500'>
        <h1 className='md:text-4xl text-5xl font-semibold text-gray-800'>{showCourse.courseTitle}</h1>
        <p className='pt-4 md:text-base text-sm ' dangerouslySetInnerHTML={{ __html: showCourse.courseDescription.slice(0, 200) }}></p>
        <div className='flex items-center space-x-2 pt-3 pb-1 text-1xl'>
          <p>{calculateRating(showCourse)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (<img key={i} src={i < Math.floor(calculateRating(showCourse)) ? assets.star : assets.star_blank} alt='star' className='w-3.5 h-3.5 ' />))}
          </div>
          <p className='text-gray-500'>({showCourse.courseRatings.length} <span className='text-blue-600'>{showCourse.courseRatings.length > 1 ? 'Ratings' : 'Rating'}</span>)</p>
          <p>{showCourse.enrolledStudents.length} {showCourse.enrolledStudents.length > 1 ? 'Students' : 'Student'}</p>
        </div>
        <p className='text-sm'>Course by <span className='text-blue-600 underline'>VickySharma</span></p>
        <div className='pt-8 text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className='pt-5'>
            {showCourse.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={()=>toggleSection(index)}>
                  <div  className='flex items-center gap-2'>
                    <img className={`transform transition-transform ${openSection[index]?'rotate-180':''}`} src={assets.down_arrow_icon} alt="down arrow" />
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures -{calculateTimeDuration(chapter)}</p>
                </div>
                 <div className={`${openSection[index]?'max-h-96':'max-h-0'} overflow-hidden transition-all duration-300`}>
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
                              <span className="text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded text-xs">
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
        <div className='py-20 text-sm md:text-default'>
          <h3 className='text-xl font-semibold text-gray-800'>Course Descrption</h3>
          <p className='pt-3 rich-text' dangerouslySetInnerHTML={{ __html: showCourse.courseDescription}}></p>
        </div>
      </div>






    </div>
    <Footer/>
   </>
  ) : <Loading />
}

export default CourseDetail