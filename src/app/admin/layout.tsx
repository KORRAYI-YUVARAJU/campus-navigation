import { ReactNode } from 'react';

// Use a layout specifically to hide the Navbar on all /admin pages and force dark mode theme!
export default function AdminRootLayout({ children }: { children: ReactNode }) {
  // Renders independent of the main app layout's Navbar since we are intercepting here,
  // but we must make sure these pages maintain standard body stylings.
  return (
    <div className="font-sans antialiased min-h-screen" data-theme="dark" style={{ background: 'var(--bg-primary)' }}>
       {children}
    </div>
  );
}
