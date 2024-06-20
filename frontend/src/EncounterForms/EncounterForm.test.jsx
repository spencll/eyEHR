import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import EncounterForm from './EncounterForm';
import EHRApi from '../api';


// Mock the EHRApi
vi.mock('../api');

describe('EncounterForm component', () => {
  const mockUserInfo = {
    id: 'user123',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    isHCP: true,
  };

  const mockEncounter = {
    id: 'encounter123',
    uid: 'user123', // User ID matching userInfo.id
    signed: false,
    results: {
      reason: 'Routine checkup',
      rvision: 20,
      lvision: 20,
      findings: 'No abnormalities',
      ap: 'Prescription for glasses',
      rpressure: 15,
      lpressure: 16,
    },
  };

  const setEncounter = vi.fn();
  beforeEach(() => {
    // Reset encounter data before each test
   let encounterData = {
      id: 'encounter123',
      uid: 'user123',
      signed: false,
      results: {
        reason: 'Routine checkup',
        rvision: 20,
        lvision: 20,
        findings: 'No abnormalities',
        ap: 'Prescription for glasses',
        rpressure: 15,
        lpressure: 16,
      },
    };

    // Mock getPatientEncounter to return the updated encounter data
    EHRApi.getPatientEncounter.mockImplementation(async () => encounterData);
    

    EHRApi.signEncounter.mockResolvedValue({
      ...encounterData,
      signed: true,
      signedBy: `${mockUserInfo.lastName}, ${mockUserInfo.firstName}`
    });

    EHRApi.unsignEncounter.mockResolvedValue({
      ...encounterData,
      signed: false,
    });
  });

  it('renders encounter form with initial data', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/123/encounters/456']}>
        <Routes>
          <Route path="/patients/:pid/encounters/:eid" element={<EncounterForm userInfo={mockUserInfo}  />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Reason for visit')).toHaveValue('Routine checkup');
      expect(screen.getByTestId('rpressure')).toHaveValue(15);
      expect(screen.getByTestId('lpressure')).toHaveValue(16);
      expect(screen.getByLabelText('Findings')).toHaveValue('No abnormalities');
      expect(screen.getByLabelText('Assessment and plan')).toHaveValue('Prescription for glasses');
      expect(screen.queryByText('Signed by:')).not.toBeInTheDocument(); // Not signed initially
    });

    expect(screen.getByRole('button', { name: 'Sign chart!' })).toBeInTheDocument();
  });



  it('allows editing and updates encounter data', async () => {
    render(
      <MemoryRouter initialEntries={['/patients/123/encounters/456']}>
        <Routes>
          <Route path="/patients/:pid/encounters/:eid" element={<EncounterForm userInfo={mockUserInfo} />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText('Reason for visit')).toHaveValue('Routine checkup');
    });

    fireEvent.change(screen.getByLabelText('Reason for visit'), { target: { value: 'Updated reason' } });
    await waitFor(() => {
        expect(screen.getByLabelText('Reason for visit')).toHaveValue('Updated reason');
      })
    fireEvent.change(screen.getByTestId('rpressure'), { target: { value: 18 } });
    await waitFor(() => {
        expect(screen.getByTestId('rpressure')).toHaveValue(18);
      });
    fireEvent.change(screen.getByTestId('lpressure'), { target: { value: 20 } });
    await waitFor(() => {
        expect(screen.getByTestId('lpressure')).toHaveValue(20);
      });
      
    fireEvent.change(screen.getByLabelText('Findings'), { target: { value: 'Updated findings' } });
    await waitFor(() => {
        expect(screen.getByLabelText('Findings')).toHaveValue('Updated findings');
      });

    fireEvent.change(screen.getByLabelText('Assessment and plan'), { target: { value: 'Updated plan' } });
    await waitFor(() => {
        expect(screen.getByLabelText('Assessment and plan')).toHaveValue('Updated plan');
      });

      fireEvent.click(screen.getByRole('button', { name: 'Sign chart!' }));


    await waitFor(() => {
       
      expect(screen.getByText('Unsign')).toBeInTheDocument();
    });
  });

//   it('handles error while updating encounter', async () => {
//     const errorMessage = 'Failed to update encounter';
//     EHRApi.updateEncounter.mockRejectedValueOnce(new Error(errorMessage));

//     render(
//       <MemoryRouter initialEntries={['/patients/123/encounters/456']}>
//         <Routes>
//           <Route path="/patients/:pid/encounters/:eid" element={<EncounterForm userInfo={mockUserInfo} setEncounters={setEncounters} />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByLabelText('Reason for visit')).toHaveValue('Routine checkup');
//     });

//     fireEvent.change(screen.getByLabelText('Reason for visit'), { target: { value: 'Updated reason' } });
//     fireEvent.click(screen.getByRole('button', { name: 'Sign chart!' }));

//     await waitFor(() => {
//       expect(console.error).toHaveBeenCalledWith(`Error signing: ${errorMessage}`);
//     });
//   });

//   it('allows unsigning encounter', async () => {
//     render(
//       <MemoryRouter initialEntries={['/patients/123/encounters/456']}>
//         <Routes>
//           <Route path="/patients/:pid/encounters/:eid" element={<EncounterForm userInfo={mockUserInfo} setEncounters={setEncounters} />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByLabelText('Reason for visit')).toHaveValue('Routine checkup');
//     });

//     fireEvent.click(screen.getByRole('button', { name: 'Unsign' }));

//     await waitFor(() => {
//       expect(EHRApi.unsignEncounter).toHaveBeenCalledWith('123', '456');
//       expect(setEncounters).toHaveBeenCalled();
//       expect(screen.getByRole('button', { name: 'Sign chart!' })).toBeInTheDocument();
//     });
//   });

//   it('redirects to encounter details if not HCP', async () => {
//     const mockNonHCPUserInfo = { ...mockUserInfo, isHCP: false };

//     render(
//       <MemoryRouter initialEntries={['/patients/123/encounters/456']}>
//         <Routes>
//           <Route path="/patients/:pid/encounters/:eid" element={<EncounterForm userInfo={mockNonHCPUserInfo} setEncounters={setEncounters} />} />
//         </Routes>
//       </MemoryRouter>
//     );

//     await waitFor(() => {
//       expect(screen.getByText('Exam results')).toBeInTheDocument(); // Rendered because we haven't actually navigated away
//     });

//     // Assert the redirection would happen here; we'd use a location hook to verify the pathname is now /patients/:pid
//   });
});
