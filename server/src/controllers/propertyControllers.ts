import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

// Lấy Mapbox token từ biến môi trường
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_TOKEN) {
  console.warn("⚠️ Chưa có Mapbox token! Hãy thêm NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN vào môi trường.");
}

/**
 * Lấy tọa độ từ Mapbox
 */
async function getCoordinatesMapbox(fullAddress: string): Promise<{ lat: number; lon: number }> {
  try {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json`;
    const response = await axios.get(url, {
      params: {
        access_token: MAPBOX_TOKEN,
        limit: 1,
        country: "VN",
      },
    });

    if (!response.data.features || response.data.features.length === 0) {
      console.warn(`❌ Không tìm thấy địa chỉ: ${fullAddress}`);
      return { lat: 0, lon: 0 };
    }

    const feature = response.data.features[0];
    const [lon, lat] = feature.center; // Mapbox trả về [longitude, latitude]
    return { lat, lon };
  } catch (err: any) {
    console.error("❌ Lỗi khi gọi Mapbox Geocoding:", err.message);
    return { lat: 0, lon: 0 };
  }
}

/**
 * Lấy danh sách bất động sản có lọc
 */
export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      favoriteIds,
      location,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      squareFeetMin,
      squareFeetMax,
      amenities,
      availableFrom,
      latitude,
      longitude,
    } = req.query;

    const whereConditions: Prisma.Sql[] = [];
    const roomTypeMap: Record<string, string> = {
  phong_tro: "ROOM",
  can_ho: "MINI_APARTMENT",
  nha_nguyen_can: "HOUSE",
  chung_cu: "APARTMENT",
  ky_tuc_xa: "DORMITORY",
  sleepbox: "SLEEPBOX",
};


    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`);
    }

    if (priceMin) whereConditions.push(Prisma.sql`p."pricePerMonth" >= ${Number(priceMin)}`);
    if (priceMax) whereConditions.push(Prisma.sql`p."pricePerMonth" <= ${Number(priceMax)}`);

    if (beds && beds !== "any") whereConditions.push(Prisma.sql`p.beds >= ${Number(beds)}`);
    if (baths && baths !== "any") whereConditions.push(Prisma.sql`p.baths >= ${Number(baths)}`);

    if (squareFeetMin)
      whereConditions.push(Prisma.sql`p."squareFeet" >= ${Number(squareFeetMin)}`);
    if (squareFeetMax)
      whereConditions.push(Prisma.sql`p."squareFeet" <= ${Number(squareFeetMax)}`);

    if (req.query.roomType && req.query.roomType !== "any") {
  const enumValue = roomTypeMap[req.query.roomType as string];
  if (enumValue) {
    whereConditions.push(
      Prisma.sql`p."propertyType" = ${enumValue}::"PropertyType"`
    );
  }
}

    if (amenities && amenities !== "any") {
      const arr = (amenities as string).split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${arr}::"Amenity"[]`);
    }

    if (location && typeof location === "string" && location.trim() !== "") {
      const locationTerm = `%${location.trim().toLowerCase()}%`;
      whereConditions.push(
        Prisma.sql`(
          LOWER(l.city) LIKE ${locationTerm}
          OR LOWER(l.state) LIKE ${locationTerm}
          OR LOWER(l.address) LIKE ${locationTerm}
          OR LOWER(p.name) LIKE ${locationTerm}
        )`
      );
    }

    if (availableFrom && availableFrom !== "any") {
      const date = new Date(availableFrom as string);
      if (!isNaN(date.getTime())) {
        whereConditions.push(
          Prisma.sql`NOT EXISTS (
            SELECT 1 FROM "Lease" l
            WHERE l."propertyId" = p.id
            AND l."endDate" >= ${date.toISOString()}
          )`
        );
      }
    }

    // if (latitude && longitude && latitude !== "null" && longitude !== "null" && latitude !== "" && longitude !== "") {
    //   const lat = parseFloat(latitude as string);
    //   const lng = parseFloat(longitude as string);
    
    //   const radiusInKm = 50;
    //   const degrees = radiusInKm / 111;
    
    //   whereConditions.push(
    //     Prisma.sql`ST_DWithin(
    //       ST_SetSRID(ST_MakePoint(l.longitude, l.latitude), 4326),
    //       ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
    //       ${degrees}
    //     )`
    //   );
    // }

    const completeQuery = Prisma.sql`
      SELECT
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'latitude', l.latitude,
          'longitude', l.longitude
        ) as location
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
    `;

    const result = await prisma.$queryRaw(completeQuery) as any[];
    
    // Transform snake_case fields to camelCase để đảm bảo frontend nhận đúng format
    const transformedResult = result.map((row: any) => {
      const transformed: any = { ...row };
      // Chuyển đổi manager_cognito_id thành managerCognitoId nếu có
      if (transformed.manager_cognito_id !== undefined && transformed.managerCognitoId === undefined) {
        transformed.managerCognitoId = transformed.manager_cognito_id;
        delete transformed.manager_cognito_id;
      }
      // Chuyển đổi các field khác nếu cần
      if (transformed.location_id !== undefined && transformed.locationId === undefined) {
        transformed.locationId = transformed.location_id;
        delete transformed.location_id;
      }
      if (transformed.posted_date !== undefined && transformed.postedDate === undefined) {
        transformed.postedDate = transformed.posted_date;
        delete transformed.posted_date;
      }
      if (transformed.price_per_month !== undefined && transformed.pricePerMonth === undefined) {
        transformed.pricePerMonth = transformed.price_per_month;
        delete transformed.price_per_month;
      }
      if (transformed.security_deposit !== undefined && transformed.securityDeposit === undefined) {
        transformed.securityDeposit = transformed.security_deposit;
        delete transformed.security_deposit;
      }
      if (transformed.application_fee !== undefined && transformed.applicationFee === undefined) {
        transformed.applicationFee = transformed.application_fee;
        delete transformed.application_fee;
      }
      if (transformed.square_feet !== undefined && transformed.squareFeet === undefined) {
        transformed.squareFeet = transformed.square_feet;
        delete transformed.square_feet;
      }
      if (transformed.property_type !== undefined && transformed.propertyType === undefined) {
        transformed.propertyType = transformed.property_type;
        delete transformed.property_type;
      }
      if (transformed.is_pets_allowed !== undefined && transformed.isPetsAllowed === undefined) {
        transformed.isPetsAllowed = transformed.is_pets_allowed;
        delete transformed.is_pets_allowed;
      }
      if (transformed.is_parking_included !== undefined && transformed.isParkingIncluded === undefined) {
        transformed.isParkingIncluded = transformed.is_parking_included;
        delete transformed.is_parking_included;
      }
      if (transformed.average_rating !== undefined && transformed.averageRating === undefined) {
        transformed.averageRating = transformed.average_rating;
        delete transformed.average_rating;
      }
      if (transformed.number_of_reviews !== undefined && transformed.numberOfReviews === undefined) {
        transformed.numberOfReviews = transformed.number_of_reviews;
        delete transformed.number_of_reviews;
      }
      if (transformed.photo_urls !== undefined && transformed.photoUrls === undefined) {
        transformed.photoUrls = transformed.photo_urls;
        delete transformed.photo_urls;
      }
      return transformed;
    });
    
    res.json(transformedResult);
  } catch (err: any) {
    console.error("❌ Error retrieving properties:", err);
    res.status(500).json({ message: `Error retrieving properties: ${err.message}` });
  }
};

