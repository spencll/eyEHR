// SignUpForm.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import SignUpForm from './SignupForm';
import EHRApi from '../api';

// Mock the EHRApi
vi.mock('../api');

describe('SignUpForm component', () => {
  const setIsLogged = vi.fn(); // Mock setIsLogged function

  it('renders sign up form', () => {
    render(
      <MemoryRouter>
        <SignUpForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Sign up!').length).toEqual(2)
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('First name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Healthcare provider code')).toBeInTheDocument();
    expect(screen.getByText('Show Password')).toBeInTheDocument();

  });

  it('submits form with valid data', async () => {
    EHRApi.signup.mockResolvedValue('mock-token'); // Mock successful signup response

    render(
      <MemoryRouter>
        <SignUpForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByLabelText('Healthcare provider code'), { target: { value: 'HCP123' } });

    fireEvent.click(screen.getByRole('button',"Sign up!"));

    await waitFor(() => {
      expect(EHRApi.signup).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'testpassword',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        invitationCode: 'HCP123'
      });
      expect(setIsLogged).toHaveBeenCalledWith('mock-token');
      expect(localStorage.getItem('token')).toBe('mock-token');
    });
  });

  it('shows error with empty fields', async () => {
    EHRApi.signup.mockRejectedValue(['No empty fields']);

    render(
      <MemoryRouter>
        <SignUpForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button',"Sign up!"));

       // Wait for the error alert to appear
       await waitFor(() => {
        expect(screen.getByText('No empty fields')).toBeInTheDocument();
      });
  
  });

  it('shows error with signup failure', async () => {
    EHRApi.signup.mockRejectedValue(['Signup failed']); // Mock failed signup response

    render(
      <MemoryRouter>
        <SignUpForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });
    fireEvent.change(screen.getByLabelText('First name'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Last name'), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john.doe@example.com' } });

    fireEvent.click(screen.getByRole('button','Sign up!'));

    await waitFor(() => {
      expect(screen.queryByText('Signup failed')).toBeInTheDocument();
    });
  });

});
