const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} = require("../services/authService");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await registerUser(name, email, password);
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, tokens } = await loginUser(email, password);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 day
      sameSite: "none",
    });

    res.json({
      user,
      accessToken: tokens.accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken; // Changed from req.body
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }
    await logoutUser(refreshToken);
    res.clearCookie("refreshToken"); // Add this line
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is required" });
    }

    const { accessToken } = await refreshAccessToken(refreshToken);

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: "Failed to generate new access token" });
    }

    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error); // Debug log
    if (
      error.message.includes("Invalid") ||
      error.message.includes("expired")
    ) {
      return res.status(401).json({ message: error.message });
    }
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refresh,
};
