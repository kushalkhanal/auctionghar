import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig'; 

export default function Register() {
  const navigate = useNavigate();
 
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    number: '', 
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Added loading state for the button

  const { firstName, lastName, email, password, number } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true); 

    // 1. Client-Side Validation (gives immediate feedback)
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false); // Stop loading
        return; 
    }
    
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(number)) {
        setError('Please enter a valid 10-digit mobile number.');
        setLoading(false); // Stop loading
        return; 
    }

    try {
        // The API call is to '/api/auth/register', which is correct based on your setup.
        const response = await api.post('/auth/register', formData);

        // If successful, show a success message and redirect
        setSuccess(response.data.message + '. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
        // This will now properly catch and display backend errors (e.g., "User already exists")
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
        console.error("Registration failed:", err.response || err);
    } finally {
        setLoading(false); // Stop loading in all cases (success or error)
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lightest flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-neutral-darkest">Create Your Account</h2>
            <p className="text-neutral-dark mt-2">Join the auction excitement!</p>
        </div>
        
        {/* These message boxes will now display all errors correctly */}
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert"><p>{error}</p></div>}
        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md" role="alert"><p>{success}</p></div>}
        
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" name="firstName" value={firstName} onChange={onChange} placeholder="First Name" className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
                <input type="text" name="lastName" value={lastName} onChange={onChange} placeholder="Last Name" className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            
            <input 
                type="tel" 
                name="number" 
                value={number} 
                onChange={onChange} 
                placeholder="Mobile Number" 
                className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                required 
                pattern="\d{10}"
                title="Please enter a 10-digit mobile number"
            />
            <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address" className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" required />
            <input type="password" name="password" minLength="6" onChange={onChange} placeholder="Password (min. 6 characters)" className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg" required />
            
            <button 
                type="submit" 
                disabled={loading} // Disable button while processing
                className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-all duration-300 transform hover:scale-105 disabled:bg-gray-400 disabled:scale-100"
            >
                {loading ? 'Registering...' : 'Register'}
            </button>
        </form>
        <div className="text-center text-neutral-dark">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark underline">Login</Link>
        </div>
      </div>
    </div>
  );
}