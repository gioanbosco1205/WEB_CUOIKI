"use client";

import { CustomFormField } from "@/components/FormField";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";
import { PropertyFormData, propertySchema } from "@/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import { AmenityEnum, HighlightEnum, PropertyTypeEnum } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";

const NewProperty = () => {
  const [createProperty] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      name: "",
      description: "",
      pricePerMonth: 1000,
      securityDeposit: 500,
      applicationFee: 100,
      isPetsAllowed: true,
      isParkingIncluded: true,
      photoUrls: [],
      amenities: "",
      highlights: "",
      beds: 1,
      baths: 1,
      squareFeet: 1000,
      address: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
    },
  });

  const onSubmit = async (data: PropertyFormData) => {
    console.log("Biểu mẫu được gửi với dữ liệu:", data);

    if (!authUser?.cognitoInfo?.userId) {
      throw new Error("Không tìm thấy mã người quản lý (manager ID).");
    }

    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "photoUrls") {
        const files = value as File[];
        files.forEach((file: File) => formData.append("photos", file));
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    formData.append("managerCognitoId", authUser.cognitoInfo.userId);
    await createProperty(formData);
  };

  return (
    <div className="dashboard-container">
      <Header
        title="Thêm mới bất động sản"
        subtitle="Tạo danh sách bất động sản mới với đầy đủ thông tin chi tiết"
      />

      <div className="bg-white rounded-xl p-6">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-4 space-y-10"
          >
            {/* Thông tin cơ bản */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Thông tin cơ bản
              </h2>
              <div className="space-y-4">
                <CustomFormField name="name" label="Tên bất động sản" />
                <CustomFormField
                  name="description"
                  label="Mô tả chi tiết"
                  type="textarea"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Phí */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Phí</h2>
              <CustomFormField
                name="pricePerMonth"
                label="Giá thuê hàng tháng (VND)"
                type="number"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomFormField
                  name="securityDeposit"
                  label="Tiền đặt cọc (VND)"
                  type="number"
                />
                <CustomFormField
                  name="applicationFee"
                  label="Phí đăng ký (VND)"
                  type="number"
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Chi tiết phòng */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                Chi tiết bất động sản
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField
                  name="beds"
                  label="Số phòng ngủ"
                  type="number"
                />
                <CustomFormField
                  name="baths"
                  label="Số phòng tắm"
                  type="number"
                />
                <CustomFormField
                  name="squareFeet"
                  label="Diện tích (m²)"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <CustomFormField
                  name="isPetsAllowed"
                  label="Cho phép thú cưng"
                  type="switch"
                />
                <CustomFormField
                  name="isParkingIncluded"
                  label="Bao gồm chỗ đậu xe"
                  type="switch"
                />
              </div>

              <div className="mt-4">
                <CustomFormField
                  name="propertyType"
                  label="Loại bất động sản"
                  type="select"
                  options={Object.keys(PropertyTypeEnum).map((type) => ({
                    value: type,
                    label: type,
                  }))}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Tiện ích và điểm nổi bật */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Tiện ích & điểm nổi bật
              </h2>
              <div className="space-y-6">
                <CustomFormField
                  name="amenities"
                  label="Tiện ích"
                  type="select"
                  options={Object.keys(AmenityEnum).map((amenity) => ({
                    value: amenity,
                    label: amenity,
                  }))}
                />
                <CustomFormField
                  name="highlights"
                  label="Điểm nổi bật"
                  type="select"
                  options={Object.keys(HighlightEnum).map((highlight) => ({
                    value: highlight,
                    label: highlight,
                  }))}
                />
              </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Ảnh */}
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Hình ảnh bất động sản
              </h2>
              <CustomFormField
                name="photoUrls"
                label="Tải ảnh lên"
                type="file"
                accept="image/*"
              />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Thông tin bổ sung */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">
                Thông tin bổ sung
              </h2>

              <CustomFormField name="address" label="Địa chỉ" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CustomFormField name="city" label="Thành phố" />
                <CustomFormField name="state" label="Tỉnh/Thành" />
                <CustomFormField name="postalCode" label="Mã bưu điện" />
              </div>

              <CustomFormField name="country" label="Khu vực" />
            </div>

            <Button
              type="submit"
              className="bg-primary-700 text-white w-full mt-8"
            >
              Lưu thông tin bất động sản
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;
