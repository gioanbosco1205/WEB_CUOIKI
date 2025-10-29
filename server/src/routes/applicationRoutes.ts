import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  createApplication,
  listApplications,
  updateApplicationStatus,
  deleteApplication
} from "../controllers/applicationControllers";

const router = express.Router();

router.post("/", authMiddleware(["tenant"]), createApplication);
router.put("/:id/status", authMiddleware(["manager"]), updateApplicationStatus);
router.get("/", authMiddleware(["manager", "tenant"]), listApplications);
router.delete("/:id", authMiddleware(["manager", "tenant"]), deleteApplication);

export default router;
