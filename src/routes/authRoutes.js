const express = require("express");
const {
  register,
  login,
  logout,
  refresh,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
// Change the logout route method
router.post("/logout", logout);
router.post("/refresh", refresh);

module.exports = router;
