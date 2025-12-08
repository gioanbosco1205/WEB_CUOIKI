import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createLeasePayment,
  getLeasePayments,
  getLeases,
} from "../controllers/leaseControllers";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);
router.post(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  createLeasePayment
);

export default router;