/**
 * Lấy toàn bộ payment của các lease thuộc một property (cho manager)
 */
export const getPropertyPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const propertyId = Number(req.params.id);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const payments = await prisma.payment.findMany({
      where: { lease: { propertyId } },
      include: { lease: true },
      orderBy: { paymentDate: "desc" },
    });

    res.json(payments);
  } catch (err: any) {
    console.error("❌ Error retrieving property payments:", err);
    res.status(500).json({
      message: `Error retrieving property payments: ${err.message}`,
    });
  }
};

/**
 * Lấy thông tin chi tiết 1 property
 */
export const getProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: { location: true, manager: true, leases: true },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const propertyWithCoordinates = {
      ...property,
      location: {
        ...property.location,
        coordinates: {
          longitude: property.location.longitude,
          latitude: property.location.latitude,
        },
      },
    };

    res.json(propertyWithCoordinates);
  } catch (err: any) {
    console.error("❌ Error retrieving property:", err);
    res.status(500).json({ message: `Error retrieving property: ${err.message}` });
  }
};

/**
 * Tạo mới 1 property
 */
export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;

    // ✅ Dùng ảnh local
    const photoUrls = files.map((file) => `${req.protocol}://${req.get("host")}/uploads/${file.filename}`);

    // 📍 Lấy tọa độ từ Mapbox
    const fullAddress = `${address}, ${city}, ${state}, ${country}${postalCode ? `, ${postalCode}` : ""}`;
    const { lat, lon } = await getCoordinatesMapbox(fullAddress);

    // 🗺️ Tạo location
    const location = await prisma.location.create({
      data: {
        address,
        city,
        state,
        country,
        postalCode,
        latitude: lat,
        longitude: lon,
      },
    });

    // 🏠 Tạo property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities: typeof propertyData.amenities === "string" ? propertyData.amenities.split(",") : [],
        highlights: typeof propertyData.highlights === "string" ? propertyData.highlights.split(",") : [],
        isPetsAllowed: propertyData.isPetsAllowed === "true",
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        pricePerMonth: parseFloat(propertyData.pricePerMonth),
        securityDeposit: parseFloat(propertyData.securityDeposit),
        applicationFee: parseFloat(propertyData.applicationFee),
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
        squareFeet: parseInt(propertyData.squareFeet),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    console.error("❌ Error creating property:", err);
    res.status(500).json({ message: `Error creating property: ${err.message}` });
  }
};

/**
 * Xóa 1 property theo ID
 */
export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const propertyId = Number(id);

    // Kiểm tra property có tồn tại không
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!existing) {
      res.status(404).json({ message: "Không tìm thấy tin đăng cần xoá" });
      return;
    }

    // Xóa quan hệ và dữ liệu phụ thuộc trước khi xóa property để tránh lỗi FK
    await prisma.$transaction([
      // Xóa payment theo lease thuộc property
      prisma.payment.deleteMany({
        where: { lease: { propertyId } },
      }),
      // Xóa lease thuộc property
      prisma.lease.deleteMany({
        where: { propertyId },
      }),
      // Xóa application thuộc property
      prisma.application.deleteMany({
        where: { propertyId },
      }),
      // Ngắt liên kết favorite/tenant (bảng trung gian)
      prisma.property.update({
        where: { id: propertyId },
        data: {
          favoritedBy: { set: [] },
          tenants: { set: [] },
        },
      }),
      // Xóa property
      prisma.property.delete({
        where: { id: propertyId },
      }),
    ]);

    res.status(200).json({ message: "Đã xoá tin đăng thành công" });
  } catch (err: any) {
    console.error("❌ Lỗi khi xoá property:", err);
    res.status(500).json({ message: `Lỗi khi xoá property: ${err.message}` });
  }
};