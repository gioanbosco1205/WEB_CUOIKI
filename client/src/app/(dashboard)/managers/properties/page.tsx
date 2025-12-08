"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetManagerPropertiesQuery,
  useGetPropertiesQuery,
  useDeletePropertyMutation,
} from "@/state/api";
import React from "react";

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  // Manager view should list full inventory so they can manage all rooms
  const {
    data: allProperties,
    isLoading: isAllLoading,
    error: allError,
  } = useGetPropertiesQuery({});

  // Still fetch manager-owned properties so delete actions stay scoped
  const {
    data: managerProperties,
    isLoading: isManagerLoading,
  } = useGetManagerPropertiesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  //Thêm mutation xoá
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const handleDelete = async (propertyId: string) => {
    if (confirm("Bạn có chắc muốn xoá tin đăng này?")) {
      try {
        await deleteProperty(propertyId).unwrap();
      } catch (err) {
        alert("Đã xảy ra lỗi khi xoá tin đăng.");
      }
    }
  };
  

  if (isAllLoading || isManagerLoading) return <Loading />;
  if (allError) return <div>Error loading danh sách phòng</div>;

  return (
    <div className="dashboard-container">
      <Header
        title="Quản lý bất động sản"
        subtitle="Xem và quản lý các tin đăng của bạn"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allProperties?.map((property) => {
          const isOwned =
            managerProperties?.some((p) => p.id === property.id) ?? false;
          return (
            <div key={property.id} className="relative">
            <Card
              property={property}
              isFavorite={false}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/managers/properties/${property.id}`}
            />
            {isOwned && (
              <button
                onClick={() => handleDelete(property.id)}
                disabled={isDeleting}
                className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm"
              >
                Xoá
              </button>
            )}
          </div>
        );
        })}
      </div>
      {(!allProperties || allProperties.length === 0) && (
        <p>Chưa có phòng nào được đăng.</p>
      )}
    </div>
  );
};

export default Properties;
