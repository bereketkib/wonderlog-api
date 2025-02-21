const express = require("express");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const {
  becomeAuthor,
  updatePassword,
  deleteAccount,
} = require("../controllers/userController");

const router = express.Router();

router.post("/upgrade-to-author", authenticateJWT, becomeAuthor);
router.put("/update-password", authenticateJWT, updatePassword);
router.delete("/delete", authenticateJWT, deleteAccount);

module.exports = router;
