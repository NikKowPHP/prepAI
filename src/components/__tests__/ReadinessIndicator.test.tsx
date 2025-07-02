import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ReadinessIndicator from '../ReadinessIndicator';

describe('ReadinessIndicator Component', () => {
  it('renders with correct score and color for high readiness', () => {
    render(<ReadinessIndicator score={85} />);

    expect(screen.getByText('Readiness Score: 85')).toBeInTheDocument();
    expect(screen.getByText('Readiness Score: 85')).toHaveClass('text-green-500');
  });

  it('renders with correct score and color for medium readiness', () => {
    render(<ReadinessIndicator score={50} />);

    expect(screen.getByText('Readiness Score: 50')).toBeInTheDocument();
    expect(screen.getByText('Readiness Score: 50')).toHaveClass('text-yellow-500');
  });

  it('renders with correct score and color for low readiness', () => {
    render(<ReadinessIndicator score={20} />);

    expect(screen.getByText('Readiness Score: 20')).toBeInTheDocument();
    expect(screen.getByText('Readiness Score: 20')).toHaveClass('text-red-500');
  });

  it('renders with default score when none provided', () => {
    render(<ReadinessIndicator score={0} />);

    expect(screen.getByText('Readiness Score: 0')).toBeInTheDocument();
    expect(screen.getByText('Readiness Score: 0')).toHaveClass('text-red-500');
  });
});