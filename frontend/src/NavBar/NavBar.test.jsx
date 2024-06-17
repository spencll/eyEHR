import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import NavBar from './NavBar';
import EHRApi from '../api';

// Mock the EHRApi
vi.mock('../api');

describe('NavBar component', () => {
  const userInfo = {
    isHCP: true,
  };

  it('renders NavBar with navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar isLogged={true} logout={vi.fn()} userInfo={userInfo} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Home/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's appointments/i)).toBeInTheDocument();
    expect(screen.getByText(/Today's encounters/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByText(/Log out/i)).toBeInTheDocument();
  });

  it('renders Sign up and Login links when not logged in', () => {
    render(
      <MemoryRouter>
        <NavBar isLogged={false} logout={vi.fn()} userInfo={{}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Sign up/i)).toBeInTheDocument();
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('handles search bar input and displays results', async () => {

    // Fake query results
    const mockResults = [
      { id: 1, lastName: 'Doe', firstName: 'John', age: 30, dob: '1990-01-01', cell: '123-456-7890' },
      { id: 2, lastName: 'Smith', firstName: 'Jane', age: 25, dob: '1995-02-02', cell: '987-654-3210' },
    ];

    // API call gives fake query results 
    EHRApi.queryPatients.mockResolvedValue(mockResults);

    render(
      <MemoryRouter>
        <NavBar isLogged={true} logout={vi.fn()} userInfo={userInfo} />
      </MemoryRouter>
    );

    // Target search bar and change placeholder text to new value 
    const searchInput = screen.getByPlaceholderText('Search patients...');
    fireEvent.change(searchInput, { target: { value: 'Joh' } });

    // Wait for the debounce, then expect EHRApi.queryPatients('Joh') call
    await waitFor(() => {
      expect(EHRApi.queryPatients).toHaveBeenCalledWith('Joh');
    });

    // Wait for the debounce, then expect mock search results
    await waitFor(() => {
      expect(screen.getByText(/Doe, John/i)).toBeInTheDocument();
      expect(screen.getByText(/Smith, Jane/i)).toBeInTheDocument();
    });
  });

  it('clears search results on nav link click', async () => {

    // Fake results 
    const mockResults = [
      { id: 1, lastName: 'Doe', firstName: 'John', age: 30, dob: '1990-01-01', cell: '123-456-7890' },
    ];
    EHRApi.queryPatients.mockResolvedValue(mockResults);

    render(
      <MemoryRouter>
        <NavBar isLogged={true} logout={vi.fn()} userInfo={userInfo} />
      </MemoryRouter>
    );

    // Fake searching 
    const searchInput = screen.getByPlaceholderText('Search patients...');
    fireEvent.change(searchInput, { target: { value: 'Joh' } });

    // Wait for the debounce for search results to populate
    await waitFor(() => {
      expect(EHRApi.queryPatients).toHaveBeenCalledWith('Joh');
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Doe, John/i)).toBeInTheDocument();
    });

    // Clicking on patient 
    const searchResultItem = screen.getByText(/Doe, John/i);
    fireEvent.click(searchResultItem);

    // Ensure search results are cleared
    await waitFor(() => {
      expect(screen.queryByText(/Doe, John/i)).not.toBeInTheDocument();
    });
  });
});
