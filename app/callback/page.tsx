"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMsal } from '@azure/msal-react';
import { Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const router = useRouter();
  const { accounts } = useMsal();

  useEffect(() => {
    // If MSAL authentication is complete (accounts exist), redirect to dashboard
    if (accounts.length > 0) {
      router.push('/dashboard');
    } else {
      // If no accounts, redirect to login
      router.push('/login');
    }
  }, [accounts, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
      <h2 className="text-2xl font-semibold mb-2">Processing Authentication</h2>
      <p className="text-gray-500">Please wait while we complete your sign-in...</p>
    </div>
  );
}
