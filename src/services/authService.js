const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const {
  JWT_SECRET,
  JWT_EXPIRY,
  REFRESH_SECRET,
  REFRESH_EXPIRY,
} = require("../config/env");

const registerUser = async (name, email, password) => {
  // Add email format validation
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    const error = new Error("Invalid email format");
    error.name = "ValidationError";
    throw error;
  }

  // Add password strength validation
  if (password.length < 8) {
    const error = new Error("Password must be at least 8 characters long");
    error.name = "ValidationError";
    throw error;
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const error = new Error("Email already registered");
    error.name = "ValidationError";
    throw error;
  }

  const hashedPassword = await bcryptjs.hash(password, 10);
  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) throw new Error("Invalid credentials");

  const isValidPassword = await bcryptjs.compare(password, user.password);
  if (!isValidPassword) throw new Error("Invalid credentials");

  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

  // Calculate expiry time correctly
  const expiryMs = REFRESH_EXPIRY.endsWith("d")
    ? parseInt(REFRESH_EXPIRY) * 24 * 60 * 60 * 1000 // days to ms
    : parseInt(REFRESH_EXPIRY) * 1000; // seconds to ms

  // Store refresh token with correct expiry
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + expiryMs),
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

const logoutUser = async (refreshToken) => {
  const tokenData = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    select: { userId: true },
  });

  if (!tokenData) {
    throw new Error("Invalid refresh token");
  }

  await prisma.refreshToken.deleteMany({
    where: { userId: tokenData.userId },
  });
};

const refreshAccessToken = async (refreshToken) => {
  try {
    // First verify the token
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // Find the stored token
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    // Check if token exists and is not expired
    if (!storedToken) {
      throw new Error("Refresh token not found in database");
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
      throw new Error("Refresh token has expired");
    }

    // Verify user ID match
    if (storedToken.user.id !== decoded.userId) {
      throw new Error("Token user mismatch");
    }

    // Generate new access token
    const accessToken = jwt.sign({ userId: storedToken.user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });

    return {
      accessToken,
      user: {
        id: storedToken.user.id,
        name: storedToken.user.name,
        email: storedToken.user.email,
        role: storedToken.user.role,
      },
    };
  } catch (error) {
    console.log("Refresh error details:", {
      errorName: error.name,
      errorMessage: error.message,
    });

    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw new Error("Invalid refresh token");
    }
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
};
