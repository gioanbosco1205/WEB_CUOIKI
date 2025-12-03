import { Request, Response } from "express";
import prisma from "../prismaClient";
import { PropertyType } from "@prisma/client";

const keywordToTypeMap: Record<string, PropertyType> = {
  "phòng": PropertyType.ROOM,
  "căn hộ mini": PropertyType.MINI_APARTMENT,
  "nhà": PropertyType.HOUSE,
  "chung cư": PropertyType.APARTMENT,
  "ký túc xá": PropertyType.DORMITORY,
  "sleepbox": PropertyType.SLEEPBOX,
  // "khách sạn" không map → search bằng name/description
};

export const chatHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ reply: "Dữ liệu gửi lên không hợp lệ." });
      return;
    }

    const searchTerm = messages[messages.length - 1]?.message?.trim();
    if (!searchTerm) {
      res.json({ reply: "Bạn vui lòng nhập từ khóa tìm phòng." });
      return;
    }

    const typeFilter = keywordToTypeMap[searchTerm.toLowerCase()];

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { description: { contains: searchTerm, mode: "insensitive" } },
          { location: { address: { contains: searchTerm, mode: "insensitive" } } },
          { location: { city: { contains: searchTerm, mode: "insensitive" } } },
          ...(typeFilter ? [{ propertyType: typeFilter }] : []),
        ],
      },
      include: {
        location: true,
        manager: true,
      },
      orderBy: { postedDate: "desc" },
      take: 5,
    });

    if (properties.length === 0) {
      res.json({ reply: [{ message: `❌ Không tìm thấy phòng nào phù hợp với "${searchTerm}"` }] });
      return;
    }

    // Build array trả về cho frontend, mỗi object có message + imageUrl
    const replyArray = properties.map(p => ({
      message: `🏠 ${p.name}
📍 ${p.location.address}, ${p.location.city}, ${p.location.state}
💰 Giá: ${p.pricePerMonth.toLocaleString()} VNĐ/tháng
🛏️ Beds: ${p.beds} - Baths: ${p.baths}
🧾 Loại: ${p.propertyType}
📞 Quản lý: ${p.manager.phoneNumber} | ${p.manager.email}`,
      imageUrl: p.photoUrls[0] ? `http://localhost:3002/Images/${p.photoUrls[0]}` : null
    }));

    res.json({ reply: replyArray });
  } catch (err) {
    console.error("Chat search error:", err);
    res.status(500).json({ reply: [{ message: "Lỗi hệ thống khi tìm phòng." }] });
  }
};
