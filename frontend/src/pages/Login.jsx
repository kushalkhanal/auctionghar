import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Get the intended destination from location state, or default to home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('Login successful, API response:', response.data);

      // Store password expiry warning if present
      if (response.data.passwordExpiryWarning) {
        sessionStorage.setItem('passwordExpiryWarning', JSON.stringify(response.data.passwordExpiryWarning));
      }

      login(response.data);
      navigate(from, { replace: true });
    } catch (err) {
      // Check if password has expired
      if (err.response?.status === 403 && err.response?.data?.passwordExpired) {
        navigate('/forgot-password', {
          state: { message: 'Your password has expired. Please reset it to continue.' }
        });
        return;
      }

      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-lightest flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-darkest">Welcome Back!</h2>
          <p className="text-neutral-dark mt-2">Log in to place your bids.</p>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p>{error}</p>
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-glow transition duration-300" required />
          </div>
          <div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-neutral-light border-neutral-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:shadow-glow transition duration-300" required />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">
              Forgot Password?
            </Link>
          </div>

          <button type="submit" className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105">
            Login
          </button>
        </form>
        <div className="text-center text-neutral-dark">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-primary-dark underline">
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}