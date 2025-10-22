'use client';

import Image from 'next/image';
import { useFarcasterUser } from '@/hooks/useFarcasterUser';

interface HeaderProps {
  onProfileClick: () => void;
}

export default function Header({ onProfileClick }: HeaderProps) {
  const { user, hasUser } = useFarcasterUser();

  const profileImageSrc = hasUser && user?.pfpUrl ? user.pfpUrl : '/placeholder/placeholder_profile.jpg';
  const profileImageAlt = hasUser && user?.displayName ? user.displayName : 'Profile';

  return (
    <div className="w-full px-4 py-4 flex items-center justify-between bg-transparent mb-2">
      <div className="flex items-center">
        <Image src="/assets/logos/logo-dark.png" alt="Nusa Logo" width={85} height={30} className="h-6 w-auto" />
      </div>

      <div className="flex items-center">
        <button
          onClick={onProfileClick}
          className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-200 hover:scale-105"
        >
          <Image src={profileImageSrc} alt={profileImageAlt} width={36} height={36} className="rounded-full" />
        </button>
      </div>
    </div>
  );
}
