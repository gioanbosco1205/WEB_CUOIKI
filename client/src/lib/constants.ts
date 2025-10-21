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
  Building2,
  Bed,
  Users,
} from "lucide-react";

/* =========================
 🎯 Room Types
========================= */
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

/* =========================
 🎯 Amenities (Tiện ích)
========================= */
export enum AmenityEnum {
  Dishwasher = "Dishwasher",
  HighSpeedInternet = "HighSpeedInternet",
  HardwoodFloors = "HardwoodFloors",
  WalkInClosets = "WalkInClosets",
  Microwave = "Microwave",
  Refrigerator = "Refrigerator",
  Pool = "Pool",
  Gym = "Gym",
  Parking = "Parking",
  PetsAllowed = "PetsAllowed",
  WiFi = "WiFi",
}

export const AmenityIcons: Record<AmenityEnum, LucideIcon> = {
  [AmenityEnum.WiFi]: Wifi,
  [AmenityEnum.Gym]: Dumbbell,
  [AmenityEnum.Parking]: Car,
  [AmenityEnum.PetsAllowed]: PawPrint,
  [AmenityEnum.Dishwasher]: Waves,
  [AmenityEnum.HighSpeedInternet]: Thermometer,
  [AmenityEnum.HardwoodFloors]: Building2,
  [AmenityEnum.WalkInClosets]: Building2,
  [AmenityEnum.Microwave]: Building2,
  [AmenityEnum.Refrigerator]: Building2,
  [AmenityEnum.Pool]: Building2,
};

/* =========================
 🎯 Highlights
========================= */
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
  [HighlightEnum.HighSpeedInternetAccess]: Wifi,
  [HighlightEnum.WasherDryer]: Waves,
  [HighlightEnum.AirConditioning]: Thermometer,
  [HighlightEnum.Heating]: Thermometer,
  [HighlightEnum.SmokeFree]: Cigarette,
  [HighlightEnum.CableReady]: Cable,
  [HighlightEnum.SatelliteTV]: Tv,
  [HighlightEnum.DoubleVanities]: Maximize,
  [HighlightEnum.TubShower]: Bath,
  [HighlightEnum.Intercom]: Phone,
  [HighlightEnum.SprinklerSystem]: Sprout,
  [HighlightEnum.RecentlyRenovated]: Hammer,
  [HighlightEnum.CloseToTransit]: Bus,
  [HighlightEnum.GreatView]: Mountain,
  [HighlightEnum.QuietNeighborhood]: VolumeX,
};

/* =========================
 🎯 Property Types
========================= */
export enum PropertyTypeEnum {
  Rooms = "Rooms",
  Tinyhouse = "Tinyhouse",
  Apartment = "Apartment",
  Villa = "Villa",
  Townhouse = "Townhouse",
  Cottage = "Cottage",
}

export const PropertyTypeIcons: Record<PropertyTypeEnum, LucideIcon> = {
  [PropertyTypeEnum.Rooms]: Home,
  [PropertyTypeEnum.Tinyhouse]: Warehouse,
  [PropertyTypeEnum.Apartment]: Building,
  [PropertyTypeEnum.Villa]: Castle,
  [PropertyTypeEnum.Townhouse]: Home,
  [PropertyTypeEnum.Cottage]: Trees,
};

/* =========================
 🎯 Misc constants
========================= */
export const NAVBAR_HEIGHT = 50; // in pixels

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
