"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ExternalLink } from "lucide-react";
import BottomSheet from "./BottomSheet";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const Header = () => {
  const headerRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const lastScrollYRef = useRef(0);
  const isHiddenRef = useRef(false);
  const headerTween = useRef<gsap.core.Tween | null>(null);
  
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const burgerButtonRef = useRef<HTMLButtonElement>(null);

  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "About", href: "#about" },
    { label: "Docs", href: "#docs" },
  ];

  useGSAP(() => {
    const header = headerRef.current;
    const logo = logoRef.current;
    const nav = navRef.current;
    const cta = ctaRef.current;

    if (!header || !logo || !nav || !cta) return;

    const tl = gsap.timeline();
    
    tl.fromTo(logo, 
      { 
        opacity: 0, 
        x: -50, 
        scale: 0.8 
      },
      { 
        opacity: 1, 
        x: 0, 
        scale: 1, 
        duration: 0.8, 
        ease: "back.out(1.7)" 
      }
    )
    .fromTo(nav.children, 
      { 
        opacity: 0, 
        y: -20 
      },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.1, 
        ease: "power2.out" 
      },
      "-=0.4"
    )
    .fromTo(cta, 
      { 
        opacity: 0, 
        scale: 0.8 
      },
      { 
        opacity: 1, 
        scale: 1, 
        duration: 0.5, 
        ease: "back.out(1.5)" 
      },
      "-=0.6"
    );

    ScrollTrigger.create({
      trigger: "body",
      start: "top top",
      end: "bottom bottom",
      onUpdate: () => {
        const currentScrollY = window.scrollY;
        const diff = Math.abs(currentScrollY - lastScrollYRef.current);
        if (diff < 10) return;
    
        if (currentScrollY > lastScrollYRef.current && currentScrollY > 120 && !isHiddenRef.current) {
          isHiddenRef.current = true;
          headerTween.current?.kill();
          headerTween.current = gsap.to(header, {
            y: -80,
            opacity: 0,
            scale: 0.98,
            duration: 0.2,
            ease: "power3.inOut",
          });
        } 
        else if (currentScrollY < lastScrollYRef.current && isHiddenRef.current) {
          isHiddenRef.current = false;
          headerTween.current?.kill();
          headerTween.current = gsap.to(header, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: "power3.out",
          });
        }
    
        lastScrollYRef.current = currentScrollY;
      },
    });

    const logoHover = () => {
      gsap.to(logo, {
        rotation: 2,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const logoHoverOut = () => {
      gsap.to(logo, {
        rotation: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    };

    logo.addEventListener("mouseenter", logoHover);
    logo.addEventListener("mouseleave", logoHoverOut);

    const ctaHover = () => {
      gsap.to(cta, {
        duration: 0.3,
        ease: "power2.out"
      });
    };

    const ctaHoverOut = () => {
      gsap.to(cta, {
        duration: 0.3,
        ease: "power2.out"
      });
    };

    cta.addEventListener("mouseenter", ctaHover);
    cta.addEventListener("mouseleave", ctaHoverOut);

    return () => {
      logo.removeEventListener("mouseenter", logoHover);
      logo.removeEventListener("mouseleave", logoHoverOut);
      cta.removeEventListener("mouseenter", ctaHover);
      cta.removeEventListener("mouseleave", ctaHoverOut);
    };
  }, []);

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      gsap.to(window, {
        duration: 1,
        scrollTo: { y: element, offsetY: 80 },
        ease: "power2.inOut"
      });
    }
  };

  const handleLaunchApp = () => {
    window.open("https://app.nusa.finance", "_blank");
  };

  const toggleBottomSheet = () => {
    setIsBottomSheetOpen(!isBottomSheetOpen);
  };

  const closeBottomSheet = () => {
    setIsBottomSheetOpen(false);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      >
        <div className="bg-white/90 backdrop-blur-sm px-8 py-4 w-full">
          <div className="flex items-center justify-between h-16">
            <div
              ref={logoRef}
              className="flex items-center cursor-pointer"
              onClick={() => handleNavClick("#home")}
            >
              <div className="relative w-26 h-26">
                <Image
                  src="/logo/logo-dark.png"
                  alt="Nusa Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <nav ref={navRef} className="hidden lg:flex items-center space-x-6">
                {navItems.map((item, index) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item.href)}
                    className="relative px-4 py-2 text-base text-text/70 cursor-pointer hover:text-text transition-colors duration-300 font-medium group"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                ref={ctaRef}
                onClick={handleLaunchApp}
                className="hidden lg:flex relative px-6 py-4 bg-text text-white font-semibold rounded-full transition-all duration-300 group items-center space-x-2 hover:shadow-lg overflow-hidden"
              >
                <span className="relative z-10">Launch App</span>
                <ExternalLink className="relative z-10 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
              </button>
            </div>

            <button 
              ref={burgerButtonRef}
              onClick={toggleBottomSheet}
              className="lg:hidden p-2 text-text hover:text-primary transition-colors relative"
            >
              <svg 
                className={`w-6 h-6 transition-all duration-300 ${isBottomSheetOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              
              <svg 
                className={`w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isBottomSheetOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-180 scale-0'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <BottomSheet
        isOpen={isBottomSheetOpen}
        onClose={closeBottomSheet}
        maxHeight="100vh"
        sheetClassName="lg:hidden"
        overlayClassName="lg:hidden"
      >
        <nav className="space-y-6">
          {navItems.map((item, index) => (
            <button
              key={item.label}
              onClick={() => {
                handleNavClick(item.href);
                closeBottomSheet();
              }}
              className="nav-item w-full text-left px-6 py-5 text-xl text-text/70 hover:text-text hover:bg-gray-50 rounded-xl transition-colors duration-300 font-medium"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-8 pb-6">
          <button
            onClick={() => {
              handleLaunchApp();
              closeBottomSheet();
            }}
            className="nav-item w-full relative px-8 py-5 bg-text text-white font-semibold rounded-full transition-all duration-300 group flex items-center justify-center space-x-3 hover:shadow-lg overflow-hidden text-lg"
          >
            <span className="relative z-10">Launch App</span>
            <ExternalLink className="relative z-10 w-6 h-6 transition-transform duration-300 group-hover:translate-x-1" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
          </button>
        </div>
      </BottomSheet>
    </>
  );
};

export default Header;
