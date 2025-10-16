"use client";

import { forwardRef, useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

interface OnboardingProps {
  className?: string;
}

const Onboarding = forwardRef<HTMLDivElement, OnboardingProps>(
  ({ className = "" }, ref) => {
    const router = useRouter();
    const [selectedOption, setSelectedOption] = useState(0);
    const selectorRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const selectorContainerRef = useRef<HTMLDivElement>(null);
    const bottomContentRef = useRef<HTMLDivElement>(null);
    const getStartedButtonRef = useRef<HTMLButtonElement>(null);
    const backgroundCircleRef = useRef<HTMLDivElement>(null);
    const options = [
      { id: 0, label: "Local Stablecoin", content: "stablecoin", number: "14" },
      { id: 1, label: "RWA", content: "rwa", number: "12" },
      { id: 2, label: "Multi Chain", content: "multichain", number: "7" },
      { id: 3, label: "Partner", content: "partner", number: "5" }
    ];

    const handleTouchStart = (e: React.TouchEvent) => {
      setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return;
    };

    const findCenteredOption = () => {
      const container = selectorRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      const optionElements = Array.from(container.children) as HTMLElement[];
      let closestOption = 0;
      let minDistance = Infinity;

      optionElements.forEach((element, index) => {
        const elementRect = element.getBoundingClientRect();
        const elementCenter = elementRect.left + elementRect.width / 2;
        const distance = Math.abs(elementCenter - containerCenter);

        if (distance < minDistance) {
          minDistance = distance;
          closestOption = index;
        }
      });

      return closestOption;
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);

      setTimeout(() => {
        const centeredOption = findCenteredOption();
        setSelectedOption(centeredOption || 0);
      }, 50);
    };

    const handleScroll = () => {

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const centeredOption = findCenteredOption();
        if (centeredOption !== selectedOption) {
          setSelectedOption(centeredOption || 0);
        }
      }, 100);
    };

    const handleGetStartedClick = () => {
      if (!getStartedButtonRef.current) return;

      const tl = gsap.timeline();

      tl.to(getStartedButtonRef.current, {
        scale: 0.95,
        duration: 0.1,
        ease: "power2.out"
      })
        .to(getStartedButtonRef.current, {
          scale: 1.05,
          duration: 0.15,
          ease: "back.out(1.7)"
        })
        .to(getStartedButtonRef.current, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out"
        });

      gsap.to(getStartedButtonRef.current, {
        boxShadow: "0 0 20px rgba(96, 183, 230, 0.6)",
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });

      setTimeout(() => {
        router.push('/miniapp/dashboard');
      }, 400);
    };

    useGSAP(() => {
      if (!selectorRef.current || isDragging) return;

      const container = selectorRef.current;
      const options = Array.from(container.children) as HTMLElement[];
      const selectedElement = options[selectedOption];

      if (selectedElement) {
        const containerWidth = container.offsetWidth;
        const elementWidth = selectedElement.offsetWidth;
        const elementLeft = selectedElement.offsetLeft;

        const scrollTo = elementLeft - (containerWidth / 2) + (elementWidth / 2);

        gsap.killTweensOf(container);
        gsap.to(container, {
          scrollTo: { x: scrollTo },
          duration: 0.6,
          ease: "power2.out"
        });
      }
    }, [selectedOption, isDragging]);


    useEffect(() => {
      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    useGSAP(() => {
      if (!contentRef.current || !selectorContainerRef.current || !bottomContentRef.current) return;

      gsap.set(contentRef.current, { opacity: 0, y: 30 });
      gsap.set(selectorContainerRef.current, { opacity: 0, y: 20 });
      gsap.set(bottomContentRef.current, { opacity: 0, y: 20 });

      const tl = gsap.timeline();

      tl.to(contentRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out"
      })
        .to(selectorContainerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        }, "-=0.2")
        .to(bottomContentRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        }, "-=0.1");

    }, [backgroundCircleRef.current]);

    const renderContent = () => {
      switch (selectedOption) {
        case 0:
          return (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 });
                }
              }}>
                <Image
                  src="/assets/onboarding/stablecoin_group1.png"
                  alt="Stablecoin Group 1"
                  width={200}
                  height={36}
                  className="object-contain"
                />
              </div>

              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
                }
              }}>
                <Image
                  src="/assets/onboarding/stablecoin_group2.png"
                  alt="Stablecoin Group 2"
                  width={240}
                  height={32}
                  className="object-contain"
                />
              </div>

              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.5 });
                }
              }}>
                <Image
                  src="/assets/onboarding/stablecoin_group3.png"
                  alt="Stablecoin Group 3"
                  width={240}
                  height={32}
                  className="object-contain"
                />
              </div>
            </div>
          );
        case 1:
          return (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 });
                }
              }}>
                <Image
                  src="/assets/onboarding/rwa_group1.png"
                  alt="RWA Group 1"
                  width={160}
                  height={28}
                  className="object-contain"
                />
              </div>

              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
                }
              }}>
                <Image
                  src="/assets/onboarding/rwa_group2.png"
                  alt="RWA Group 2"
                  width={170}
                  height={24}
                  className="object-contain"
                />
              </div>

              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.5 });
                }
              }}>
                <Image
                  src="/assets/onboarding/rwa_group3.png"
                  alt="RWA Group 3"
                  width={120}
                  height={20}
                  className="object-contain"
                />
              </div>
            </div>
          );
        case 2:
          return (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 });
                }
              }}>
                <Image
                  src="/assets/onboarding/multichain_group1.png"
                  alt="Multi Chain Group 1"
                  width={80}
                  height={25}
                  className="object-contain"
                />
              </div>

              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
                }
              }}>
                <Image
                  src="/assets/onboarding/multichain_group2.png"
                  alt="Multi Chain Group 2"
                  width={120}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
          );
        case 3:
          return (
            <div className="flex flex-col items-center space-y-4">
              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.1 });
                }
              }}>
                <Image
                  src="/assets/onboarding/partner_group1.png"
                  alt="Partner Group 1"
                  width={320}
                  height={28}
                  className="object-contain"
                />
              </div>

              <div className="flex justify-center" ref={(el) => {
                if (el) {
                  gsap.set(el, { opacity: 0, y: 20 });
                  gsap.to(el, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", delay: 0.3 });
                }
              }}>
                <Image
                  src="/assets/onboarding/partner_group2.png"
                  alt="Partner Group 2"
                  width={280}
                  height={28}
                  className="object-contain"
                />
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div
        ref={ref}
        className={`relative w-full flex flex-col items-center justify-center ${className}`}
      >
        <div ref={backgroundCircleRef} className="absolute inset-0 h-screen flex justify-center z-10 pointer-events-none -translate-y-8">
          <Image
            src="/background/bg_circle_onboarding.png"
            alt="Background curve"
            width={800}
            height={400}
            className="h-full w-auto object-cover"
          />
        </div>

        <div ref={contentRef} className="w-full mb-8 z-10 h-32 min-h-32 flex items-center justify-center">
          {renderContent()}
        </div>

        <div ref={selectorContainerRef} className="w-full z-10">
          <div
            ref={selectorRef}
            className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 pl-[50%] pr-[50%]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onScroll={handleScroll}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {options.map((option, index) => (
              <div
                key={option.id}
                className={`flex-shrink-0 cursor-pointer font-semibold text-lg transition-all duration-300 snap-center flex flex-col items-center ${selectedOption === index ? 'text-text' : 'text-text/40'
                  }`}
                onClick={() => setSelectedOption(index)}
              >
                <span
                  className={`text-text font-semibold text-lg ${selectedOption === index ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  {option.number}
                </span>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div ref={bottomContentRef} className="flex flex-col items-center z-10">
          <div className="flex justify-center">
            <Image
              src="/assets/onboarding/arrow.png"
              alt="Arrow pointing up"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>

          <div className="w-full flex flex-col items-center mt-4">
            <span className="text-center text-text/40 text-xs leading-relaxed">
              Effortless stablecoin lending
            </span>
            <span className="text-center text-text/40 text-xs leading-relaxed mb-3">
              and borrowing for everyone
            </span>
            <button
              ref={getStartedButtonRef}
              onClick={handleGetStartedClick}
              className="bg-primary text-white font-semibold text-sm py-3 px-11 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }
);

Onboarding.displayName = "Onboarding";

export default Onboarding;
