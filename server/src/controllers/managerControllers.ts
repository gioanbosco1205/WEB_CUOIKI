import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Lấy thông tin manager theo cognitoId
 */
export const getManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: "Manager not found" });
    }
  } catch (error: any) {
    console.error("❌ Error retrieving manager:", error);
    res
      .status(500)
      .json({ message: `Error retrieving manager: ${error.message}` });
  }
};

/**
 * Tạo manager mới
 */
export const createManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    console.error("❌ Error creating manager:", error);
    res
      .status(500)
      .json({ message: `Error creating manager: ${error.message}` });
  }
};

/**
 * Cập nhật thông tin manager
 */
export const updateManager = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateManager);
  } catch (error: any) {
    console.error("❌ Error updating manager:", error);
    res
      .status(500)
      .json({ message: `Error updating manager: ${error.message}` });
  }
};

/**
 * Lấy danh sách bất động sản của manager
 */
export const getManagerProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    console.log("👉 Received cognitoId:", cognitoId);

    // Lấy danh sách property của manager
    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
      include: {
        location: true, // include bảng Location liên kết
      },
    });

    // Xử lý gộp tọa độ từ bảng Location
    const propertiesWithFormattedLocation = await Promise.all(
      properties.map(async (property) => {
        if (!property.location) {
          return { ...property, location: null };
        }

        const location = await prisma.location.findUnique({
          where: { id: property.location.id },
          select: { latitude: true, longitude: true },
        });

        const longitude = location?.longitude || 0;
        const latitude = location?.latitude || 0;

        return {
          ...property,
          location: {
            ...property.location,
            coordinates: { longitude, latitude },
          },
        };
      })
    );

    res.json(propertiesWithFormattedLocation);
  } catch (err: any) {
    console.error("❌ Error retrieving manager properties:", err);
    res
      .status(500)
      .json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};
