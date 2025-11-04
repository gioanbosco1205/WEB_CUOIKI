"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cleanParams, cn } from "@/lib/utils";
import {
  AmenityEnum,
  AmenityIcons,
  AmenityLabels,
  PropertyTypeEnum,
  PropertyTypeIcons,
} from "@/lib/constants";
import { initialState, setFilters } from "@/state";
import { useAppSelector } from "@/state/redux";
import { debounce } from "lodash";
import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

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
  };

  const handleReset = () => {
    setLocalFilters(initialState.filters);
    dispatch(setFilters(initialState.filters));
    updateURL(initialState.filters);
  };

  const handleLocationSearch = async () => {
    try {
      if (!localFilters.location) return;
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

  return (
    <div className="bg-white rounded-lg px-4 h-full overflow-auto pb-10">
      <div className="flex flex-col space-y-6">
        {/* Địa điểm */}
        <div>
          <h4 className="font-bold mb-2">Địa điểm</h4>
          <div className="flex items-center">
            <Input
              placeholder="Nhập địa chỉ ..."
              value={localFilters.location}
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
              className="rounded-r-xl rounded-l-none border hover:bg-primary-700 hover:text-primary-50"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Loại hình phòng */}
        <div>
          <h4 className="font-bold mb-2">Loại hình chỗ ở</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
              <div
                key={type}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
                  localFilters.roomType === type
                    ? "border-black bg-primary-100"
                    : "border-gray-200 bg-white"
                )}
                onClick={() =>
                  setLocalFilters((prev) => ({
                    ...prev,
                    roomType: prev.roomType === type ? "" : type,
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
          <h4 className="font-bold mb-2">Giá tiền (theo tháng)</h4>
          <Slider
            min={500000}
            max={10000000}
            step={500000}
            value={[
              localFilters.pricePerMonth?.[0] ?? 500000,
              localFilters.pricePerMonth?.[1] ?? 10000000,
            ]}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                pricePerMonth: value as [number, number],
              }))
            }
          />
          <div className="flex justify-between mt-2 text-sm">
            <span>
              {(localFilters.pricePerMonth?.[0] ?? 500000).toLocaleString(
                "vi-VN"
              )}{" "}
              đ
            </span>
            <span>
              {(localFilters.pricePerMonth?.[1] ?? 10000000).toLocaleString(
                "vi-VN"
              )}{" "}
              đ
            </span>
          </div>
        </div>

        {/* Diện tích */}
        <div>
          <h4 className="font-bold mb-2">Diện tích phòng</h4>
          <Slider
            min={10}
            max={100}
            step={5}
            value={[
              localFilters.squareFeet?.[0] ?? 10,
              localFilters.squareFeet?.[1] ?? 100,
            ]}
            onValueChange={(value) =>
              setLocalFilters((prev) => ({
                ...prev,
                squareFeet: value as [number, number],
              }))
            }
          />
          <div className="flex justify-between mt-2 text-sm">
            <span>{localFilters.squareFeet?.[0] ?? 10} m²</span>
            <span>{localFilters.squareFeet?.[1] ?? 100} m²</span>
          </div>
        </div>

        {/* Tiện ích */}
        <div>
          <h4 className="font-bold mb-2">Tiện ích</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(AmenityIcons).map(([amenityKey, Icon]) => (
              <div
                key={amenityKey}
                className={cn(
                  "flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer",
                  localFilters.amenities?.includes(amenityKey as AmenityEnum)
                    ? "border-black bg-primary-100"
                    : "border-gray-200 bg-white"
                )}
                onClick={() =>
                  setLocalFilters((prev) => {
                    const current = prev.amenities || [];
                    const updated = current.includes(amenityKey as AmenityEnum)
                      ? current.filter((a) => a !== amenityKey)
                      : [...current, amenityKey as AmenityEnum];
                    return { ...prev, amenities: updated };
                  })
                }
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="text-sm text-center">
                  {AmenityLabels[amenityKey as AmenityEnum] || amenityKey}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Nút hành động */}
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
  );
};

export default FiltersFull;