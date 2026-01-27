import React, { useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api/axiosConfig';
import PasswordInput from '../components/PasswordInput';
import MFAVerificationModal from '../components/MFAVerificationModal';
import { verifyMFALogin } from '../api/mfaService';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const toast = useToast();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // MFA states
  const [showMFAModal, setShowMFAModal] = useState(false);
  const [tempToken, setTempToken] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaError, setMfaError] = useState('');

  // Get the intended destination from location state, or default to home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Generate reCAPTCHA token (optional for development)
      let captchaToken = null;
      if (executeRecaptcha) {
        try {
          captchaToken = await executeRecaptcha('login');
        } catch (err) {
          console.warn('reCAPTCHA not available:', err);
        }
      }

      const response = await api.post('/auth/login', { email, password, captchaToken });

      // Check if MFA is required
      if (response.data.mfaRequired) {
        setTempToken(response.data.tempToken);
        setShowMFAModal(true);
        return;
      }

      // Store password expiry warning if present
      if (response.data.passwordExpiryWarning) {
        sessionStorage.setItem('passwordExpiryWarning', JSON.stringify(response.data.passwordExpiryWarning));
      }

      login(response.data);
      toast.success('Welcome back! Login successful.');
      navigate(from, { replace: true });
    } catch (err) {
      // Check if password has expired
      if (err.response?.status === 403 && err.response?.data?.passwordExpired) {
        toast.warning('Your password has expired. Please reset it to continue.');
        navigate('/forgot-password', {
          state: { message: 'Your password has expired. Please reset it to continue.' }
        });
        return;
      }

      const message = err.response?.data?.message || 'Login failed. Please try again.';

      // Handle account lockout
      if (err.response?.data?.accountLocked) {
        const lockoutUntil = new Date(err.response.data.lockoutUntil);
        const minutesRemaining = Math.ceil((lockoutUntil - new Date()) / 60000);
        const errorMsg = `Account locked. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.`;
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      setError(message);
      toast.error(message);
    }
  }, [email, password, executeRecaptcha, navigate, from, login]);

  const handleMFAVerification = async (code, isBackupCode) => {
    setMfaLoading(true);
    setMfaError('');
    try {
      const response = await verifyMFALogin(code, isBackupCode, tempToken);

      // Store password expiry warning if present
      if (response.passwordExpiryWarning) {
        sessionStorage.setItem('passwordExpiryWarning', JSON.stringify(response.passwordExpiryWarning));
      }

      // Login with the full token
      login(response);
      toast.success('MFA verification successful! Welcome back.');
      setShowMFAModal(false);
      navigate(from, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid verification code';
      setMfaError(message);
      toast.error(message);
    } finally {
      setMfaLoading(false);
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
          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Password"
            showCapsLockWarning={true}
            showStrengthMeter={false}
            required={true}
          />

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

      {/* MFA Verification Modal */}
      <MFAVerificationModal
        isOpen={showMFAModal}
        onVerify={handleMFAVerification}
        loading={mfaLoading}
        error={mfaError}
      />
    </div>
  );
}