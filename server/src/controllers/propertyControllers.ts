import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import axios from "axios";
 
const prisma = new PrismaClient();
 
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});
 
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
 
    // Dùng câu lệnh SQL raw với điều kiện động
    const whereConditions: Prisma.Sql[] = [];
 
    if (favoriteIds) {
      const ids = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(Prisma.sql`p.id IN (${Prisma.join(ids)})`);
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
 
    if (latitude && longitude) {
      const lat = parseFloat(latitude as string);
      const lng = parseFloat(longitude as string);
      const radiusInKm = 50; // 50 km radius
      const degrees = radiusInKm / 111; // km → degrees
 
      whereConditions.push(
        Prisma.sql`ST_DWithin(
          ST_SetSRID(ST_MakePoint(l.longitude, l.latitude), 4326),
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326),
          ${degrees}
        )`
      );
    }
 
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
 
    // Không cần ST_AsText nữa, vì ta đã lưu trực tiếp latitude & longitude
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
 
    // Upload ảnh lên S3
    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: `properties/${Date.now()}-${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
 
        const uploadResult = await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();
 
        return uploadResult.Location;
      })
    );
 
    // Gọi Nominatim để lấy toạ độ
    const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      street: address,
      city,
      country,
      postalcode: postalCode,
      format: "json",
      limit: "1",
    }).toString()}`;
 
    const geocodingResponse = await axios.get(geocodingUrl, {
      headers: { "User-Agent": "RealEstateApp (example@email.com)" },
    });
 
    const lon = parseFloat(geocodingResponse.data?.[0]?.lon ?? "0");
    const lat = parseFloat(geocodingResponse.data?.[0]?.lat ?? "0");
 
    // Tạo location
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
 
    // Tạo property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.split(",")
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.split(",")
            : [],
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
 
 