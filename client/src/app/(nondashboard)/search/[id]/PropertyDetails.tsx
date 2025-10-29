import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons, AmenityEnum, HighlightEnum } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api";
import { HelpCircle } from "lucide-react";
import React from "react";
import { amenityMap, highlightMap } from "@/components/property/amenitiesMap";

const PropertyDetails = ({ propertyId }: { propertyId: number }) => {
  const { data: property, isError, isLoading } = useGetPropertyQuery(propertyId);

  if (isLoading) return <>Loading...</>;
  if (isError || !property) return <>Property not Found</>;

  return (
    <div className="mb-6">
     {/* Amenities */}
<div>
  <h2 className="text-xl font-semibold my-3">Tiện nghi phòng</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
    {property.amenities.map((amenity: string) => {
      const item = amenityMap[amenity];
      const Icon = item?.icon;
      return (
        <div
          key={amenity}
          className="flex flex-col items-center border rounded-xl py-8 px-4"
        >
          {Icon && <Icon className="w-8 h-8 mb-2 text-gray-700" />}
          <span className="text-sm text-center text-gray-700">
            {item?.label || amenity}
          </span>
        </div>
      );
    })}
  </div>
</div>

      {/* Highlights */}
<div className="mt-12 mb-16">
  <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100">
    Nổi bật
  </h3>
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-4 w-full">
    {property.highlights.map((highlight: string) => {
      const item = highlightMap[highlight];
      const Icon = item?.icon;
      return (
        <div
          key={highlight}
          className="flex flex-col items-center border rounded-xl py-8 px-4"
        >
          {Icon && (
            <Icon className="w-8 h-8 mb-2 text-primary-600 dark:text-primary-300" />
          )}
          <span className="text-sm text-center text-primary-600 dark:text-primary-300">
            {item?.label || highlight}
          </span>
        </div>
      );
    })}
  </div>
</div>


      {/* Tabs Section */}
      <div>
        <h3 className="text-xl font-semibold text-primary-800 dark:text-primary-100 mb-5">
          Phí và Chính Sách
        </h3>
        <p className="text-sm text-primary-600 dark:text-primary-300 mt-2">
        Các khoản phí dưới đây dựa trên dữ liệu do cộng đồng cung cấp và có thể không bao gồm
        các khoản phí và tiện ích bổ sung.
        </p>
        <Tabs defaultValue="required-fees" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="required-fees">Phí bắt buộc</TabsTrigger>
            <TabsTrigger value="pets">Thú cưng</TabsTrigger>
            <TabsTrigger value="parking">Bãi đỗ xe</TabsTrigger>
          </TabsList>
          <TabsContent value="required-fees" className="w-1/3">
            <p className="font-semibold mt-5 mb-2">One time move in fees</p>
            <hr />
            <div className="flex justify-between py-2 bg-secondary-50">
              <span className="text-primary-700 font-medium">Phí đăng ký phòng</span>
              <span className="text-primary-700">${property.applicationFee}</span>
            </div>
            <hr />
            <div className="flex justify-between py-2 bg-secondary-50">
              <span className="text-primary-700 font-medium">Tiền đặt cọc </span>
              <span className="text-primary-700">${property.securityDeposit}</span>
            </div>
            <hr />
          </TabsContent>
          <TabsContent value="pets">
            <p className="font-semibold mt-5 mb-2">
            {property.isPetsAllowed ? "Cho phép nuôi thú cưng" : "Không cho phép nuôi thú cưng"}
            </p>
          </TabsContent>
          <TabsContent value="parking">
            <p className="font-semibold mt-5 mb-2">
               {property.isParkingIncluded ? "Đã bao gồm chỗ đậu xe" : "Chưa bao gồm chỗ đậu xe"}
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyDetails;
