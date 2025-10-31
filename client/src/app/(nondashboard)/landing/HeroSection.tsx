"use client"
import React from 'react'
import Image from 'next/image'
import {motion} from 'framer-motion'
import { Input } from '@/components/ui/input'
import {Button} from '@/components/ui/button'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { setFilters } from '@/state'


const HeroSection = () => {

    const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async () => {
    try {
      const trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return;

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          trimmedQuery
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: trimmedQuery,
            latitude: lat,
            longitude: lng,
          })
        );
        const params = new URLSearchParams({
          location: trimmedQuery,
          lat: lat.toString(),
          lng: lng,
        });
        router.push(`/search?${params.toString()}`);
      }
    } catch (error) {
      console.error("error search location:", error);
    }
  };

  return (
    <div className=" relative h-screen">
        <Image
        src ="/landing-splash.jpg"
        alt ="Rentiful Rental Platform Hero Section"
        fill 
        className = "object-cover object-center"
        priority
        />
        <div className =" absolute inset-0 bg-black bg-opacity-60"></div>
        <motion.div
            initial ={{opacity:0, y:20}}
            animate ={{opacity:1, y:0}}
            transition={{duration:0.8}}
            className="absolute top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center w-full"
        >
            <div className="max-w-4xl mx-auto px-16 sm:px-12">
                <h1 className="text text-5xl font-bold text-white mb-4">
                Bắt đầu hành trình tìm phòng thuê lý tưởng cho sinh viên ngay hôm nay!
                </h1>
                <p className=" text-xl text-white mb-8">
                Khám phá nhiều loại phòng cho thuê sinh viên phù hợp với nhu cầu của bạn. Đăng ký ngay và tìm không gian sống lý tưởng thật dễ dàng!
                </p>

                <div className="flex justify-center">
                    <Input
                        type="text"
                        value ={searchQuery}
                        onChange ={(e) => setSearchQuery(e.target.value)}
                        placeholder="Phân loại theo thành phố, khu phố hoặc trường đại học"
                        className = "w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12"
                    />
                    
                    <Button 
                        onClick={handleLocationSearch}
                        className="bg-secondary-500 text-while rounded-none rounded-r-xl border-non  hover:bg-secondary-600 h-12 " 
                    >
                        Tìm kiếm
                    </Button>
                </div>
            </div>
        </motion.div>
    </div>
  )
}

export default HeroSection