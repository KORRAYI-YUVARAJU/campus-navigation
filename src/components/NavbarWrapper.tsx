'use client';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  // Hide Navbar completely on the Admin login and Admin dashboard pages
  if (pathname.includes('/admin')) return null;

  return <Navbar />;
}
