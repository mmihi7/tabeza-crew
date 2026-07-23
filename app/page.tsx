'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace('/waiter');
    } else {
      // Check if user has previously logged in (localStorage flag)
      const hasPreviousLogin = localStorage.getItem('crew_previous_login');
      if (hasPreviousLogin) {
        // Returning user with expired session - go directly to login
        router.replace('/auth/login');
      } else {
        // First-time visitor - show landing page
        router.replace('/landing');
      }
    }
  }, [user, loading, router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8f7f4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderTop: '3px solid #f59e0b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
