import React from 'react'
import { assets } from '../../assets/assets'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white w-full mt-10'>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-10 px-6 md:px-36 py-12 border-b border-white/20'>

        {/* Logo + Description */}
        <div className='flex flex-col items-center md:items-start text-center md:text-left'>
          <img src={assets.logo_dark} alt="logo" className='w-32' />
          <p className='mt-6 text-sm text-white/80'>
            LearnHub is your go-to platform to explore courses, enhance your skills, and learn at your own pace — anytime, anywhere.
            Empowering learners with flexible, affordable, and high-quality education.
          </p>
        </div>

        {/* Company Links */}
        <div className='text-center md:text-left'>
          <h3 className='text-lg font-semibold mb-4'>Company</h3>
          <ul className='space-y-2 text-sm text-white/80'>
            <li><a href="#">Home</a></li>
            <li><a href="#">About us</a></li>
            <li><a href="#">Contact us</a></li>
            <li><a href="#">Privacy policy</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className='text-center md:text-left'>
          <h4 className='text-lg font-semibold mb-2'>Subscribe to our newsletter</h4>
          <p className='text-sm text-white/70 mb-4'>
            The latest news, articles, and resources, sent to your inbox weekly.
          </p>
          <form className='flex flex-col sm:flex-row gap-2'>
            <input
              type="email"
              placeholder="Enter your email"
              className='px-4 py-2 rounded-md text-white bg-gray-800 w-full sm:w-auto flex-1 focus:outline-none'
            />
            <button
              type="submit"
              className='bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium'
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <p className='text-center text-sm text-white/60 py-4'>
      Copyright 2025 © V-Demy. All rights reserved.
      </p>
    </footer>
  )
}

export default Footer
