import express from "express";
import {
  getManager,
  createManager,
  updateManager,
  getManagerProperties,
} from "../controllers/managerControllers";
import { getTenantContracts } from "../controllers/tenantControllers"; // import controller mới

const router = express.Router();

router.get("/:cognitoId", getManager);
router.put("/:cognitoId", updateManager);
router.get("/:cognitoId/properties", getManagerProperties);
router.post("/", createManager);


// Thêm route mới cho manager xem hợp đồng tenant
router.get("/contracts/:tenantCognitoId", getTenantContracts);
export default router;
