// import React, { useState } from 'react';

// const ContactUs = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     message: ''
//   });
  
//   const [status, setStatus] = useState('idle'); // idle | loading | success | error

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus('loading');

//     try {
//       const response = await fetch('http://127.0.0.1:8000/api/contact', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(formData),
//       });

//       if (!response.ok) throw new Error('Network response was not ok');

//       setStatus('success');
//       setFormData({ name: '', email: '', message: '' }); // Reset form
//     } catch (error) {
//       console.error("Error:", error);
//       setStatus('error');
//     }
//   };

//   return (
//     <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
//       <h2>Contact Us</h2>
      
//       {status === 'success' && (
//         <div style={{ padding: '10px', backgroundColor: '#d4edda', color: '#155724', marginBottom: '15px' }}>
//           ✅ Message sent successfully! We'll get back to you soon.
//         </div>
//       )}

//       {status === 'error' && (
//         <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', marginBottom: '15px' }}>
//           ❌ Something went wrong. Please try again.
//         </div>
//       )}

//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: '1rem' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>Name</label>
//           <input
//             type="text"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//             style={{ width: '100%', padding: '8px' }}
//           />
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
//           <input
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             style={{ width: '100%', padding: '8px' }}
//           />
//         </div>

//         <div style={{ marginBottom: '1rem' }}>
//           <label style={{ display: 'block', marginBottom: '5px' }}>Message</label>
//           <textarea
//             name="message"
//             rows="4"
//             value={formData.message}
//             onChange={handleChange}
//             required
//             style={{ width: '100%', padding: '8px' }}
//           />
//         </div>

//         <button 
//           type="submit" 
//           disabled={status === 'loading'}
//           style={{
//             width: '100%',
//             padding: '10px',
//             backgroundColor: status === 'loading' ? '#ccc' : '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: status === 'loading' ? 'not-allowed' : 'pointer'
//           }}
//         >
//           {status === 'loading' ? 'Sending...' : 'Send Message'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ContactUs;


import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, MapPin, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
      // Simulate API delay for better UX feel (Optional)
      // await new Promise(resolve => setTimeout(resolve, 1000)); 

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* --- LEFT SIDE: Contact Info & Branding --- */}
        <div className="md:w-2/5 bg-gradient-to-br from-orange-600 to-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

          <div>
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-orange-100 text-sm leading-relaxed mb-8">
              Have a question about your order, or just want to say hello? 
              Fill out the form and our team will get back to you within 24 hours.
            </p>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Phone</p>
                  <p className="font-medium">+91 98765 43210</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-medium">support@crave.com</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-orange-200 font-bold uppercase tracking-wider">Office</p>
                  <p className="font-medium">101 Foodie Street, Gujarat, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-0">
            <p className="text-xs text-orange-200">© 2024 Crave Inc.</p>
          </div>
        </div>

        {/* --- RIGHT SIDE: The Form --- */}
        <div className="md:w-3/5 p-10 md:p-14 bg-white relative">
          
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Send us a Message</h3>

          {/* Alerts */}
          {status === 'success' && (
            <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3 animate-fade-in">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Message sent! We'll be in touch soon.</span>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-fade-in">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">Something went wrong. Please try again.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Name Input */}
            <div className="relative group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block group-focus-within:text-orange-600 transition-colors">Your Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="relative group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block group-focus-within:text-orange-600 transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-medium placeholder-gray-400"
                />
              </div>
            </div>

            {/* Message Input */}
            <div className="relative group">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block group-focus-within:text-orange-600 transition-colors">Message</label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-4 text-gray-400 group-focus-within:text-orange-600 transition-colors" size={20} />
                <textarea
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  placeholder="How can we help you?"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-xl outline-none focus:border-orange-500 focus:bg-white transition-all text-gray-700 font-medium placeholder-gray-400 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="cursor-pointer w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
  );
};

export default ContactUs; 