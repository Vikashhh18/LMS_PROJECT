import React from 'react';
import { assets } from '../../assets/assets.js';

const Hero = () => {
  return (
    <section className="w-full bg-gradient-to-b from-cyan-100/70 to-white py-20 px-6 md:px-0 flex flex-col items-center text-center space-y-8">
      <h1 className="text-3xl md:text-5xl font-bold text-gray-800 max-w-4xl relative leading-tight">
        Empower your future with courses designed to
        <span className="text-blue-600"> fit your choice.</span>
        <img
          src={assets.sketch}
          alt="Sketch"
          className="md:block hidden absolute -bottom-7 right-2 "
        />
      </h1>

      <p className="text-gray-600 max-w-2xl text-base md:text-lg hidden md:block">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>
      <p className="text-gray-600 max-w-sm text-sm md:hidden">
        World-class instructors and interactive content to help you grow.
      </p>

      <button className="mt-4 bg-blue-600 text-white font-medium px-6 py-3 rounded-full hover:bg-blue-700 transition-all shadow-md">
        Explore Courses
      </button>
    </section>
  );
};

export default Hero;
