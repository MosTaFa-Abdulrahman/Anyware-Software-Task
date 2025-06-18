const router = require("express").Router();
const Announcement = require("../models/Announcement");
const { protectedRoute } = require("../utils/protectedRoute");

// Create
router.post("/create", protectedRoute, async (req, res) => {
  try {
    const { title, content, semester, category } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        error: "Title and content are required",
      });
    }

    const newAnnouncement = new Announcement({
      title,
      content,
      author: req.user._id,
      semester: semester || "",
      category: category || "general",
    });

    const savedAnnouncement = await newAnnouncement.save();
    await savedAnnouncement.populate("author", "username email profilePic");

    res.status(201).json({
      message: "Announcement created successfully 🎉",
      announcement: savedAnnouncement,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Get All
router.get("/get/all", async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const announcements = await Announcement.find({})
      .populate("author", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments({});

    res.status(200).json({
      announcements,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalAnnouncements: total,
        hasNextPage: skip + announcements.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get Single by ((ID))
router.get("/get/:announcementId", async (req, res) => {
  try {
    const announcement = await Announcement.findById(
      req.params.announcementId
    ).populate("author", "username email profilePic");

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    res.status(200).json(announcement);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Update Announcement
router.put("/update/:announcementId", protectedRoute, async (req, res) => {
  try {
    const { title, content, semester, category } = req.body;

    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found",
      });
    }

    // Check if user is the author
    if (announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You can only update your own announcements",
      });
    }

    // Update fields
    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (semester !== undefined) announcement.semester = semester;
    if (category) announcement.category = category;

    const updatedAnnouncement = await announcement.save();
    await updatedAnnouncement.populate("author", "username email profilePic");

    res.status(200).json({
      message: "Announcement updated successfully 🎉",
      announcement: updatedAnnouncement,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
});

// Delete Announcement
router.delete("/delete/:announcementId", protectedRoute, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.announcementId);

    if (!announcement) {
      return res.status(404).json({
        error: "Announcement not found 😥",
      });
    }

    // Check if user is the author
    if (announcement.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "You can only delete your own announcements",
      });
    }

    await Announcement.findByIdAndDelete(req.params.announcementId);

    res.status(200).json({
      message: "Announcement deleted successfully 🗑️",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

// Get User's Announcements
router.get("/user/my-announcements", protectedRoute, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const announcements = await Announcement.find({ author: req.user._id })
      .populate("author", "username email profilePic")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Announcement.countDocuments({ author: req.user._id });

    res.status(200).json({
      announcements,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalAnnouncements: total,
        hasNextPage: skip + announcements.length < total,
        hasPrevPage: parseInt(page) > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
