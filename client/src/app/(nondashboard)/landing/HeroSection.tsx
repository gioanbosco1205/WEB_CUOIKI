"use client"
import React from 'react'
import Image from 'next/image'
import {motion} from 'framer-motion'
import { Input } from '@/components/ui/input'
import {Button} from '@/components/ui/button'
const HeroSection = () => {
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
                        value ="Tìm kiếm"
                        onChange ={() => {}}
                        placeholder="Sreach by city , neighborhood, or university"
                        className = "w-full max-w-lg rounded-none rounded-l-xl border-none bg-white h-12"
                    />
                    
                    <Button 
                        onClick={() => {}}
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