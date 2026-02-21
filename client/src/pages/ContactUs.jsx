import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, MapPin, Phone, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Network response was not ok');

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });

      // Reset success message after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);

    } catch (error) {
      console.error("Error:", error);
      setStatus('error');
    }
  };

  return (
    <div className="w-[95%] mx-auto min-h-screen bg-[#ffffff] text-slate-900 relative overflow-hidden font-sans ">

      <div className="max-w-7xl mx-auto px-2 py-16 lg:py-24 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* --- LEFT SIDE: Big Typography & Floating Cards --- */}
          <div className="flex flex-col justify-center">
            <div className="mb-12">
              <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-[#FF8A00] text-sm font-bold tracking-wider mb-6">
                SUPPORT 24/7
              </span>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900">
                Let's start a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF8A00] to-rose-500">
                  conversation.
                </span>
              </h1>
              <p className="text-lg text-slate-500 leading-relaxed max-w-md">
                Have a question about your order, or just want to say hello? Drop us a message and our team will get back to you in a flash.
              </p>
            </div>

            {/* Staggered Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Card 1 */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300">
                <div className="w-12 h-12 bg-orange-50 text-[#FF8A00] rounded-2xl flex items-center justify-center mb-4">
                  <Phone size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Call Us</h3>
                <p className="text-slate-500 text-sm mb-3">Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+919876543210" className="text-[#FF8A00] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  +91 98765 43210 <ArrowRight size={16} />
                </a>
              </div>

              {/* Card 2 (Slightly pushed down for staggered look on desktop) */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 hover:-translate-y-1 transition-transform duration-300 sm:translate-y-8">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4">
                  <Mail size={24} />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
                <p className="text-slate-500 text-sm mb-3">We're here to help.</p>
                <a href="mailto:support@crave.com" className="text-rose-500 font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  support@crave.com <ArrowRight size={16} />
                </a>
              </div>

              {/* Card 3 (Full width span) */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 sm:col-span-2 mt-4 sm:mt-8 hover:-translate-y-1 transition-transform duration-300 flex items-center gap-6">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Headquarters</h3>
                  <p className="text-slate-500 text-sm">101 Foodie Street, Culinary District, Gujarat, India</p>
                </div>
              </div>

            </div>
          </div>

          {/* --- RIGHT SIDE: The Form --- */}
          <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_40px_rgb(0,0,0,0.08)] border border-slate-100 relative">

            <h3 className="text-2xl font-bold text-slate-900 mb-8">Send us a Message</h3>

            {/* Alerts */}
            {status === 'success' && (
              <div className="mb-8 p-4 bg-green-50/50 text-green-700 border border-green-100 rounded-2xl flex items-center gap-3 animate-fade-in">
                <CheckCircle size={20} className="shrink-0" />
                <span className="text-sm font-semibold">Message sent! We'll be in touch soon.</span>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-8 p-4 bg-red-50/50 text-red-700 border border-red-100 rounded-2xl flex items-center gap-3 animate-fade-in">
                <AlertCircle size={20} className="shrink-0" />
                <span className="text-sm font-semibold">Something went wrong. Please try again.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Name Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-[#FF8A00] transition-colors">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF8A00] transition-colors" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#FF8A00] focus:bg-white focus:ring-4 ring-[#FF8A00]/10 transition-all text-slate-700 font-medium placeholder-slate-300"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-[#FF8A00] transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#FF8A00] transition-colors" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#FF8A00] focus:bg-white focus:ring-4 ring-[#FF8A00]/10 transition-all text-slate-700 font-medium placeholder-slate-300"
                  />
                </div>
              </div>

              {/* Message Input */}
              <div className="space-y-2 group">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1 group-focus-within:text-[#FF8A00] transition-colors">
                  Message
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4 text-slate-400 group-focus-within:text-[#FF8A00] transition-colors" size={20} />
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="How can we help you today?"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-[#FF8A00] focus:bg-white focus:ring-4 ring-[#FF8A00]/10 transition-all text-slate-700 font-medium placeholder-slate-300 resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="mt-4 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-[0_10px_20px_rgb(0,0,0,0.15)] hover:bg-[#FF8A00] hover:shadow-[0_10px_20px_rgba(255,138,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:bg-slate-900 disabled:hover:-translate-y-0"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Sending...
                  </>
                ) : (
                  <>
                    Send Message <Send size={18} />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactUs;