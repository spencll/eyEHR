// LoginForm.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';
import EHRApi from '../api';

// Mock the EHRApi
vi.mock('../api');

describe('LoginForm component', () => {
  const setIsLogged = vi.fn(); // Mock setIsLogged function

  it('renders login form', () => {
    render(
      <MemoryRouter>
        <LoginForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    expect(screen.getByText('Log in!')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Show Password')).toBeInTheDocument();
    expect(screen.getByText('Login!')).toBeInTheDocument();
  });

  it('submits form with valid credentials', async () => {
    EHRApi.login.mockResolvedValue('mock-token'); // Mock successful login response

    render(
      <MemoryRouter>
        <LoginForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText('Login!'));

    await waitFor(() => {
      expect(EHRApi.login).toHaveBeenCalledWith('testuser', 'testpassword');
      expect(setIsLogged).toHaveBeenCalledWith('mock-token');
    });
  });

  it('shows error with empty fields', async () => {
    render(
      <MemoryRouter>
        <LoginForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Login!'));

    expect(await screen.findByText('Please fill out all fields.')).toBeInTheDocument();
  });

  it('shows error with invalid credentials', async () => {
    EHRApi.login.mockRejectedValue('Invalid credentials'); // Mock failed login response

    render(
      <MemoryRouter>
        <LoginForm setIsLogged={setIsLogged} />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'testpassword' } });
    fireEvent.click(screen.getByText('Login!'));

    await waitFor(() => {
      expect(screen.queryByText('Invalid credentials')).toBeInTheDocument();
    });
  });

});
