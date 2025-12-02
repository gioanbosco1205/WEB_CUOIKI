import * as z from "zod";
import { PropertyTypeEnum } from "@/lib/constants";

/* ================================================================
   PHẦN CŨ – GIỮ NGUYÊN 100% (không thay đổi gì cả)
   ================================================================ */
export const propertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  pricePerMonth: z.coerce.number().positive().min(0).int(),
  securityDeposit: z.coerce.number().positive().min(0).int(),
  applicationFee: z.coerce.number().positive().min(0).int(),
  isPetsAllowed: z.boolean(),
  isParkingIncluded: z.boolean(),
  photoUrls: z
    .array(z.instanceof(File))
    .min(1, "At least one photo is required"),
  amenities: z.string().min(1, "Amenities are required"),
  highlights: z.string().min(1, "Highlights are required"),
  beds: z.coerce.number().positive().min(0).max(10).int(),
  baths: z.coerce.number().positive().min(0).max(10).int(),
  squareFeet: z.coerce.number().int().positive(),
  propertyType: z.nativeEnum(PropertyTypeEnum),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

/* ================================================================
   MỚI THÊM: Vietnam Phone Schema (dùng chung cho 2 form bên dưới)
   ================================================================ */
const vietnamPhoneSchema = z
  .string()
  .trim()
  .regex(/^[0-9]+$/, "Số điện thoại chỉ được chứa chữ số")
  .refine((val) => val.length === 10 || val.length === 11, {
    message: "Số điện thoại phải có 10 hoặc 11 chữ số",
  })
  .refine((val) => {
    const validPrefixes = [
      // Viettel
      "032", "033", "034", "035", "036", "037", "038", "039",
      "086", "096", "097", "098",
      // Mobi
      "070", "076", "077", "078", "079", "089",
      // Vina
      "081", "082", "083", "084", "085", "088", "091", "094",
      // Vietnamobile
      "056", "058", "092",
      // Gmobile
      "059", "099",
    ];

    // Hỗ trợ số cũ 11 số kiểu 01xxxxxxxxx
    if (val.length === 11 && /^01[0-9]{9}$/.test(val)) return true;

    // Số mới 10 số
    return validPrefixes.some((p) => val.startsWith(p));
  }, {
    message: "Số điện thoại không hợp lệ (VD đúng: 0901234567, 0321234567)",
  });

/* ================================================================
   APPLICATION SCHEMA – CHỈ THAY ĐỔI phoneNumber (giữ nguyên các field cũ)
   ================================================================ */
export const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: vietnamPhoneSchema, // ← Thay mới, chặt chẽ hơn rất nhiều
  message: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

/* ================================================================
   SETTINGS SCHEMA – Cũng chỉ thay phoneNumber
   ================================================================ */
export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: vietnamPhoneSchema, // ← Dùng chung schema chuẩn VN
});

export type SettingsFormData = z.infer<typeof settingsSchema>;