// App.test.js
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import App from './App';
import Home from './Home';
import SignUpForm from './Auth/SignupForm';
import LoginForm from './Auth/LoginForm';
import Profile from './EditUserForm/Profile';
import AppointmentsList from './AppointmentList/AppointmentsList';
import EncountersList from './EncounterListDetails/EncountersList';
import PatientForm from './NewPatientForm/PatientForm';
import PatientProfile from './PatientDetails/PatientProfile';
import AppointmentForm from './AppointmentForms/AppointmentForm';
import EditAppointment from './AppointmentForms/EditAppointment';
import CreateEncounter from './EncounterForms/CreateEncounter';
import EncounterForm from './EncounterForms/EncounterForm';
import EncounterDetails from './EncounterListDetails/EncounterDetails';

describe('App Routes', () => {
  test('renders Home component for / route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    screen.debug();

    const welcomeMessage = screen.getByText(/Welcome to eyEHR!/)
    expect(welcomeMessage).toBeInTheDocument()
  });

  test('renders SignUpForm component for /signup route', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <App />
      </MemoryRouter>
    );
    const signup = screen.getAllByText('Sign up!')
    expect(signup.length).toEqual(2)
  });

  // test('renders LoginForm component for /login route', () => {
  //   render(
  //     <MemoryRouter initialEntries={['/login']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Login')).toBeInTheDocument();
  // });

  // test('renders Profile component for /profile route when logged in', () => {
  //   localStorage.setItem('token', 'test-token');
  //   render(
  //     <MemoryRouter initialEntries={['/profile']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Profile')).toBeInTheDocument();
  //   localStorage.removeItem('token');
  // });

  // test('redirects to /login for /profile route when not logged in', () => {
  //   render(
  //     <MemoryRouter initialEntries={['/profile']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Log In')).toBeInTheDocument();
  // });

  // // Add more tests for other routes as needed
  // test('renders AppointmentsList component for /appointments route when logged in', () => {
  //   localStorage.setItem('token', 'test-token');
  //   render(
  //     <MemoryRouter initialEntries={['/appointments']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Appointments List')).toBeInTheDocument();
  //   localStorage.removeItem('token');
  // });

  // test('renders EncountersList component for /encounters route when logged in', () => {
  //   localStorage.setItem('token', 'test-token');
  //   render(
  //     <MemoryRouter initialEntries={['/encounters']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Encounters List')).toBeInTheDocument();
  //   localStorage.removeItem('token');
  // });

  // test('renders PatientForm component for /patients/add route when HCP', () => {
  //   localStorage.setItem('token', 'test-token');
  //   localStorage.setItem('user', JSON.stringify({ isHCP: true }));
  //   render(
  //     <MemoryRouter initialEntries={['/patients/add']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Add Patient')).toBeInTheDocument();
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('user');
  // });

  // test('redirects to /login for /patients/add route when not logged in', () => {
  //   render(
  //     <MemoryRouter initialEntries={['/patients/add']}>
  //       <App />
  //     </MemoryRouter>
  //   );
  //   expect(screen.getByText('Log In')).toBeInTheDocument();
  // });

  // // Add more route tests as needed
});
