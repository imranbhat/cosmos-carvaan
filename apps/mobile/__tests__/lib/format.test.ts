import { formatPrice, formatMileage, formatYear, timeAgo } from '../../lib/format';

describe('formatPrice', () => {
  it('should format price with default rupee symbol', () => {
    expect(formatPrice(500000)).toBe('₹5,00,000');
  });

  it('should format zero price', () => {
    expect(formatPrice(0)).toBe('₹0');
  });

  it('should format small price', () => {
    expect(formatPrice(999)).toBe('₹999');
  });

  it('should format large price with Indian locale grouping', () => {
    const result = formatPrice(10000000);
    // Indian locale groups: 1,00,00,000
    expect(result).toBe('₹1,00,00,000');
  });

  it('should use INR symbol when currency is INR', () => {
    expect(formatPrice(1000, 'INR')).toBe('₹1,000');
  });

  it('should use custom currency symbol', () => {
    expect(formatPrice(1000, '$')).toBe('$1,000');
  });
});

describe('formatMileage', () => {
  it('should format mileage under 1000 as plain number', () => {
    expect(formatMileage(500)).toBe('500 km');
  });

  it('should format mileage at exactly 1000', () => {
    expect(formatMileage(1000)).toBe('1K km');
  });

  it('should format mileage with no decimals when evenly divisible', () => {
    expect(formatMileage(50000)).toBe('50K km');
  });

  it('should format mileage with one decimal place when not evenly divisible', () => {
    expect(formatMileage(45500)).toBe('45.5K km');
  });

  it('should format zero mileage', () => {
    expect(formatMileage(0)).toBe('0 km');
  });

  it('should format 999 km without K suffix', () => {
    expect(formatMileage(999)).toBe('999 km');
  });
});

describe('formatYear', () => {
  it('should convert year to string', () => {
    expect(formatYear(2024)).toBe('2024');
  });

  it('should handle older years', () => {
    expect(formatYear(1995)).toBe('1995');
  });
});

describe('timeAgo', () => {
  // Helper to create ISO date strings relative to now
  const minutesAgo = (mins: number) =>
    new Date(Date.now() - mins * 60_000).toISOString();
  const hoursAgo = (hours: number) =>
    new Date(Date.now() - hours * 3_600_000).toISOString();
  const daysAgo = (days: number) =>
    new Date(Date.now() - days * 86_400_000).toISOString();

  it('should return "Just now" for less than 1 minute ago', () => {
    const date = new Date(Date.now() - 30_000).toISOString(); // 30 seconds ago
    expect(timeAgo(date)).toBe('Just now');
  });

  it('should return minutes ago for less than 60 minutes', () => {
    expect(timeAgo(minutesAgo(5))).toBe('5m ago');
    expect(timeAgo(minutesAgo(30))).toBe('30m ago');
    expect(timeAgo(minutesAgo(59))).toBe('59m ago');
  });

  it('should return hours ago for less than 24 hours', () => {
    expect(timeAgo(hoursAgo(1))).toBe('1h ago');
    expect(timeAgo(hoursAgo(12))).toBe('12h ago');
    expect(timeAgo(hoursAgo(23))).toBe('23h ago');
  });

  it('should return days ago for less than 7 days', () => {
    expect(timeAgo(daysAgo(1))).toBe('1d ago');
    expect(timeAgo(daysAgo(6))).toBe('6d ago');
  });

  it('should return weeks ago for less than 30 days', () => {
    expect(timeAgo(daysAgo(7))).toBe('1w ago');
    expect(timeAgo(daysAgo(14))).toBe('2w ago');
    expect(timeAgo(daysAgo(21))).toBe('3w ago');
  });

  it('should return formatted date for 30+ days ago', () => {
    const oldDate = daysAgo(60);
    const result = timeAgo(oldDate);
    // Should be something like "Jan 27" (month short + day)
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});
