import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppointmentsList from './AppointmentsList';
import { expect } from 'vitest';

describe('AppointmentsList', () => {
  const mockFormatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };
  };

  const mockUserInfoHCP = {
    isHCP: true,
    id: '1',
  };

  const mockUserInfoPatient = {
    isHCP: false,
    id: '2',
  };

  const mockAppointments = [
    {
      id: '1',
      datetime: '2023-06-15T10:00:00Z',
      patientLastName: 'Doe',
      patientFirstName: 'John',
      drLastName: 'Smith',
      drFirstName: 'Jane',
      pid: '123',
    },
    {
      id: '2',
      datetime: '2023-06-15T11:00:00Z',
      patientLastName: 'Brown',
      patientFirstName: 'James',
      drLastName: 'Adams',
      drFirstName: 'Mary',
      pid: '124',
    },
  ];

  test('renders no appointments for HCP', () => {
    render(
      <MemoryRouter>
        <AppointmentsList
          userInfo={mockUserInfoHCP}
          appointments={[]}
          formatDateTime={mockFormatDateTime}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Today's appointments/)).toBeInTheDocument();
    expect(screen.getByText(/No appointments today/)).toBeInTheDocument();
  });

  test('renders no appointments for patient', () => {
    render(
      <MemoryRouter>
        <AppointmentsList
          userInfo={mockUserInfoPatient}
          appointments={[]}
          formatDateTime={mockFormatDateTime}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Your appointments/)).toBeInTheDocument();
    expect(screen.getByText(/No appointments found/)).toBeInTheDocument();
  });

  test('renders appointments for HCP', () => {
    render(
      <MemoryRouter>
        <AppointmentsList
          userInfo={mockUserInfoHCP}
          appointments={mockAppointments}
          formatDateTime={mockFormatDateTime}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Today's appointments/)).toBeInTheDocument();
    mockAppointments.forEach((appointment) => {
      const { date, time } = mockFormatDateTime(appointment.datetime);

      const appointmentCard = screen.queryByText(`${appointment.patientLastName}, ${appointment.patientFirstName}`).closest('li');
      expect(appointmentCard).toBeInTheDocument();

      const withinCard = within(appointmentCard);
      expect(withinCard.queryByText(`${date}`)).toBeInTheDocument();
      expect(withinCard.queryByText(`${time}`)).toBeInTheDocument();
      expect(withinCard.queryByText(`${appointment.drLastName}, ${appointment.drFirstName}`)).toBeInTheDocument();
      expect(withinCard.getByText(/Make encounter/)).toBeInTheDocument();
    });
  });

  test('renders appointments for patient', () => {
    render(
      <MemoryRouter>
        <AppointmentsList
          userInfo={mockUserInfoPatient}
          appointments={mockAppointments}
          formatDateTime={mockFormatDateTime}
        />
      </MemoryRouter>
    );

    expect(screen.getByText(/Your appointments/)).toBeInTheDocument();
    mockAppointments.forEach((appointment) => {
      const { date, time } = mockFormatDateTime(appointment.datetime);

      const appointmentCard = screen.queryByText(`${appointment.patientLastName}, ${appointment.patientFirstName}`).closest('li');
      expect(appointmentCard).toBeInTheDocument();

      const withinCard = within(appointmentCard);
      expect(withinCard.queryByText(`${date}`)).toBeInTheDocument();
      expect(withinCard.queryByText(`${time}`)).toBeInTheDocument();
      expect(withinCard.queryByText(`${appointment.drLastName}, ${appointment.drFirstName}`)).toBeInTheDocument();
      expect(withinCard.queryByText(/Make encounter/)).not.toBeInTheDocument();
    });
  });
});
