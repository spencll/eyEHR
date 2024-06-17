// App.test.js
import { render, screen } from '@testing-library/react';
import { MemoryRouter} from 'react-router-dom';
import App from './App';


describe('App Component', () => {
  // Smoke test
  test('renders without crashing', () => {
    render(<MemoryRouter> <App /></MemoryRouter>);
  });

    // Snapshot test
    test('matches snapshot', () => {
      const { asFragment } = render(<MemoryRouter> <App /></MemoryRouter>);
      expect(asFragment()).toMatchSnapshot();
    });


});

describe('App Routes', () => {
  test('renders Home component for / route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

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

  test('renders LoginForm component for /login route', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('renders Profile component for /profile route when logged in', () => {
    localStorage.setItem('token', 'test-token');
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Profile')).toBeInTheDocument();
    localStorage.removeItem('token');
  });

  test('redirects to /login for /profile route when not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Log in!')).toBeInTheDocument();
  });

  test('renders AppointmentsList component for /appointments route when logged in', () => {
    localStorage.setItem('token', 'test-token');
    render(
      <MemoryRouter initialEntries={['/appointments']}>
        <App />
      </MemoryRouter>
    );
    const head = screen.getByRole('heading', { name: /Your appointments/, level: 1 })
    expect(head).toBeInTheDocument();
    localStorage.removeItem('token');
  });

  
  test('renders EncountersList component for /encounters route when logged in', () => {
    localStorage.setItem('token', 'test-token');
    render(
      <MemoryRouter initialEntries={['/encounters']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Your exam reports')).toBeInTheDocument();
    localStorage.removeItem('token');
  });

  test('renders PatientForm component for /patients/add route when HCP', () => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ isHCP: true }));
    render(
      <MemoryRouter initialEntries={['/patients/add']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Register patient!')).toBeInTheDocument();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  });

  test('redirects to /login for /patients/add route when not logged in', () => {
    render(
      <MemoryRouter initialEntries={['/patients/add']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText('Log in!')).toBeInTheDocument();
  });

});
