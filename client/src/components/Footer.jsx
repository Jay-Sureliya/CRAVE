import React from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        
        {/* Top Section: Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: About */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-1 after:bg-pink-500">
              CompanyName
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We are dedicated to providing the best service possible. Building quality software and designs for over a decade.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-1 after:bg-pink-500">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {['Home', 'About Us', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white hover:pl-2 transition-all duration-300 text-sm block"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-1 after:bg-pink-500">
              Contact Us
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>123 Main Street, New York, NY</li>
              <li>+1 555 123 4567</li>
              <li>support@company.com</li>
            </ul>
          </div>

          {/* Column 4: Social Media */}
          <div>
            <h3 className="text-xl font-semibold mb-4 relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-12 after:h-1 after:bg-pink-500">
              Follow Us
            </h3>
            <div className="flex space-x-4">
              <SocialLink href="#"><FaFacebookF /></SocialLink>
              <SocialLink href="#"><FaTwitter /></SocialLink>
              <SocialLink href="#"><FaInstagram /></SocialLink>
              <SocialLink href="#"><FaLinkedinIn /></SocialLink>
            </div>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} CompanyName. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

// Helper component for Social Links to reduce repetition
const SocialLink = ({ href, children }) => {
  return (
    <a
      href={href}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-white hover:text-gray-900 transition-colors duration-300"
    >
      {children}
    </a>
  );
};

export default Footer;