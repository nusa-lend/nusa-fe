"use client";

import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const router = useRouter();
    const { disconnect } = useDisconnect();
    const { isConnected, address } = useAccount();

    useEffect(() => {
        if (!isConnected) {
            router.replace('/miniapp/connect');
        }
    }, [isConnected, router]);

    if (!isConnected) return null;

    function handleDisconnect() {
        disconnect();
        router.push('/miniapp/connect');
    }

    return (
        <div>
            <div>Dashboard Page</div>
            <div>Address: {address}</div>
            <button
                onClick={handleDisconnect}
                className="mt-4 px-4 py-2 rounded bg-red-600 text-white"
            >
                Disconnect (Debug)
            </button>
        </div>
    );
}
