import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-zinc-950 text-white border-t border-white/5">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                    
                    {/* Brand Column */}
                    <div className="md:col-span-5 space-y-6">
                        <Link to="/" className="text-3xl font-black tracking-tighter flex items-center gap-1 group">
                            CRAVE<span className="text-orange-500 group-hover:text-orange-400 transition-colors">.</span>
                        </Link>
                        <p className="text-zinc-400 leading-relaxed max-w-sm text-sm font-medium">
                            Bringing the city's best flavors to your doorstep. Simple, fast, and always delicious.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialIcon icon={<FaFacebookF size={14}/>} />
                            <SocialIcon icon={<FaInstagram size={14}/>} />
                            <SocialIcon icon={<FaTwitter size={14}/>} />
                            <SocialIcon icon={<FaLinkedinIn size={14}/>} />
                        </div>
                    </div>

                    {/* Navigation Column */}
                    <div className="md:col-span-3 space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Company</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/about" label="About Us" />
                            <FooterLink to="/rest" label="Restaurants" />
                            <FooterLink to="/Contact-us" label="Help & Support" />
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="md:col-span-4 space-y-6">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500">Legal</h4>
                        <ul className="space-y-4">
                            <FooterLink to="/terms" label="Terms of Service" />
                            <FooterLink to="/privacy" label="Privacy Policy" />
                            <FooterLink to="/refund" label="Refund Policy" />
                        </ul>
                    </div>
                </div>

                {/* Simplified Contact Bar */}
                <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-3 text-zinc-400">
                        <MapPin size={16} className="text-orange-500" />
                        <span className="text-xs font-medium">Kalawad Road, Rajkot, Gujarat</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400">
                        <Phone size={16} className="text-orange-500" />
                        <span className="text-xs font-medium">+91 98765 43210</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-400 lg:justify-end">
                        <Mail size={16} className="text-orange-500" />
                        <span className="text-xs font-medium">support@crave.com</span>
                    </div>
                </div>
            </div>

            {/* Bottom Copyright Bar */}
            <div className="bg-black py-6 border-t border-white/5">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        &copy; {new Date().getFullYear()} CRAVE. ALL RIGHTS RESERVED.
                    </p>
                    <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        <Globe size={12} />
                        <span>English (IN)</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// --- HELPER COMPONENTS ---

const FooterLink = ({ to, label }) => (
    <li>
        <Link 
            to={to} 
            className="text-zinc-400 hover:text-white text-sm font-medium transition-colors duration-200"
        >
            {label}
        </Link>
    </li>
);

const SocialIcon = ({ icon }) => (
    <a href="#" className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-lg">
        {icon}
    </a>
);

export default Footer;