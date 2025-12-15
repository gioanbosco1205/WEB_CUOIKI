import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 
    const { user } = req; 

    const where: any = {};

    if (id) where.propertyId = Number(id);

    if (user?.role === "tenant") where.tenantId = user.id;
    if (user?.role === "manager") where.managerId = user.id;
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      payments: true,
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

export const createLeasePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      amountDue,
      amountPaid,
      dueDate,
      paymentDate,
    } = req.body;

    const leaseId = Number(id);

    const lease = await prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) {
      res.status(404).json({ message: "Lease not found" });
      return;
    }

    const calculatedAmountDue = amountDue ?? lease.rent;
    const calculatedAmountPaid = amountPaid ?? lease.rent;
    let paymentStatus: "Paid" | "PartiallyPaid" | "Pending" | "Overdue" = "Pending";

    if (calculatedAmountPaid >= calculatedAmountDue) {
      paymentStatus = "Paid";
    } else if (calculatedAmountPaid > 0) {
      paymentStatus = "PartiallyPaid";
    } else {
      paymentStatus = "Pending";
    }

    const payment = await prisma.payment.create({
      data: {
        leaseId,
        amountDue: calculatedAmountDue,
        amountPaid: calculatedAmountPaid,
        dueDate: dueDate ? new Date(dueDate) : new Date(),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentStatus,
      },
    });

    res.status(201).json(payment);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating lease payment: ${error.message}` });
  }
};
