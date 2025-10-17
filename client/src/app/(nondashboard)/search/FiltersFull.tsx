"use client"
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cleanParams, cn } from '@/lib/utils';
import { initialState, setFilters } from '@/state';
import { useAppSelector } from '@/state/redux';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { RoomTypeIcons } from '@/lib/constants';
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
    }

    if (!isFiltersFullOpen) return null;
    const handleFilterChange = (
        key: string,
        value: any,
        isMin: boolean | null
      ) => {
        let newValue = value;
    
        if (key === "priceRange" || key === "areaRange") {
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
                        // onClick={handleLocationSearch}
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
              (localFilters.priceRange?.[0] ?? 500000),
              (localFilters.priceRange?.[1] ?? 10000000),
            ]}
            onValueChange={(value: any) =>
              setLocalFilters((prev) => ({
                ...prev,
                priceRange: value as [number, number],
              }))
            }
          />
          <div className="flex justify-between mt-2">
                <span>{(localFilters.priceRange?.[0] ?? 500000).toLocaleString("vi-VN")} đ</span>
                <span>{(localFilters.priceRange?.[1] ?? 10000000).toLocaleString("vi-VN")} đ</span>
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
              localFilters.areaRange?.[0] ?? 25,
              localFilters.areaRange?.[1] ?? 100,
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
            <span>{localFilters.areaRange?.[0] ?? 25} m2</span>
            <span>{localFilters.areaRange?.[1] ?? 100} m2</span>
          </div>
        </div>
        {/*Giới tính */}
        <div>
            <Select
                value={filters.gender || "any"}
                onValueChange={(v) => handleFilterChange("gender", v, null)}
            >
            <SelectTrigger className="w-28 rounded-xl border-primary-400">
                <SelectValue placeholder="Giới tính" />
            </SelectTrigger>
                <SelectContent>
                    <SelectItem value="any">Giới tính</SelectItem>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                </SelectContent>
            </Select>
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