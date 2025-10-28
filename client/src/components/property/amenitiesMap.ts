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
  } from "lucide-react";
  
  export const amenityMap: Record<
    string,
    { label: string; icon: React.ElementType }
  > = {
    WiFi: { label: "Wi-Fi miễn phí", icon: Wifi },
    Dishwasher: { label: "Máy rửa chén", icon: Droplets },
    AirConditioning: { label: "Máy lạnh", icon: Wind },
    Gym: { label: "Phòng tập thể dục", icon: Dumbbell },
    Parking: { label: "Chỗ để xe", icon: Car },
    PetsAllowed: { label: "Cho phép thú cưng", icon: PawPrint },
    Refrigerator: { label: "Tủ lạnh", icon: Refrigerator },
    Pool: { label: "Hồ bơi", icon: Bath },
  };
  
  export const highlightMap: Record<
    string,
    { label: string; icon: React.ElementType }
  > = {
    CloseToTransit: { label: "Gần xe buýt", icon: Bus },
    QuietNeighborhood: { label: "Khu phố yên tĩnh", icon: VolumeX },
    RecentlyRenovated: { label: "Mới được cải tạo", icon: Hammer },
    GreatView: { label: "Tầm nhìn đẹp", icon: Home },
  };
  