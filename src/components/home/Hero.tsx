"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import Link from "next/link";

const particles = [
  { width: "120px", height: "80px", top: "10%", left: "8%" },
  { width: "90px", height: "110px", top: "20%", left: "75%" },
  { width: "140px", height: "90px", top: "55%", left: "15%" },
  { width: "100px", height: "100px", top: "65%", left: "70%" },
  { width: "80px", height: "120px", top: "35%", left: "50%" },
  { width: "150px", height: "70px", top: "75%", left: "40%" },
  { width: "110px", height: "95px", top: "5%", left: "55%" },
  { width: "95px", height: "130px", top: "45%", left: "85%" },
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(titleRef.current, {
        y: -80,
        opacity: 0,
        duration: 1.2,
        ease: "power4.out",
      });

      gsap.from(subtitleRef.current, {
        y: 60,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power3.out",
      });

      gsap.from(buttonRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.8,
        delay: 0.8,
        ease: "back.out(1.7)",
      });

      if (particlesRef.current) {
        const particleElements = Array.from(particlesRef.current.children);

        particleElements.forEach((particle, index) => {
          gsap.to(particle, {
            y: index % 2 === 0 ? -20 : 20,
            x: index % 3 === 0 ? 15 : -15,
            duration: 3 + index * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          });
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={heroRef}
      className="resort-hero relative h-[650px] flex items-center justify-center overflow-hidden"
    >
      {/* Animated Particles */}
      <div
        ref={particlesRef}
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        {particles.map((particle, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: particle.width,
              height: particle.height,
              top: particle.top,
              left: particle.left,
              filter: "blur(40px)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        <h1
          ref={titleRef}
          className="resort-hero__title text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Welcome to
          <span className="block text-yellow-300">Blue Ocean Resort</span>
        </h1>

        <p
          ref={subtitleRef}
          className="resort-hero__subtitle text-xl md:text-2xl text-white/90 mb-10"
        >
          Experience luxury, tranquility, and the beauty of the ocean at
          Cox&apos;s Bazar
        </p>

        <div
          ref={buttonRef}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/rooms"
            className="btn-primary px-10 py-4 text-lg rounded-full inline-block text-center"
          >
            Explore Rooms
          </Link>

          <Link
            href="/about"
            className="btn-primary px-10 py-4 text-lg rounded-full inline-block text-center"
          >
            Learn More
          </Link>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg
          className="w-full h-24"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,50 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z"
            fill="white"
          >
            <animate
              attributeName="d"
              dur="10s"
              repeatCount="indefinite"
              values="
                M0,50 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z;
                M0,50 C150,0 350,100 600,50 C850,0 1050,100 1200,50 L1200,120 L0,120 Z;
                M0,50 C150,100 350,0 600,50 C850,100 1050,0 1200,50 L1200,120 L0,120 Z
              "
            />
          </path>
        </svg>
      </div>
    </div>
  );
}
