import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FiltersState {
  location?: string;
  priceRange?: [number | null, number | null];
  roomType?: string; // phòng trọ, căn hộ, ký túc xá,...
  areaRange?: [number | null, number | null];
  gender?: "male" | "female" | "any";
  amenities?: string[];
  availableFrom?: string;
  coordinates?: [number, number];
  favoriteIds?: number[];
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
    gender: "any",
    amenities: [],
    availableFrom: "any",
    coordinates: [106.65, 10.75], // VD: tọa độ mặc định Thủ Dầu Một
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
