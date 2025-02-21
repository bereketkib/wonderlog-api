const {
  upgradeToAuthor,
  changePassword,
  deleteUser,
} = require("../services/userService");

const becomeAuthor = async (req, res, next) => {
  try {
    const updatedUser = await upgradeToAuthor(req.user.id);
    res.json({
      message: "Successfully upgraded to author role",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.user.id, currentPassword, newPassword);
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    await deleteUser(req.user.id);
    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  becomeAuthor,
  updatePassword,
  deleteAccount,
};
