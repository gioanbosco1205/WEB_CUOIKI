import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  location?: string;
  priceRange?: [number | null, number | null];
  roomType?: string; // phòng trọ, căn hộ, ký túc xá,...
  areaRange?: [number | null, number | null];
  amenities?: string[]; // Các tiện ích: Wifi, Máy lạnh, Gác lửng, Gần trường...
  availableFrom?: string;
  coordinates?: [number, number];
  favoriteIds?: number[];
  distanceToSchool?: [number | null, number | null]; // khoảng cách đến trường
}


interface InitialStateTypes {
  filters: FiltersState;
  isFiltersFullOpen: boolean;
  viewMode: "grid" | "list";
}

export const initialState: InitialStateTypes = {
  filters: {
    location: "Thủ Dầu Một",
    priceRange: [null, null],
    roomType: "any",
    areaRange: [null, null],
    amenities: [],
    availableFrom: "any",
    coordinates: [106.6519, 10.9804],
    distanceToSchool: [null, null], // thêm này để tránh lỗi TS
  },
  isFiltersFullOpen: false,
  viewMode: "grid",
};




export const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    toggleFiltersFullOpen: (state) => {
      state.isFiltersFullOpen = !state.isFiltersFullOpen;
    },
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
  },
});

export const { setFilters, toggleFiltersFullOpen, setViewMode } =
  globalSlice.actions;

export default globalSlice.reducer;
