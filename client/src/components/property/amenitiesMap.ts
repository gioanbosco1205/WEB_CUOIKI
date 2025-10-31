import {
  Wifi,
  Droplets,
  Wind,
  Dumbbell,
  Car,
  PawPrint,
  Refrigerator,
  Bath,
  Home,
  Bus,
  VolumeX,
  Hammer,
  CigaretteOff,
  HouseWifi,
  Waves,
  WheatIcon,
  Microwave,
  Shirt,
  WashingMachine,
  Tv2,
  Tv,
  TreeDeciduous,
  Heater,
} from "lucide-react";
import { tree } from "next/dist/build/templates/app-page";

export const amenityMap: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  WiFi: { label: "Wi-Fi miễn phí", icon: HouseWifi },
  Dishwasher: { label: "Máy rửa chén", icon: Droplets },
  AirConditioning: { label: "Máy lạnh", icon: Wind },
  Gym: { label: "Phòng tập thể dục", icon: Dumbbell },
  Parking: { label: "Chỗ để xe", icon: Car },
  PetsAllowed: { label: "Cho phép thú cưng", icon: PawPrint },
  Refrigerator: { label: "Tủ lạnh", icon: Refrigerator },
  Pool: { label: "Hồ bơi", icon: Bath },
  WasherDryer: { label: "Máy giặt và máy sấy", icon: WashingMachine },
  Microwave: { label: "Lò vi sóng", icon: Microwave },
  WalkInClosets: { label: "Tủ quần áo", icon: Shirt },
  HardwoodFloors: { label: "Sàn gỗ", icon: TreeDeciduous },
};

export const highlightMap: Record<
  string,
  { label: string; icon: React.ElementType }
> = {
  CloseToTransit: { label: "Gần xe buýt", icon: Bus },
  QuietNeighborhood: { label: "Khu phố yên tĩnh", icon: VolumeX },
  RecentlyRenovated: { label: "Mới được cải tạo", icon: Hammer },
  GreatView: { label: "Tầm nhìn đẹp", icon: Home },
  SmokeFree: { label: "Cấm hút thuốc", icon: CigaretteOff },
  HighSpeedInternetAccess: { label: "Internet tốc độ cao", icon: Wifi },
  TubShower: { label: "Bồn tắm & vòi sen", icon: Bath },
  SatelliteTV: { label: "Truyền hình vệ tinh", icon: Tv },
  Heating: { label: "Hệ thống sưởi", icon: Heater },
};
