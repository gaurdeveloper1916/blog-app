import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect to dashboard or login page
  redirect('/dashboard');
  return null;
}
