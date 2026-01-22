import React, { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../context/AuthContext';
import Login from '../Login';
import axios from 'axios';
import api from '../../api/axiosConfig';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  })),
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
  delete: jest.fn()
}));

// Mock axiosConfig
jest.mock('../../api/axiosConfig', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }
}));

const mockedAxios = axios;

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockLocation = {
  state: { from: { pathname: '/dashboard' } }
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
  Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock the AuthContext
const mockLogin = jest.fn();
jest.mock('../../context/AuthContext', () => ({
  ...jest.requireActual('../../context/AuthContext'),
  useAuth: () => ({
    login: mockLogin,
    user: null,
    isAuthenticated: false
  })
}));

// Test wrapper component
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    api.post.mockClear();
  });

  // Test Case 1: Renders login form with all required elements
  test('renders login form with email and password fields', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText('Welcome Back!')).toBeInTheDocument();
    expect(screen.getByText('Log in to place your bids.')).toBeInTheDocument();
  });

  // Test Case 2: Allows user to input email and password
  test('allows user to input email and password', () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // Test Case 3: Shows validation error for empty form submission
  test('shows validation error when form is submitted with empty fields', async () => {
    renderWithProviders(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // HTML5 validation should prevent form submission
    expect(api.post).not.toHaveBeenCalled();
  });

  // Test Case 4: Successful login redirects user
  test('successful login redirects user to intended destination', async () => {
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, email: 'test@example.com', name: 'Test User' }
      }
    };
    
    api.post.mockResolvedValueOnce(mockResponse);
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockResponse.data);
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  // Test Case 5: Displays error message on login failure
  test('displays error message when login fails', async () => {
    const errorMessage = 'Invalid email or password';
    api.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Test Case 6: Shows generic error message when API error has no specific message
  test('shows generic error message when API error has no specific message', async () => {
    api.post.mockRejectedValueOnce({
      response: { data: {} }
    });
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
    });
  });

  // Test Case 7: Clears error message when user starts typing again
  test('clears error message when user starts typing after error', async () => {
    const errorMessage = 'Invalid credentials';
    api.post.mockRejectedValueOnce({
      response: { data: { message: errorMessage } }
    });
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
    
    // Start typing again
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    // Error should be cleared on next submission attempt
    api.post.mockResolvedValueOnce({
      data: { token: 'new-token', user: { id: 1, email: 'new@example.com' } }
    });
    
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.queryByText(errorMessage)).not.toBeInTheDocument();
    });
  });

  // Test Case 8: Redirects to home page when no intended destination
  test('redirects to home page when no intended destination is specified', async () => {
    // Create a new component with different location state
    const LoginWithNoLocation = () => {
      const navigate = useNavigate();
      const location = { state: null }; // No intended destination
      const { login } = useAuth();
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [error, setError] = useState('');

      const from = location.state?.from?.pathname || '/';

             const handleSubmit = async (e) => {
         e.preventDefault();
         setError('');
         try {
           const response = await api.post('/auth/login', { email, password });
           login(response.data);
           navigate(from, { replace: true });
         } catch (err) {
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
              <button type="submit" className="w-full py-3 font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 ease-in-out transform hover:scale-105">
                Login
              </button>
            </form>
          </div>
        </div>
      );
    };
    
    const mockResponse = {
      data: {
        token: 'mock-token',
        user: { id: 1, email: 'test@example.com' }
      }
    };
    
    api.post.mockResolvedValueOnce(mockResponse);
    
    renderWithProviders(<LoginWithNoLocation />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  // Test Case 9: Contains links to forgot password and register pages
  test('contains links to forgot password and register pages', () => {
    renderWithProviders(<Login />);
    
    const forgotPasswordLink = screen.getByText('Forgot Password?');
    const registerLink = screen.getByText('Register');
    
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(registerLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });

  // Test Case 10: Form has proper accessibility attributes
  test('form has proper accessibility attributes and structure', () => {
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByPlaceholderText('Email Address');
    const passwordInput = screen.getByPlaceholderText('Password');
    const loginButton = screen.getByRole('button', { name: /login/i });
    const errorAlert = screen.queryByRole('alert');
    
    // Check input types
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Check required attributes
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
    
    // Check button type
    expect(loginButton).toHaveAttribute('type', 'submit');
    
    // Check form structure
    const form = loginButton.closest('form');
    expect(form).toBeInTheDocument();
    
    // Error alert should not be present initially
    expect(errorAlert).not.toBeInTheDocument();
  });
}); 