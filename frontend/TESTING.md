# Frontend Testing Guide

This document explains how to run tests for the frontend components and what the tests cover.

## Setup

The testing setup includes:
- **Jest** - Test runner
- **React Testing Library** - Component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers
- **jsdom** - DOM environment for Node.js

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Test Structure

Tests are located in `src/**/__tests__/` directories or files with `.test.jsx` or `.spec.jsx` extensions.

## Login Component Tests

The `Login.test.jsx` file contains 10 comprehensive test cases:

### Test Cases Covered:

1. **Renders login form with all required elements**
   - Verifies that email and password fields are present
   - Checks for login button and welcome text

2. **Allows user to input email and password**
   - Tests that form inputs accept user input
   - Verifies state updates correctly

3. **Shows validation error for empty form submission**
   - Tests HTML5 validation prevents empty form submission
   - Ensures no API call is made with empty fields

4. **Successful login redirects user**
   - Tests successful API call and response handling
   - Verifies user is redirected to intended destination
   - Checks that login function is called with correct data

5. **Displays error message on login failure**
   - Tests error handling when API returns error
   - Verifies error message is displayed to user

6. **Shows generic error message when API error has no specific message**
   - Tests fallback error handling
   - Ensures user sees helpful message even with unclear API errors

7. **Clears error message when user starts typing again**
   - Tests error state management
   - Verifies error clearing behavior on new input

8. **Redirects to home page when no intended destination**
   - Tests navigation fallback behavior
   - Ensures proper routing when no redirect path is specified

9. **Contains links to forgot password and register pages**
   - Tests navigation links are present and functional
   - Verifies correct routing paths

10. **Form has proper accessibility attributes**
    - Tests form accessibility and structure
    - Verifies proper input types and required attributes
    - Checks for proper ARIA roles and form structure

## Testing Best Practices

- Tests focus on user behavior rather than implementation details
- Use semantic queries (getByRole, getByText) over test-specific attributes
- Mock external dependencies (API calls, routing)
- Test error states and edge cases
- Ensure accessibility compliance

## Mocking Strategy

- **Axios**: Mocked to control API responses
- **React Router**: Mocked to test navigation without full routing setup
- **AuthContext**: Mocked to provide authentication state
- **Static Assets**: Mocked to prevent import errors

## Coverage

The tests aim for high coverage of:
- Component rendering
- User interactions
- Form validation
- API integration
- Error handling
- Navigation behavior
- Accessibility features 