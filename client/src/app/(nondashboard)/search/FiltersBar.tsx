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
import { cn, cleanParams, formatPriceValue } from "@/lib/utils";


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

  // -----------------------------
  // 🔹 Update URL (Debounced)
  // -----------------------------
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

  // -----------------------------
  // 🔹 Handle Filter Change
  // -----------------------------
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

  // -----------------------------
  // 🔹 JSX
  // -----------------------------
  return (
    <div className="flex justify-between items-center w-full py-4 border-b border-gray-200 bg-white px-3">
      <div className="flex items-center gap-3 flex-wrap">
        {/* 🔘 Nút bộ lọc nâng cao */}
        <Button
          variant="outline"
          className={cn(
            "gap-2 rounded-xl border-primary-400 hover:bg-primary-500 hover:text-white",
            isFiltersFullOpen && "bg-primary-600 text-white"
          )}
          onClick={() => dispatch(toggleFiltersFullOpen())}
        >
          <Filter className="w-4 h-4" />
          <span>Bộ lọc</span>
        </Button>

        {/* 🔍 Ô tìm kiếm địa điểm */}
        <div className="flex items-center">
          <Input
            placeholder="Nhập địa điểm..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-56 rounded-l-xl rounded-r-none border-primary-400 border-r-0"
          />
          <Button
            className="rounded-r-xl border border-primary-400 shadow-none hover:bg-primary-700 hover:text-white"
            onClick={() => handleFilterChange("location", searchInput, null)}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {/* 💰 Giá tiền */}
        <div className="flex gap-2">
          <Select
            value={filters.priceRange?.[0]?.toString() || "any"}
            onValueChange={(v) => handleFilterChange("priceRange", v, true)}
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
            value={filters.priceRange?.[1]?.toString() || "any"}
            onValueChange={(v) => handleFilterChange("priceRange", v, false)}
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

        {/* 🏠 Loại phòng */}
        <Select
          value={filters.roomType || "any"}
          onValueChange={(v) => handleFilterChange("roomType", v, null)}
        >
          <SelectTrigger className="w-40 rounded-xl border-primary-400">
            <SelectValue placeholder="Loại phòng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Loại hình</SelectItem>
            <SelectItem value="phong_tro">Phòng trọ</SelectItem>
            <SelectItem value="can_ho">Căn hộ mini</SelectItem>
            <SelectItem value="nha_nguyen_can">Nhà nguyên căn</SelectItem>
            <SelectItem value="chung_cu">Chung cư</SelectItem>
            <SelectItem value="ky_tuc_xa">Ký túc xá</SelectItem>
            <SelectItem value="sleepbox">Sleepbox</SelectItem>
          </SelectContent>
        </Select>

        {/* 🚻 Giới tính */}
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

        {/* 📐 Diện tích */}
        <Select
          value={filters.areaRange?.[0]?.toString() || "any"}
          onValueChange={(v) => handleFilterChange("areaRange", v, true)}
        >
          <SelectTrigger className="w-34 rounded-xl border-primary-400">
            <SelectValue placeholder="Diện tích phòng ở" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Diện tích phòng ở</SelectItem>
            {[25, 40, 50, 75, 100].map((area) => (
              <SelectItem key={area} value={area.toString()}>
                {area.toLocaleString("vi-VN")}m2
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
