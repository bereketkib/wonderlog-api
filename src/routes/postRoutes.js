const express = require("express");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { isAuthor } = require("../middlewares/roleMiddleware");
const {
  getAllPublishedPosts,
  getPublicPost,
  getMyPosts,
  getMyPost,
  create,
  updateMyPost,
  deleteMyPost,
  getMyPostCount,
  getMyDashboardStats,
} = require("../controllers/postController");

const router = express.Router();

// Protected routes (require authentication and author role)
router.get(
  "/my/dashboard-stats",
  authenticateJWT,
  isAuthor,
  getMyDashboardStats
);
router.get("/my/count", authenticateJWT, getMyPostCount);
router.get("/my", authenticateJWT, isAuthor, getMyPosts);
router.post("/my", authenticateJWT, isAuthor, create);

router.get("/my/:id", authenticateJWT, isAuthor, getMyPost);
router.put("/my/:id", authenticateJWT, isAuthor, updateMyPost);
router.delete("/my/:id", authenticateJWT, isAuthor, deleteMyPost);

// Public routes
router.get("/:id", getPublicPost);
router.get("/", getAllPublishedPosts);

module.exports = router;
