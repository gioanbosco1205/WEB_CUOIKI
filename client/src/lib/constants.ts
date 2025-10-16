import {
  Wifi,
  Waves,
  Dumbbell,
  Car,
  PawPrint,
  Tv,
  Thermometer,
  Cigarette,
  Cable,
  Maximize,
  Bath,
  Phone,
  Sprout,
  Hammer,
  Bus,
  Mountain,
  VolumeX,
  Home,
  Warehouse,
  Building,
  Castle,
  Trees,
  LucideIcon,
  BedSingle,
} from "lucide-react";

import {
  Bed,
  Building2,
  Users,
} from "lucide-react";

// =========================
// 🎯 New Room Type for Filter
// =========================

export enum RoomTypeEnum {
  PHONG_TRO = "Phòng trọ",
  CAN_HO = "Căn hộ mini",
  NHA_NGUYEN_CAN = "Nhà nguyên căn",
  CHUNG_CU = "Chung cư",
  KY_TUC_XA = "Ký túc xá",
  SLEEPBOX = "Sleepbox",
}

export const RoomTypeIcons: Record<RoomTypeEnum, LucideIcon> = {
  [RoomTypeEnum.PHONG_TRO]: Bed,
  [RoomTypeEnum.CAN_HO]: Building2,
  [RoomTypeEnum.NHA_NGUYEN_CAN]: Home,
  [RoomTypeEnum.CHUNG_CU]: Building,
  [RoomTypeEnum.KY_TUC_XA]: Users,
  [RoomTypeEnum.SLEEPBOX]: BedSingle,
};
// =========================


// =========================
// 🎯 Tiện ích sinh viên quan tâm
// =========================
export enum AmenityEnum {
  WiFi = "WiFi",
  AirConditioning = "Điều hòa",
  WasherDryer = "Máy giặt/sấy",
  Parking = "Chỗ đậu xe",
  PetsAllowed = "Cho phép thú cưng",
  Gym = "Phòng tập",
  NearSchool = "Gần trường",
}

export const AmenityIcons: Record<AmenityEnum, LucideIcon> = {
  [AmenityEnum.WiFi]: Wifi,
  [AmenityEnum.AirConditioning]: Thermometer, // ✅ dùng enum key
  [AmenityEnum.WasherDryer]: Waves,
  [AmenityEnum.Parking]: Car,
  [AmenityEnum.PetsAllowed]: PawPrint,
  [AmenityEnum.Gym]: Dumbbell,
  [AmenityEnum.NearSchool]: Building2,
};
// =========================




export enum HighlightEnum {
  HighSpeedInternetAccess = "HighSpeedInternetAccess",
  WasherDryer = "WasherDryer",
  AirConditioning = "AirConditioning",
  Heating = "Heating",
  SmokeFree = "SmokeFree",
  CableReady = "CableReady",
  SatelliteTV = "SatelliteTV",
  DoubleVanities = "DoubleVanities",
  TubShower = "TubShower",
  Intercom = "Intercom",
  SprinklerSystem = "SprinklerSystem",
  RecentlyRenovated = "RecentlyRenovated",
  CloseToTransit = "CloseToTransit",
  GreatView = "GreatView",
  QuietNeighborhood = "QuietNeighborhood",
}

export const HighlightIcons: Record<HighlightEnum, LucideIcon> = {
  HighSpeedInternetAccess: Wifi,
  WasherDryer: Waves,
  AirConditioning: Thermometer,
  Heating: Thermometer,
  SmokeFree: Cigarette,
  CableReady: Cable,
  SatelliteTV: Tv,
  DoubleVanities: Maximize,
  TubShower: Bath,
  Intercom: Phone,
  SprinklerSystem: Sprout,
  RecentlyRenovated: Hammer,
  CloseToTransit: Bus,
  GreatView: Mountain,
  QuietNeighborhood: VolumeX,
};


export enum PropertyTypeEnum {
  Rooms = "Rooms",
  Tinyhouse = "Tinyhouse",
  Apartment = "Apartment",
  Villa = "Villa",
  Townhouse = "Townhouse",
  Cottage = "Cottage",
}

export const PropertyTypeIcons: Record<PropertyTypeEnum, LucideIcon> = {
  Rooms: Home,
  Tinyhouse: Warehouse,
  Apartment: Building,
  Villa: Castle,
  Townhouse: Home,
  Cottage: Trees,
};


// Add this constant at the end of the file
export const NAVBAR_HEIGHT = 50; // in pixels

// Test users for development
export const testUsers = {
  tenant: {
    username: "Carol White",
    userId: "us-east-2:76543210-90ab-cdef-1234-567890abcdef",
    signInDetails: {
      loginId: "carol.white@example.com",
      authFlowType: "USER_SRP_AUTH",
    },
  },
  tenantRole: "tenant",
  manager: {
    username: "John Smith",
    userId: "us-east-2:12345678-90ab-cdef-1234-567890abcdef",
    signInDetails: {
      loginId: "john.smith@example.com",
      authFlowType: "USER_SRP_AUTH",
    },
  },
  managerRole: "manager",
};
