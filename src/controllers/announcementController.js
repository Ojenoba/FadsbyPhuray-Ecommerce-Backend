import Announcement from "../models/Announcement.js";

// CREATE announcement
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = new Announcement(req.body);
    await announcement.save();
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// GET all announcements
export const getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!announcement) {
      return res.status(404).json({ success: false, error: "Announcement not found" });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// DELETE announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.body;
    const announcement = await Announcement.findByIdAndDelete(id);
    if (!announcement) {
      return res.status(404).json({ success: false, error: "Announcement not found" });
    }
    res.status(200).json({ success: true, message: "Announcement deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// TOGGLE active status
export const toggleAnnouncement = async (req, res) => {
  try {
    const { id, is_active } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      id,
      { is_active: !is_active },
      { new: true }
    );
    if (!announcement) {
      return res.status(404).json({ success: false, error: "Announcement not found" });
    }
    res.status(200).json({ success: true, data: announcement });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};