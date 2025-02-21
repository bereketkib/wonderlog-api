const isAuthor = (req, res, next) => {
  if (req.user.role !== "AUTHOR") {
    return res.status(403).json({ message: "Author access required" });
  }
  next();
};

module.exports = {
  isAuthor,
};
