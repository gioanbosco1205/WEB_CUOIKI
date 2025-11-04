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

    if (propertyType && propertyType !== "any") {
      whereConditions.push(
        Prisma.sql`p."propertyType" = ${propertyType}::"PropertyType"`
      );
    }

    if (amenities && amenities !== "any") {
      const arr = (amenities as string).split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${arr}::"Amenity"[]`);
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

    const result = await prisma.$queryRaw(completeQuery);
    res.json(result);
  } catch (err: any) {
    console.error("❌ Error retrieving properties:", err);
    res.status(500).json({ message: `Error retrieving properties: ${err.message}` });
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

    // Kiểm tra property có tồn tại không
    const existing = await prisma.property.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      res.status(404).json({ message: "Không tìm thấy tin đăng cần xoá" });
      return;
    }

    // Xóa property
    await prisma.property.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Đã xoá tin đăng thành công" });
  } catch (err: any) {
    console.error("❌ Lỗi khi xoá property:", err);
    res.status(500).json({ message: `Lỗi khi xoá property: ${err.message}` });
  }
};