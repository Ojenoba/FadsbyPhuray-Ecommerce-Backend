import express from "express";
import {
  createAnnouncement,
  getAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/announcements", createAnnouncement);
router.get("/announcements", getAnnouncements);
router.put("/announcements", updateAnnouncement);
router.delete("/announcements", deleteAnnouncement);

// toggle active status
router.put("/announcements/toggle", toggleAnnouncement);

export default router;