// Profile.test.jsx

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Profile from './Profile';
import EHRApi from '../api';
import {jwtDecode} from 'jwt-decode';

// Mock the EHRApi
vi.mock('../api');
vi.mock('jwt-decode');

describe('Profile component', () => {
  const mockToken = 'header.payload.signature';
  const mockUser = {
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    email: 'testuser@example.com',
  };

  const setRefresh = vi.fn();
  const setIsLogged = vi.fn();

  beforeEach(() => {
    jwtDecode.mockReturnValue({ username: mockUser.username });
    EHRApi.getUser.mockResolvedValue(mockUser);
    EHRApi.updateProfile.mockResolvedValue({});
  });

  it('renders profile form with user data', async () => {
    render(
      <MemoryRouter>
        <Profile isLogged={mockToken} refresh={false} setRefresh={setRefresh} />
      </MemoryRouter>
    );


    await waitFor(() => {
      expect(screen.getByLabelText('Username (read only):')).toHaveValue(mockUser.username);
      expect(screen.getByLabelText('First Name:')).toHaveValue(mockUser.firstName);
      expect(screen.getByLabelText('Last Name:')).toHaveValue(mockUser.lastName);
      expect(screen.getByLabelText('Email:')).toHaveValue(mockUser.email);
    });
  });

  it('allows the user to update their profile', async () => {
    render(
      <MemoryRouter>
        <Profile isLogged={mockToken} refresh={false} setRefresh={setRefresh} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username (read only):')).toHaveValue(mockUser.username);
    });

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'NewFirstName' } });
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'NewLastName' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newemail@example.com' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(EHRApi.updateProfile).toHaveBeenCalledWith(mockUser.username, {
        firstName: 'NewFirstName',
        lastName: 'NewLastName',
        email: 'newemail@example.com',
        password: undefined,
      });
      expect(setRefresh).toHaveBeenCalledWith(true);
    });
  });

  it('handles API errors gracefully', async () => {
    const errorMessage = 'Error updating profile';
    EHRApi.updateProfile.mockRejectedValueOnce(errorMessage);

    render(
      <MemoryRouter>
        <Profile isLogged={mockToken} refresh={false} setRefresh={setRefresh} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Username (read only):')).toHaveValue(mockUser.username);
    });

    fireEvent.change(screen.getByLabelText('First Name:'), { target: { value: 'NewFirstName' } });
    fireEvent.change(screen.getByLabelText('Last Name:'), { target: { value: 'NewLastName' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'newemail@example.com' } });

    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
    });
  });
});
