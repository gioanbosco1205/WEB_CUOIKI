"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";

const ImagePreviews = ({ images }: ImagePreviewsProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handlePrev = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative flex justify-center items-center bg-gray-100 rounded-lg overflow-hidden">
  <div className="relative w-auto max-h-[550px]">
    <Image
      src={images[currentImageIndex]}
      alt={`Property Image ${currentImageIndex + 1}`}
      width={600}        // Chiều ngang tối đa
      height={800}       // Chiều dọc tự co
      className="object-contain rounded-lg"
    />
  </div>

  {/* Nút điều hướng */}
  <button
    onClick={handlePrev}
    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
  >
    <ChevronLeft className="text-white" />
  </button>
  <button
    onClick={handleNext}
    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
  >
    <ChevronRight className="text-white" />
  </button>
</div>

  );
};

export default ImagePreviews;
