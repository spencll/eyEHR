import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import EditAppointment from './EditAppointment';
import EHRApi from '../api';
import { vi } from 'vitest';

vi.mock('../api');

// Pretty much identical to appointmentform test 
describe('EditAppointment', () => {
  const mockPatient = { firstName: 'John' };
  const pid = '123';
  const aid = '456';

  beforeEach(() => {
    EHRApi.getPatient.mockResolvedValue(mockPatient);
    EHRApi.updateAppointment.mockResolvedValue({});
  });

  test('renders without crashing', async () => {
    render(
      <MemoryRouter initialEntries={[`/patients/${pid}/appointments/${aid}/edit`]}>
        <Routes>
          <Route path="/patients/:pid/appointments/:aid/edit" element={<EditAppointment />} />
        </Routes>
      </MemoryRouter>
    );

    // Assert that the component renders the patient name
    await waitFor(() => expect(screen.getByText(/Edit appointment for John!/)).toBeInTheDocument());
  });

  test('handles input change', async () => {
    render(
      <MemoryRouter initialEntries={[`/patients/${pid}/appointments/${aid}/edit`]}>
        <Routes>
          <Route path="/patients/:pid/appointments/:aid/edit" element={<EditAppointment />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to fetch the patient and render
    await waitFor(() => expect(screen.getByText(/Edit appointment for John!/)).toBeInTheDocument());

    // Simulate input change
    const datetimeInput = screen.getByLabelText(/Date and Time/i);
    fireEvent.change(datetimeInput, { target: { value: '2023-06-15T10:00' } });

    expect(datetimeInput.value).toBe('2023-06-15T10:00');
  });

  test('submits the form and navigates on success', async () => {
    render(
      <MemoryRouter initialEntries={[`/patients/${pid}/appointments/${aid}/edit`]}>
        <Routes>
          <Route path="/patients/:pid/appointments/:aid/edit" element={<EditAppointment />} />
        </Routes>
      </MemoryRouter>
    );

    // Wait for the component to fetch the patient and render
    await waitFor(() => expect(screen.getByText(/Edit appointment for John!/)).toBeInTheDocument());

    // Simulate input change
    const datetimeInput = screen.getByLabelText(/Date and Time/i);
    fireEvent.change(datetimeInput, { target: { value: '2023-06-15T10:00' } });

    // Simulate form submission
    const submitButton = screen.getByText(/Submit!/i);
    fireEvent.click(submitButton);

    // Wait for the API call and navigation
    await waitFor(() => {
      expect(EHRApi.updateAppointment).toHaveBeenCalledWith(pid, aid, { datetime: '2023-06-15T10:00' });
    });
  });
});
