import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/login/page';

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: jest.fn().mockResolvedValue({ error: null }),
      verifyOtp: jest.fn().mockResolvedValue({ error: null })
    }
  })
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() })
}));

test('renders Send OTP button and disables it when email is empty', () => {
  render(<LoginPage />);
  const button = screen.getByRole('button', { name: /send otp/i });
  expect(button).toBeDisabled();
});
