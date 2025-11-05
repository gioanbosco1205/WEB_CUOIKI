"use client";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/state/redux";
import { setFilters, setViewMode, toggleFiltersFullOpen } from "@/state";
import { usePathname, useRouter } from "next/navigation";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Grid, List, Search } from "lucide-react";
import { cn, cleanParams } from "@/lib/utils";
import { AmenityEnum, HighlightEnum,PropertyTypeLabels,PropertyTypeValues } from "@/lib/constants";

const FiltersBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [searchInput, setSearchInput] = useState(filters.location || "");

  // Debounce update URL
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

  // Handle generic filter change
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
    } else {
      newValue = value === "any" ? null : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  // Handle Amenity/Highlight change (single select)
  const handleAmenityChange = (value: string) => {
    const newFilters = {
      ...filters,
      amenities: value === "any" ? [] : [value],
    };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  // Handle location search
  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput
        )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&fuzzyMatch=true`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const newFilters = {
          ...filters,
          location: searchInput,
          longitude: lng,
          latitude: lat,
        };
        dispatch(setFilters(newFilters));
        updateURL(newFilters);
      }
    } catch (err) {
      console.error("Error fetching location data:", err);
    }
  };

  return (
    <div className="flex justify-between items-center w-full py-5">
      <div className="flex justify-between items-center gap-4 p-2">
        {/* Filter button */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-primary-100",
            isFiltersFullOpen && "bg-primary-700 text-primary-100"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="w-4 h-4" />
          <span>Bộ lọc</span>
        </Button>

        {/* Search location */}
        <div className="flex items-center">
          <Input
            placeholder="Nhập địa điểm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
          />
          <Button
            onClick={handleLocationSearch}
            className="rounded-r-xl rounded-l-none border-l-none border-primary-400 shadow-none border hover:bg-primary-700 hover:text-primary-50"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* Price range */}
        <div className="flex gap-2">
          <Select
            value={filters.pricePerMonth?.[0]?.toString() || "any"}
            onValueChange={(v) => handleFilterChange("pricePerMonth", v, true)}
          >
            <SelectTrigger className="w-34 rounded-xl border-primary-400">
              <SelectValue placeholder="Giá thấp nhất" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Số tiền tối thiểu</SelectItem>
              {[500000, 1000000, 2000000, 3000000, 5000000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  {price.toLocaleString("vi-VN")} ₫
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.pricePerMonth?.[1]?.toString() || "any"}
            onValueChange={(v) => handleFilterChange("pricePerMonth", v, false)}
          >
            <SelectTrigger className="w-34 rounded-xl border-primary-400">
              <SelectValue placeholder="Giá cao nhất" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Số tiền tối đa</SelectItem>
              {[2000000, 3000000, 5000000, 8000000, 10000000].map((price) => (
                <SelectItem key={price} value={price.toString()}>
                  {price.toLocaleString("vi-VN")} ₫
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Room type */}
        <Select
  value={filters.roomType || "any"}
  onValueChange={(v) => handleFilterChange("roomType", v, null)}
>
  <SelectTrigger className="w-40 rounded-xl border-primary-400">
    <SelectValue placeholder="Loại phòng" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="any">Loại hình</SelectItem>
    {Object.entries(PropertyTypeLabels).map(([typeEnum, label]) => (
      <SelectItem
        key={typeEnum}
        value={PropertyTypeValues[typeEnum as PropertyTypeEnum]}
      >
        {label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

        {/* Amenities & Highlight */}
        <Select
          value={filters.amenities?.[0] || "any"}
          onValueChange={(v) => handleAmenityChange(v)}
        >
          <SelectTrigger className="w-28 rounded-xl border-primary-400">
            <SelectValue placeholder="Tất cả tiện ích" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Tất cả tiện ích</SelectItem>
            <SelectItem value={AmenityEnum.WiFi}>Wi-Fi</SelectItem>
            <SelectItem value={AmenityEnum.Parking}>Bãi đỗ xe</SelectItem>
            <SelectItem value={HighlightEnum.AirConditioning}>Máy lạnh</SelectItem>
            <SelectItem value={HighlightEnum.CloseToTransit}>Gần trường</SelectItem>
          </SelectContent>
        </Select>

        {/* Area */}
        <Select
          value={filters.squareFeet?.[0]?.toString() || "any"}
          onValueChange={(v) => handleFilterChange("squareFeet", v, true)}
        >
          <SelectTrigger className="w-34 rounded-xl border-primary-400">
            <SelectValue placeholder="Diện tích phòng ở" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Diện tích phòng ở</SelectItem>
            {[25, 40, 50, 75, 100].map((area) => (
              <SelectItem key={area} value={area.toString()}>
                {area.toLocaleString("vi-VN")} m²
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* View mode */}
      <div className="flex justify-between items-center gap-4 p-2">
        <div className="flex border rounded-xl">
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-l-xl hover:bg-primary-600 hover:text-primary-50",
              viewMode === "list" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => dispatch(setViewMode("list"))}
          >
            <List className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "px-3 py-1 rounded-none rounded-r-xl hover:bg-primary-600 hover:text-primary-50",
              viewMode === "grid" ? "bg-primary-700 text-primary-50" : ""
            )}
            onClick={() => dispatch(setViewMode("grid"))}
          >
            <Grid className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;