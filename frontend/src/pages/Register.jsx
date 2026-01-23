import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import PasswordInput from '../components/PasswordInput';
import PasswordMatchIndicator from '../components/PasswordMatchIndicator';

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    number: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { firstName, lastName, email, password, confirmPassword, number } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    // Client-Side Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special symbol.');
      setLoading(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(number)) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        number
      });

      setSuccess(response.data.message + '. Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error("Registration failed:", err.response || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lightest flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-darkest">Create Your Account</h2>
          <p className="text-neutral-dark mt-2">Join the auction excitement!</p>
        </div>

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

          <PasswordInput
            value={password}
            onChange={(val) => setFormData({ ...formData, password: val })}
            placeholder="Password (min. 8 characters)"
            showStrengthMeter={true}
            showCapsLockWarning={true}
            name="password"
            id="password"
          />

          <PasswordInput
            value={confirmPassword}
            onChange={(val) => setFormData({ ...formData, confirmPassword: val })}
            placeholder="Confirm Password"
            showStrengthMeter={false}
            showCapsLockWarning={true}
            name="confirmPassword"
            id="confirmPassword"
          />

          <PasswordMatchIndicator password={password} confirmPassword={confirmPassword} />

          <button
            type="submit"
            disabled={loading}
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