"use client";

import { useState, useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Logo from "./Logo";
import LoginForm from "./LoginForm";
import Onboarding from "./Onboarding";

export default function ConnectPage() {
  const { isConnected } = useAccount();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const logoGroupRef = useRef<HTMLDivElement>(null);
  const loginContentRef = useRef<HTMLDivElement>(null);
  const onboardingContentRef = useRef<HTMLDivElement>(null);
  const background1Ref = useRef<HTMLDivElement>(null);
  const background2Ref = useRef<HTMLDivElement>(null);

  const handleLoginComplete = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
  };

  const handleAnimationComplete = () => {
    setTimeout(() => {
      setShowOnboarding(true);
      setIsTransitioning(false);
    }, 200);
  };

  useEffect(() => {
    setShowOnboarding(false);
    setIsTransitioning(false);
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (isConnected && !isTransitioning && hasInitialized) {
      const timer = setTimeout(() => handleLoginComplete(), 1000);
      return () => clearTimeout(timer);
    }
  }, [isConnected, isTransitioning, hasInitialized]);

  useGSAP(() => {
    if (!isTransitioning) return;

    const logoElement = logoGroupRef.current;
    const loginElement = loginContentRef.current;
    const background1Element = background1Ref.current;
    const background2Element = background2Ref.current;
    
    if (!logoElement || !loginElement || !background1Element || !background2Element) return;

    const originalRect = logoElement.getBoundingClientRect();
    const maxUpwardMovement = originalRect.top - 20;
    
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(logoElement, {
          position: "fixed",
          top: 20,
          left: "50%",
          x: "-50%",
          y: 0,
          scale: 0.8,
          zIndex: 1000,
        });
        handleAnimationComplete();
      },
    });
    
    tl.to(background1Element, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.inOut",
    })
    .to(background2Element, {
      opacity: 1,
      duration: 1.2,
      ease: "power2.inOut",
    }, "-=1.0")
    .to(logoElement, {
      y: -maxUpwardMovement,
      scale: 0.8,
      duration: 1.1,
      ease: "power2.inOut",
    }, "-=0.8")
    .to(loginElement, {
      opacity: 0,
      duration: 0.5,
      ease: "power2.out"
    }, "-=0.3");
  }, [isTransitioning]);

  return (
    <div className="min-h-screen flex flex-col bg-white overflow-hidden relative">
      <div 
        ref={background1Ref}
        className="absolute inset-0 bg-no-repeat bg-[position:center_-200px] bg-[length:100%_auto]"
        style={{
          backgroundImage: `url('/background/bg_login.png')`,
        }}
      />
      
      <div 
        ref={background2Ref}
        className="absolute inset-0 bg-no-repeat bg-[position:center_-110px] bg-[length:100%_auto] opacity-0"
        style={{
          backgroundImage: `url('/background/bg_onboarding.png')`,
        }}
      />
      
      <div className="flex-1 flex items-center justify-center relative z-10">
        <Logo ref={logoGroupRef} />
      </div>

      <div className="relative pb-6 flex flex-col items-center justify-end z-10">
        {!showOnboarding ? (
          <LoginForm
            ref={loginContentRef}
            isConnected={isConnected}
            onLogin={handleLoginComplete}
          />
        ) : (
          <Onboarding ref={onboardingContentRef} />
        )}
      </div>
    </div>
  );
}
