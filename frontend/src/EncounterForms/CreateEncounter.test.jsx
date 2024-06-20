// CreateEncounter.test.jsx

import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import CreateEncounter from './CreateEncounter';
import EHRApi from '../api';

// Mock the EHRApi
vi.mock('../api');

describe('CreateEncounter component', () => {
  const mockUserInfo = {
    id: 'user123',
    username: 'testuser',
  };

  const mockEncounter = {
    id: 'encounter123',
  };

  const setEncounters = vi.fn();

  beforeEach(() => {
    EHRApi.makeEncounter.mockResolvedValue(mockEncounter);
    EHRApi.getEncounters.mockResolvedValue([]);
  });

  it('renders loading state and creates encounter', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/123']}>
        <Routes>
         <Route path="/patients/:pid" element={<CreateEncounter userInfo={mockUserInfo} setEncounters={setEncounters} />} />
         </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Creating Encounter...')).toBeInTheDocument();

    await waitFor(() => {
      expect(EHRApi.makeEncounter).toHaveBeenCalledWith('123', {
        userId: mockUserInfo.id,
        patientId: '123',
      });

      expect(EHRApi.getEncounters).toHaveBeenCalledWith(mockUserInfo.username);

      expect(setEncounters).toHaveBeenCalledWith([]);
      

    });
  });

  it('handles error while creating encounter', async () => {
    const errorMessage = 'Failed to create encounter';
    EHRApi.makeEncounter.mockRejectedValueOnce(errorMessage);

    render(
      <MemoryRouter initialEntries={['/patients/123']}>
        <Routes>
          <Route path="/patients/:pid" element={<CreateEncounter userInfo={mockUserInfo} setEncounters={setEncounters} />} />
          </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Creating Encounter...')).toBeInTheDocument();

        expect(screen.queryByText('Reason')).not.toBeInTheDocument()
    ;
  });
});
