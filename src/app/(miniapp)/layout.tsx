"use client";

import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { usePathname, useRouter } from 'next/navigation';
import { useHybridDetection } from '@/hooks/useHybridDetection';

export default function MiniAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const { isConnected } = useAccount();
  const pathname = usePathname();
  const router = useRouter();
  const { isVerifiedMiniApp, isLoading } = useHybridDetection();

  useEffect(() => {
    if (!pathname || isLoading) return;

    if (!isVerifiedMiniApp) {
      router.replace('/');
      return;
    }

    if (!isConnected && pathname.startsWith('/miniapp/dashboard')) {
      router.replace('/miniapp/connect');
      return;
    }
  }, [isConnected, pathname, router, isVerifiedMiniApp, isLoading]);

  const isConnectPage = pathname?.startsWith('/miniapp/connect');
  
  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64"></div>
      <div className={`flex-grow md:overflow-y-auto ${isConnectPage ? '' : 'p-6 md:p-12'}`}>
        {children}
      </div>
    </div>
  );
}
