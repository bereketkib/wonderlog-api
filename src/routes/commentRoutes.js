const express = require("express");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const { isAuthor } = require("../middlewares/roleMiddleware");
const {
  create,
  update,
  remove,
  getMyComments,
  getPostComments,
  getAuthorPostComments,
  bulkDelete,
} = require("../controllers/commentController");

const router = express.Router();

// New author-specific routes
router.get("/author/all", authenticateJWT, isAuthor, getAuthorPostComments);
router.post("/bulk-delete", authenticateJWT, isAuthor, bulkDelete);
router.get("/posts/:postId", authenticateJWT, isAuthor, getPostComments);

// All routes require authentication
router.post("/:postId", authenticateJWT, create);
router.put("/:id", authenticateJWT, update);
router.delete("/:id", authenticateJWT, remove);
router.get("/my", authenticateJWT, getMyComments);

module.exports = router;
