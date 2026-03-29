import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import CarCard, { type CarCardProps } from '../../src/components/CarCard';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Fuel: () => <span data-testid="icon-fuel" />,
  Gauge: () => <span data-testid="icon-gauge" />,
  MapPin: () => <span data-testid="icon-mappin" />,
}));

const defaultProps: CarCardProps = {
  id: 'car-123',
  make: 'Maruti Suzuki',
  model: 'Swift',
  year: 2022,
  price: 650000,
  mileage: 25000,
  city: 'Srinagar',
  fuelType: 'Petrol',
  imageUrl: 'https://example.com/swift.jpg',
};

describe('CarCard', () => {
  it('should render the car title with year, make, and model', () => {
    render(<CarCard {...defaultProps} />);
    expect(screen.getByText('2022 Maruti Suzuki Swift')).toBeInTheDocument();
  });

  it('should render the formatted price', () => {
    render(<CarCard {...defaultProps} />);
    // formatPrice produces INR locale format
    expect(screen.getByText('₹6,50,000')).toBeInTheDocument();
  });

  it('should render the formatted mileage', () => {
    render(<CarCard {...defaultProps} />);
    expect(screen.getByText('25k km')).toBeInTheDocument();
  });

  it('should render the city', () => {
    render(<CarCard {...defaultProps} />);
    expect(screen.getByText('Srinagar')).toBeInTheDocument();
  });

  it('should render the fuel type', () => {
    render(<CarCard {...defaultProps} />);
    expect(screen.getByText('Petrol')).toBeInTheDocument();
  });

  it('should link to the correct car detail page', () => {
    render(<CarCard {...defaultProps} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/car/car-123');
  });

  it('should render the car image with correct alt text', () => {
    render(<CarCard {...defaultProps} />);
    const img = screen.getByAltText('2022 Maruti Suzuki Swift');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/swift.jpg');
  });

  it('should render the Featured badge when featured is true', () => {
    render(<CarCard {...defaultProps} featured={true} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('should NOT render the Featured badge when featured is false', () => {
    render(<CarCard {...defaultProps} featured={false} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('should NOT render the Featured badge when featured is undefined', () => {
    render(<CarCard {...defaultProps} />);
    expect(screen.queryByText('Featured')).not.toBeInTheDocument();
  });

  it('should render all three info icons', () => {
    render(<CarCard {...defaultProps} />);
    expect(screen.getByTestId('icon-gauge')).toBeInTheDocument();
    expect(screen.getByTestId('icon-mappin')).toBeInTheDocument();
    expect(screen.getByTestId('icon-fuel')).toBeInTheDocument();
  });
});
