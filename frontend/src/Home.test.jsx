import React from 'react';
import { render, screen, waitFor} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import EHRApi from './api';
import { vi } from 'vitest';

vi.mock('./api'); // Mock the API module

const mockUserInfo = {
  firstName: 'John',
  isHCP: true,
  username: 'john_doe',
};

const mockFormatDateTime = (datetime) => {
  return {
    date: '2024-06-18',
    time: '12:00 PM',
  };
};

test('renders welcome message for logged-out users', () => {
    render(
      <MemoryRouter>
        <Home isLogged={false} userInfo={null} formatDateTime={mockFormatDateTime} />
      </MemoryRouter>
    );
  
    const welcomeMessage = screen.getByText(/Welcome to eyEHR!/i);
    expect(welcomeMessage).toBeInTheDocument();
  });

  test('renders welcome message for logged-in users', () => {
    render(
      <MemoryRouter>
        <Home isLogged={true} userInfo={{ ...mockUserInfo, isHCP: false }} formatDateTime={mockFormatDateTime} />
      </MemoryRouter>
    );
  
    const welcomeMessage = screen.getByText(/Welcome back, John!/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
  
  test('renders unsigned encounters for HCP', async () => {
    const mockEncounters = [
      {
        id: 1,
        datetime: '2024-06-18T12:00:00',
        patientLastName: 'Doe',
        patientFirstName: 'Jane',
        drLastName: 'Smith',
        drFirstName: 'John',
        pid: 123,
      },
    ];
  
    EHRApi.getUnsignedEncounters.mockResolvedValueOnce(mockEncounters);
  
    render(
      <MemoryRouter>
        <Home isLogged={true} userInfo={mockUserInfo} formatDateTime={mockFormatDateTime} />
      </MemoryRouter>
    );
    
     // Wait for the encounters to be rendered
  await waitFor(() => {
    const unsignedEncounterHeader = screen.getByText(/Unsigned encounters/i);
    expect(unsignedEncounterHeader).toBeInTheDocument();

    const patientName = screen.getByText(/Doe, Jane/i);
    expect(patientName).toBeInTheDocument();
  });
  });
  
  test('renders message when no unsigned encounters are present', async () => {
    EHRApi.getUnsignedEncounters.mockResolvedValueOnce([]);
  
    render(
      <MemoryRouter>
        <Home isLogged={true} userInfo={mockUserInfo} formatDateTime={mockFormatDateTime} />
      </MemoryRouter>
    );
  
    const noEncountersMessage = await screen.findByText(/You are caught up! No unsigned encounters./i);
    expect(noEncountersMessage).toBeInTheDocument();
  });


  