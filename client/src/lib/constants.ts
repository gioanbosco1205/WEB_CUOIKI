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
 🎯 Loại phòng (Room Types)
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
 🎯 Tiện ích (Amenities)
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

export const AmenityLabels: Record<AmenityEnum, string> = {
  [AmenityEnum.Dishwasher]: "Máy rửa chén",
  [AmenityEnum.HighSpeedInternet]: "Internet tốc độ cao",
  [AmenityEnum.HardwoodFloors]: "Sàn gỗ",
  [AmenityEnum.WalkInClosets]: "Tủ quần áo rộng",
  [AmenityEnum.Microwave]: "Lò vi sóng",
  [AmenityEnum.Refrigerator]: "Tủ lạnh",
  [AmenityEnum.Pool]: "Hồ bơi",
  [AmenityEnum.Gym]: "Phòng tập thể dục",
  [AmenityEnum.Parking]: "Bãi đỗ xe",
  [AmenityEnum.PetsAllowed]: "Cho phép thú cưng",
  [AmenityEnum.WiFi]: "Wi-Fi",
};

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
 🎯 Đặc điểm nổi bật (Highlights)
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

export const HighlightLabels: Record<HighlightEnum, string> = {
  [HighlightEnum.HighSpeedInternetAccess]: "Truy cập Internet tốc độ cao",
  [HighlightEnum.WasherDryer]: "Máy giặt và máy sấy",
  [HighlightEnum.AirConditioning]: "Điều hòa không khí",
  [HighlightEnum.Heating]: "Hệ thống sưởi",
  [HighlightEnum.SmokeFree]: "Khu vực không hút thuốc",
  [HighlightEnum.CableReady]: "Sẵn sàng truyền hình cáp",
  [HighlightEnum.SatelliteTV]: "Truyền hình vệ tinh",
  [HighlightEnum.DoubleVanities]: "Bồn rửa đôi",
  [HighlightEnum.TubShower]: "Bồn tắm & vòi sen",
  [HighlightEnum.Intercom]: "Hệ thống liên lạc nội bộ",
  [HighlightEnum.SprinklerSystem]: "Hệ thống phun nước chữa cháy",
  [HighlightEnum.RecentlyRenovated]: "Mới được cải tạo",
  [HighlightEnum.CloseToTransit]: "Gần phương tiện công cộng",
  [HighlightEnum.GreatView]: "Tầm nhìn đẹp",
  [HighlightEnum.QuietNeighborhood]: "Khu dân cư yên tĩnh",
};

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
 🎯 Loại bất động sản (Property Types)
========================= */
export enum PropertyTypeEnum {
  Rooms = "Rooms",
  Tinyhouse = "Tinyhouse",
  Apartment = "Apartment",
  Villa = "Villa",
  Townhouse = "Townhouse",
  Cottage = "Cottage",
}

export const PropertyTypeLabels: Record<PropertyTypeEnum, string> = {
  [PropertyTypeEnum.Rooms]: "Phòng",
  [PropertyTypeEnum.Tinyhouse]: "Nhà nhỏ",
  [PropertyTypeEnum.Apartment]: "Căn hộ",
  [PropertyTypeEnum.Villa]: "Biệt thự",
  [PropertyTypeEnum.Townhouse]: "Nhà phố",
  [PropertyTypeEnum.Cottage]: "Nhà gỗ",
};

export const PropertyTypeIcons: Record<PropertyTypeEnum, LucideIcon> = {
  [PropertyTypeEnum.Rooms]: Home,
  [PropertyTypeEnum.Tinyhouse]: Warehouse,
  [PropertyTypeEnum.Apartment]: Building,
  [PropertyTypeEnum.Villa]: Castle,
  [PropertyTypeEnum.Townhouse]: Home,
  [PropertyTypeEnum.Cottage]: Trees,
};

/* =========================
 🎯 Khác
========================= */
export const NAVBAR_HEIGHT = 50;

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
