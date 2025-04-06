import React from 'react'
import Hero from '../../components/student/Hero'
import Companies from '../../components/student/Companies'
import CourseSection from '../../components/student/CourseSection';
import TestimonialSection from '../../components/student/TestimonialSection';
import CallToAction from '../../components/student/CallToAction';
import Footer from '../../components/student/Footer';
const Home = () => {
  return (
    <main className="flex flex-col items-center space-y-2 text-center">
      <Hero />
      <Companies />
      <CourseSection/>
      <TestimonialSection/>
      <CallToAction/>
      <Footer/>
    </main>
  );
};

export default Home;
