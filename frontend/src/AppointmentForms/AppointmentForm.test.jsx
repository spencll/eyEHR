import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppointmentForm from './AppointmentForm';
import EHRApi from '../api';
import { vi } from 'vitest';

vi.mock('../api');

describe('AppointmentForm', () => {

    //Fake patient info
  const mockUserInfo = { id: 1 };
  const mockPatient = { firstName: 'John' };
  const pid = '123';

  beforeEach(() => {

    // Setting up mocks
    EHRApi.getPatient.mockResolvedValue(mockPatient);
    EHRApi.makeAppointment.mockResolvedValue({});
  });

  test('renders without crashing', async () => {
    render(
      <MemoryRouter initialEntries={[`/patients/${pid}/appointments/new`]}>
        <Routes>
          <Route path="/patients/:pid/appointments/new" element={<AppointmentForm userInfo={mockUserInfo} />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert that the component renders the patient name
    await waitFor(() => expect(screen.getByText(/Make appointment for John!/)).toBeInTheDocument());
  });

  test('handles input change', async () => {
    render(
      <MemoryRouter initialEntries={[`/patients/${pid}/appointments/new`]}>
        <Routes>
          <Route path="/patients/:pid/appointments/new" element={<AppointmentForm userInfo={mockUserInfo} />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to fetch the patient and render
    await waitFor(() => expect(screen.getByText(/Make appointment for John!/)).toBeInTheDocument());

    // Simulate input change and expect change 
    const datetimeInput = screen.getByLabelText(/Date and Time/i);
    fireEvent.change(datetimeInput, { target: { value: '2023-06-15T10:00' } });

    expect(datetimeInput.value).toBe('2023-06-15T10:00');
  });

  test('submits the form and navigates on success', async () => {
    render(
      <MemoryRouter initialEntries={[`/patients/${pid}/appointments/new`]}>
        <Routes>
          <Route path="/patients/:pid/appointments/new" element={<AppointmentForm userInfo={mockUserInfo} />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to fetch the patient and render
    await waitFor(() => expect(screen.getByText(/Make appointment for John!/)).toBeInTheDocument());

    // Simulate input change
    const datetimeInput = screen.getByLabelText(/Date and Time/i);
    fireEvent.change(datetimeInput, { target: { value: '2023-06-15T10:00' } });

    // Simulate form submission
    const submitButton = screen.getByText(/Submit!/i);
    fireEvent.click(submitButton);

    // Wait for the API call and navigation
    await waitFor(() => {
      expect(EHRApi.makeAppointment).toHaveBeenCalledWith(pid, {
        datetime: '2023-06-15T10:00',
        userId: 1,
        patientId: pid,
      });
    });
  });
});
