"use client";

import Image from "next/image";

interface HeaderProps {
  onProfileClick: () => void;
}

export default function Header({ onProfileClick }: HeaderProps) {
  return (
    <div className="w-full px-4 py-4 flex items-center justify-between bg-transparent">
      <div className="flex items-center">
        <Image
          src="/logo/logo-dark.png"
          alt="Nusa Logo"
          width={80}
          height={27}
          className="h-6 w-auto"
        />
      </div>

      <div className="flex items-center">
        <button
          onClick={onProfileClick}
          className="focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-full transition-all duration-200 hover:scale-105"
        >
          <Image
            src="/placeholder_profile.jpg"
            alt="Profile"
            width={33}
            height={33}
            className="rounded-full"
          />
        </button>
      </div>
    </div>
  );
}