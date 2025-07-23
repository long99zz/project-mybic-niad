"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const totalSlides = 3; // We'll create 3 sample slides
  const sliderRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<number>(0);
  const currentTranslate = useRef<number>(0);
  const prevTranslate = useRef<number>(0);
  const animationID = useRef<number | null>(null);
  const autoSlideInterval = useRef<number | null>(null);

  useEffect(() => {
    startAutoSlide();

    return () => {
      if (autoSlideInterval.current) {
        clearInterval(autoSlideInterval.current);
      }
      if (animationID.current) {
        cancelAnimationFrame(animationID.current);
      }
    };
  }, []);

  const startAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
    }

    autoSlideInterval.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000) as unknown as number;
  };

  const pauseAutoSlide = () => {
    if (autoSlideInterval.current) {
      clearInterval(autoSlideInterval.current);
      autoSlideInterval.current = null;
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    pauseAutoSlide();
    startAutoSlide();
  };

  const getPositionX = (event: MouseEvent | TouchEvent) => {
    return "touches" in event
      ? event.touches[0].clientX
      : (event as MouseEvent).clientX;
  };

  const handleDragStart = (event: React.TouchEvent | React.MouseEvent) => {
    pauseAutoSlide();
    setIsDragging(true);
    startPos.current = getPositionX(event.nativeEvent);

    if (animationID.current) {
      cancelAnimationFrame(animationID.current);
    }

    if ("clientX" in event.nativeEvent) {
      event.preventDefault();
    }
  };

  const handleDragMove = (event: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;

    const currentPosition = getPositionX(event.nativeEvent);
    currentTranslate.current =
      prevTranslate.current + currentPosition - startPos.current;

    // Prevent default to stop scrolling when swiping on touch devices
    if ("touches" in event.nativeEvent) {
      event.preventDefault();
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    const movedBy = currentTranslate.current - prevTranslate.current;

    // If moved enough negative (swipe left), go to next slide
    if (movedBy < -100 && currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }

    // If moved enough positive (swipe right), go to previous slide
    if (movedBy > 100 && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }

    // If at the first slide and swiping right, go to the last slide
    if (movedBy > 100 && currentSlide === 0) {
      setCurrentSlide(totalSlides - 1);
    }

    // If at the last slide and swiping left, go to the first slide
    if (movedBy < -100 && currentSlide === totalSlides - 1) {
      setCurrentSlide(0);
    }

    prevTranslate.current = currentTranslate.current;
    startAutoSlide();
  };

  // Sample slides data
  const slides = [
    {
      image: "/Ngay-Vang-83.png",
      alt: "Ngày Vàng 8/3",
    },
    {
      image: "/tnds-oto.png",
      alt: "Bảo hiểm TNDS ô tô",
    },
    {
      image: "/products/bic-cyber-risk.png",
      alt: "Bảo hiểm Cyber Risk",
    },
  ];

  return (
    <div
      ref={sliderRef}
      className="relative w-full overflow-hidden cursor-grab"
      style={{ height: "min(100vh - 82px, 42vw)" }}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onMouseDown={handleDragStart}
      onMouseMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {/* Full-width image container */}
          <div className="relative w-full h-full flex items-center justify-center bg-[#f5f5f5]">
            <img
              src={slide.image || "/placeholder.svg"}
              alt={slide.alt}
              className="h-full w-auto max-w-none"
            />

            {/* Slider dots - positioned relative to image */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 z-20">
              {Array.from({ length: totalSlides }).map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    dotIndex === currentSlide
                      ? "bg-[#2a8b7d]"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => goToSlide(dotIndex)}
                  aria-label={`Go to slide ${dotIndex + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Visual indicator for swipe */}
      <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2 flex justify-between px-4 sm:px-3 xs:px-2 pointer-events-none">
        <div
          className={`bg-white/30 rounded-full p-2 sm:p-1.5 xs:p-1 transition-opacity ${
            isDragging ? "opacity-50" : "opacity-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#2a8b7d] sm:w-5 sm:h-5 xs:w-4 xs:h-4"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <div
          className={`bg-white/30 rounded-full p-2 sm:p-1.5 xs:p-1 transition-opacity ${
            isDragging ? "opacity-50" : "opacity-0"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-[#2a8b7d] sm:w-5 sm:h-5 xs:w-4 xs:h-4"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}
