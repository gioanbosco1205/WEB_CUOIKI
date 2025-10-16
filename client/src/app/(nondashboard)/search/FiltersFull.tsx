"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanParams, cn } from '@/lib/utils';
import { initialState, setFilters } from '@/state';
import { useAppSelector } from '@/state/redux';
import { debounce, set } from 'lodash';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { RoomTypeIcons, AmenityIcons } from '@/lib/constants';
import { Slider } from "@/components/ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const FiltersFull = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const [localFilters, setLocalFilters] = useState(initialState.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );

  const updateURL = debounce((newFilters: any) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  }, 400);


  const handleSubmit = () => {
    dispatch(setFilters(localFilters));
    updateURL(localFilters);
  }

  const handleReset = () => {
    setLocalFilters(initialState.filters);
    dispatch(setFilters(initialState.filters));
    updateURL(initialState.filters);
  };

  const handleAmenityChange = (amenity: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
  };

  const handleLocationSearch = async () => {
    try {
      if (!localFilters.location) return; // kiểm tra nếu chưa nhập địa điểm
  
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          localFilters.location
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
  
      const data = await response.json();
  
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setLocalFilters((prev) => ({
          ...prev,
          coordinates: [lng, lat],
        }));
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
    }
  };
  



  if (!isFiltersFullOpen) return null;
  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "pricePerMonth" || key === "squareFeet") {
      const currentArrayRange = [...(filters[key] || [null, null])];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };


  return <div
    className="bg-white rounded-lg px-4 h-full overflow-auto pb-10">
    <div className=" flex flex-col space-y-6 ">
      {/* Địa Điểm */}
      <div>
        <h4 className="font-bold mb-2">Địa điểm</h4>
        <div className="flex items-center">
          <Input
            placeholder="Nhập địa chỉ ..."
            value={filters.location}
            onChange={(e) =>
              setLocalFilters((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
            className="rounded-l-xl rounded-r-none border-r-0"
          />
          <Button
             onClick={handleLocationSearch}
            className="rounded-r-xl rounded-l-none border-l-none border-black shadow-none border hover:bg-primary-700 hover:text-primary-50"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Loại hình */}
      <div>
        <h4 className="font-bold mb-2">Loại hình</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(RoomTypeIcons).map(([type, Icon]) => (
            <div
              key={type}
              className={cn(
                "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
                localFilters.roomType === type
                  ? "border-black"
                  : "border-gray-200"
              )}
              onClick={() =>
                setLocalFilters((prev) => ({
                  ...prev,
                  propertyType: type as PropertyTypeEnum,
                }))
              }
            >
              <Icon className="w-6 h-6 mb-2" />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Giá tiền */}
      <div>
        <h4 className="font-bold mb-2">Giá tiền (Theo tháng)</h4>
        <Slider
          min={500000}
          max={10000000}
          step={500000}
          value={[
            (localFilters.pricePerMonth?.[0] ?? 500000),
            (localFilters.pricePerMonth?.[1] ?? 10000000),
          ]}
          onValueChange={(value: any) =>
            setLocalFilters((prev) => ({
              ...prev,
              priceRange: value as [number, number],
            }))
          }
        />
        <div className="flex justify-between mt-2">
          <span>{(localFilters.pricePerMonth?.[0] ?? 500000).toLocaleString("vi-VN")} đ</span>
          <span>{(localFilters.pricePerMonth?.[1] ?? 10000000).toLocaleString("vi-VN")} đ</span>
        </div>
      </div>
      {/* Diện tích */}
      <div>
        <h4 className="font-bold mb-2">Diện tích phòng ở</h4>
        <Slider
          min={25}
          max={100}
          step={5}
          value={[
            localFilters.squareFeet?.[0] ?? 25,
            localFilters.squareFeet?.[1] ?? 100,
          ]}
          onValueChange={(value) =>
            setLocalFilters((prev) => ({
              ...prev,
              areaRange: value as [number, number],
            }))
          }
          className="[&>.bar]:bg-primary-700"
        />
        <div className="flex justify-between mt-2">
          <span>{localFilters.squareFeet?.[0] ?? 25} m2</span>
          <span>{localFilters.squareFeet?.[1] ?? 100} m2</span>
        </div>
      </div>


      {/*Tien ich  */}
      <div>
        <h4 className="font-bold mb-2">Tiện ích</h4>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(AmenityIcons).map(([amenityKey, Icon]) => (
            <div
              key={amenityKey}
              className={cn(
                "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
                localFilters.amenities?.includes(amenityKey as AmenityEnum)
                  ? "border-black bg-primary-100" // nếu đã chọn
                  : "border-gray-200 bg-white"    // nếu chưa chọn
              )}
              onClick={() => {
                setLocalFilters((prev) => {
                  const current = prev.amenities || [];
                  const updated = current.includes(amenityKey as AmenityEnum)
                    ? current.filter(a => a !== amenityKey) // bỏ chọn
                    : [...current, amenityKey as AmenityEnum]; // thêm chọn
                  return { ...prev, amenities: updated };
                });
              }}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-sm text-center">{amenityKey}</span>
            </div>
          ))}
        </div>
      </div>


      {/* Nút Áp dụng và Đặt lại */}
      <div className="flex gap-4 mt-6">
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-primary-700 text-white rounded-xl"
        >
          Áp dụng
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          className="flex-1 rounded-xl"
        >
          Đặt lại
        </Button>
      </div>


    </div>
  </div>

}

export default FiltersFull