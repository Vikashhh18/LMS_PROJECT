import React from 'react';
import { assets } from '../../assets/assets';

const companyLogos = [
  { src: assets.microsoft_logo, alt: 'Microsoft' },
  { src: assets.walmart_logo, alt: 'Walmart' },
  { src: assets.accenture_logo, alt: 'Accenture' },
  { src: assets.paypal_logo, alt: 'PayPal' },
  { src: assets.adobe_logo, alt: 'Adobe' },
];

const Companies = () => {
  return (
    <section className="py-6 px-4">
      <div className="max-w-screen-xl mx-auto text-center">
        <p className="text-base text-gray-500 mb-6">Trusted by learners from</p>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-16">
          {companyLogos.map((logo, index) => (
            <img
              key={index}
              src={logo.src}
              alt={logo.alt}
              title={logo.alt}
              loading="lazy"
              className="w-20 md:w-28 transition-transform duration-300 hover:scale-105"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Companies;
