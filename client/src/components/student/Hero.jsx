import React from 'react';
import { assets } from '../../assets/assets.js';
import { useClerk } from '@clerk/clerk-react';
import SearchBar from './SearchBar.jsx';

const Hero = () => {
  const { openSignIn, user } = useClerk();

  return (
    <section className="w-full bg-gradient-to-b from-cyan-100/70 to-white py-15 px-4">
      <div className="max-w-screen-xl mx-auto flex flex-col mt-14 items-center text-center space-y-8">
        <h1 className="text-3xl md:text-6xl font-bold text-gray-800 max-w-5xl relative leading-tight">
          Empower your future with courses designed to
          <span className="text-blue-600"> fit your choice.</span>
          <img
            src={assets.sketch}
            alt="Sketch"
            className="md:block hidden absolute -bottom-7 right-2"
          />
        </h1>

        <p className="text-gray-600 max-w-2xl text-base md:text-lg hidden md:block">
          We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
        </p>
        <p className="text-gray-600 max-w-sm text-sm md:hidden">
          World-class instructors and interactive content to help you grow.
        </p>
          <SearchBar />
      </div>
    </section>
  );
};

export default Hero;
