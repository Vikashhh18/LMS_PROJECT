import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/student/Home.jsx'
import Player from './pages/student/Player.jsx'
import CourseList from './pages/student/CourseList.jsx'
import CourseDetail from './pages/student/CourseDetail.jsx'
import MyEnrollement from './pages/student/MyEnrollement.jsx'
import Loading from './components/student/Loading.jsx'
import DeskBoard from './pages/educator/DeskBoard.jsx'
import Educator from './pages/educator/Educator.jsx'
import AddCourse from './pages/educator/AddCourse.jsx'
import MyCourse from './pages/educator/MyCourse.jsx'
import StudentEnrollement from './pages/educator/StudentEnrollement.jsx'


const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>   
        <Route path='/course-list' element={<CourseList/>}/>   
        <Route path='/course-list/:input' element={<CourseList/>}/>   
        <Route path='/course/:id' element={<CourseDetail/>}/>   
        <Route path='/my-enrollement' element={<MyEnrollement/>}/>   
        <Route path='/Player/:id' element={<Player/>}/>   
        <Route path='/loading' element={<Loading/>}/>

        {/* Educator routers */}
        <Route path='/educator' element={<Educator/>}>
           <Route path='educator' element={<DeskBoard/>}/>
           <Route path='add-course' element={<AddCourse/>}/>
           <Route path='my-course' element={<MyCourse/>}/>
           <Route path='student-enroll' element={<StudentEnrollement/>}/>
        </Route>
      </Routes> 
    </div>
  )
}

export default App