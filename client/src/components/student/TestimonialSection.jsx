import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialSection = () => {
  return (
    <div className='pb-14 px-4 md:px-0'>
      <h1 className='text-3xl font-semibold text-gray-800 text-center'>Testimonials</h1>
      <p className='md:text-base text-sm text-gray-500 mt-3 text-center'>
        Hear from our learners as they share their journeys of transformation, success, and how <br className='hidden md:block' />
        our platform has made a difference in their lives.
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14 justify-center'>
  {dummyTestimonial.map((testimonial, index) => (
    <div
      key={index}
      className='max-w-sm w-full text-sm border border-gray-200 rounded-xl bg-white shadow-md overflow-hidden flex flex-col h-full transition-transform hover:scale-[1.02] duration-200'
    >
      <div className='flex items-center gap-4 px-5 py-4 bg-gray-100'>
        <img className='h-12 w-12 rounded-full object-cover' src={testimonial.image} alt={testimonial.name} />
        <div>
          <h1 className='text-lg font-medium text-gray-800'>{testimonial.name}</h1>
          <p className='text-gray-600 text-sm'>{testimonial.role}</p>
        </div>
      </div>

      <div className='px-5 pt-4 pb-6 flex flex-col justify-between flex-1'>
        <div className='flex gap-1'>
          {[...Array(5)].map((_, i) => (
            <img
              className='h-4 w-4'
              key={i}
              src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank}
              alt="star"
            />
          ))}
        </div>
        <p className='text-gray-500 mt-4 leading-relaxed'>
          {testimonial.feedback}
        </p>
      </div>
      <div className='mt-4 text-left pl-4 pb-3'>
    <a href="#" className='text-blue-500 underline'>Read more</a>
  </div>
    </div>
  ))}
</div>

    </div>
  );
};


export default TestimonialSection