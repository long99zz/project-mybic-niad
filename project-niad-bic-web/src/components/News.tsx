"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { newsData } from "../data/newsData"

export default function News() {
  const [slideIndex, setSlideIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [itemsPerRow, setItemsPerRow] = useState(3)
  const [itemWidth, setItemWidth] = useState(0)

  // Xác định số lượng tin tức hiển thị dựa trên kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setItemsPerRow(3) // Desktop: 3 tin tức mỗi hàng
      } else if (window.innerWidth >= 768) {
        setItemsPerRow(2) // Tablet: 2 tin tức mỗi hàng
      } else {
        setItemsPerRow(1) // Mobile: 1 tin tức mỗi hàng
      }

      // Tính toán chiều rộng của mỗi item
      if (containerRef.current) {
        const containerWidth = containerRef.current.clientWidth
        const gap = 24 // gap-6 = 1.5rem = 24px
        const calculatedWidth = (containerWidth - gap * (itemsPerRow - 1)) / itemsPerRow
        setItemWidth(calculatedWidth)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [itemsPerRow])

  // Tính toán số slide tối đa
  const maxSlides = Math.max(0, newsData.length - itemsPerRow)

  // Di chuyển sang phải
  const nextSlide = () => {
    if (slideIndex < maxSlides) {
      setSlideIndex(slideIndex + 1)
    }
  }

  // Di chuyển sang trái
  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1)
    }
  }

  // Tính toán translateX dựa trên slide hiện tại
  const getTranslateX = () => {
    if (itemWidth === 0) return 0
    const gapWidth = 24 // gap-6 = 1.5rem = 24px
    return -slideIndex * (itemWidth + gapWidth)
  }

  // Kiểm tra xem có thể trượt sang phải không
  const canSlideNext = slideIndex < maxSlides

  // Kiểm tra xem có thể trượt sang trái không
  const canSlidePrev = slideIndex > 0

  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Tiêu đề */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-0.5 bg-gray-400 mb-4"></div>
          <h2 className="text-3xl font-bold text-red-600">Tin tức</h2>
        </div>

        {/* Slider */}
        <div className="relative px-16">
          {/* Nút điều hướng trái */}
          <button
            onClick={prevSlide}
            className={`absolute left-[-30px] top-1/2 transform -translate-y-1/2 z-10 ${
              canSlidePrev ? "text-gray-600 hover:text-red-600" : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Previous slide"
            disabled={!canSlidePrev}
          >
            <ChevronLeft className="w-10 h-10" />
          </button>

          {/* Tin tức */}
          <div ref={containerRef} className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(${getTranslateX()}px)` }}
            >
              {newsData.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-md shadow-md overflow-hidden flex-shrink-0"
                  style={{ width: itemWidth > 0 ? `${itemWidth}px` : `calc(100% / ${itemsPerRow})` }}
                >
                  <a href={item.link} className="block">
                    <img 
                      src={item.image || "/placeholder.svg"} 
                      alt={item.title} 
                      className="w-full h-56 object-cover" 
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                    <div className="p-6">
                      <h3 className="font-medium text-gray-700 text-center mb-4 text-base">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.excerpt}</p>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Nút điều hướng phải */}
          <button
            onClick={nextSlide}
            className={`absolute right-[-30px] top-1/2 transform -translate-y-1/2 z-10 ${
              canSlideNext ? "text-gray-600 hover:text-red-600" : "text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Next slide"
            disabled={!canSlideNext}
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        </div>
      </div>
    </section>
  )
}

