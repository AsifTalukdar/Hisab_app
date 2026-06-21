import { render, screen } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';

// Mock the Supabase server client and its queries
jest.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user' } } })
    },
    from: jest.fn().mockReturnValue({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [] })
        })
      })
    })
  })
}));

test('renders dashboard heading', async () => {
  render(await DashboardPage());
  const heading = await screen.findByRole('heading', { name: /dashboard/i });
  expect(heading).toBeInTheDocument();
});
