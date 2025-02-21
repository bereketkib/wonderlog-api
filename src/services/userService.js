const prisma = require("../config/database");
const bcryptjs = require("bcryptjs");

const upgradeToAuthor = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "AUTHOR") {
    throw new Error("User is already an author");
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { role: "AUTHOR" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await bcryptjs.compare(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Current password is incorrect");
  }

  const hashedPassword = await bcryptjs.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Delete in the correct order to handle foreign key constraints
  await prisma.$transaction([
    // First delete all comments by the user
    prisma.comment.deleteMany({
      where: { authorId: userId },
    }),
    // Then delete all posts by the user
    prisma.post.deleteMany({
      where: { authorId: userId },
    }),
    // Finally delete the user
    prisma.user.delete({
      where: { id: userId },
    }),
  ]);
};

module.exports = {
  upgradeToAuthor,
  changePassword,
  deleteUser,
};
