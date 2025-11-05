import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // lấy propertyId từ URL
    const { user } = req; // nếu bạn dùng authMiddleware có gán user

    const where: any = {};

    // Nếu có id trong params, nghĩa là đang lấy leases theo property
    if (id) where.propertyId = Number(id);

    // Có thể thêm filter theo tenant hoặc manager ở đây
    if (user?.role === "tenant") where.tenantId = user.id;
    if (user?.role === "manager") where.managerId = user.id;
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: { leaseId: Number(id) },
    });
    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};

export const getLeaseContract = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // id này là propertyId được truyền từ frontend

    const lease = await prisma.lease.findFirst({
      where: { propertyId: Number(id) }, // lấy lease theo propertyId
      include: {
        tenant: true,
        property: true,
      },
    });

    if (!lease) {
      res.status(404).json({ message: "Không tìm thấy hợp đồng thuê." });
      return;
    }

    res.json({
      leaseId: lease.id,
      startDate: lease.startDate,
      endDate: lease.endDate,
      rent: lease.rent,
      deposit: lease.deposit,
      tenant: lease.tenant,
      property: lease.property,
    });
  } catch (error: any) {
    res.status(500).json({ message: `Lỗi khi lấy hợp đồng thuê: ${error.message}` });
  }
};