import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import humanizeDuration from 'humanize-duration';
import Youtube from 'react-youtube'
import Footer from '../../components/student/Footer';
import Rating from '../../components/student/Rating';

const Player = () => {

  const {enrolledCourse,calculateTimeDuration}=useContext(AppContext);
  const {course_id}=useParams();
  const [showCourse,setShowCourse]=useState(null);
  const [openSection ,setOpenSection]=useState({});
  const [playerData,setPlayerData]=useState(null);

  const getCourseData = () => {
    const selected = enrolledCourse.find((course) => course._id === course_id);
    setShowCourse(selected);
  };

  const toggleSection=(index)=>{
    setOpenSection((prev)=>(
      {...prev,[index]:!prev[index]}
    ))
  }

  useEffect(()=>{
    getCourseData();
  },[enrolledCourse])
  {console.log(showCourse)}

  return (
    <>
      <div className='p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36'>
        {/* left side  */}
        <div className='text-gray-800'>
          <h2 className='text-xl font-semibold'>Course Structure</h2>
          <div className='pt-5'>
            {showCourse && showCourse.courseContent.map((chapter, index) => (
              <div key={index} className='border border-gray-300 bg-white mb-2 rounded'>
                <div className='flex items-center justify-between px-4 py-3 cursor-pointer select-none' onClick={() => toggleSection(index)}>
                  <div className='flex items-center gap-2'>
                    <img className={`transform transition-transform ${openSection[index] ? 'rotate-180' : ''}`} src={assets.down_arrow_icon} alt="down arrow" />
                    <p className='font-medium md:text-base text-sm'>{chapter.chapterTitle}</p>
                  </div>
                  <p className='text-sm md:text-default'>{chapter.chapterContent.length} lectures -{calculateTimeDuration(chapter)}</p>
                </div>
                <div className={`${openSection[index] ? 'max-h-96' : 'max-h-0'} overflow-hidden transition-all duration-300`}>
                  <ul className="divide-y divide-gray-200">
                    {chapter.chapterContent.map((lecture, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <img
                          src={false?assets.blue_tick_icon:assets.play_icon }
                          alt="play"
                          className="w-5 h-5 mt-1 opacity-70"
                        />
                        <div className="flex flex-col">
                          <p className="text-base font-medium text-gray-800">
                            {lecture.lectureTitle}
                          </p>
                          <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                            {lecture.lectureUrl &&(
                              <span onClick={() => setPlayerData({
                                ...lecture,chapter:index+1,lecture:i+1
                              })} className="text-green-600 font-semibold bg-green-100 px-2 py-0.5 rounded text-xs cursor-pointer">
                                Watch
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
        <div className='flex items-center gap-2 py-3 mt-10'>
          <h1 className='text-xl font-bold'>Rate this Course:</h1>
          <Rating initialRating={0}/>
        </div>
        </div>

        {/* right side  */}
        <div className='md:mt-10'>
          {playerData?(<div><Youtube videoId={playerData.lectureUrl.split('/').pop()} iframeClassName='w-full aspect-videp'/>
          <div className='flex justify-between items-center mt-2'>
            <p >{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
            <button className='text-blue-600 font-semibold text-sm '>{false ?'Complete ':'Mark Complete'}</button>
            </div>
            </div>):
            <img src={showCourse?showCourse.courseThumbnail:''} alt="" />
          }
        </div>
      </div>
      <Footer/>
    </>
  )
}

export default Player