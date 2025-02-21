const prisma = require("../config/database");

const createComment = async (userId, postId, { content }) => {
  // Verify post exists and is published
  const post = await prisma.post.findFirst({
    where: { id: postId, published: true },
  });

  if (!post) {
    throw new Error("Post not found or not published");
  }

  return await prisma.comment.create({
    data: {
      content,
      authorId: userId,
      postId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const updateComment = async (id, userId, { content }) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
      authorId: userId,
    },
  });

  if (!comment) {
    throw new Error("Comment not found or unauthorized");
  }

  return await prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

const deleteComment = async (id, userId) => {
  const comment = await prisma.comment.findFirst({
    where: {
      id,
    },
    include: {
      post: {
        select: {
          authorId: true,
        },
      },
    },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  if (comment.authorId !== userId && comment.post.authorId !== userId) {
    throw new Error("Comment not found or unauthorized");
  }

  await prisma.comment.delete({
    where: { id },
  });
};

const getUserComments = async (userId) => {
  return await prisma.comment.findMany({
    where: {
      authorId: userId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
        },
      },
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getPostCommentsService = async (postId, authorId) => {
  // First verify the post belongs to the author
  const post = await prisma.post.findFirst({
    where: {
      id: postId,
      authorId,
    },
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        postId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.comment.count({
      where: { postId },
    }),
  ]);

  return {
    comments,
    pagination: {
      total,
      pages: 1,
      currentPage: 1,
      hasMore: false,
    },
  };
};

const getAllAuthorPostComments = async (
  authorId,
  page = 1,
  limit = 10,
  sortOrder = "newest",
  search = ""
) => {
  const skip = (page - 1) * limit;
  const orderBy = {
    createdAt: sortOrder === "newest" ? "desc" : "asc",
  };

  const where = {
    post: {
      authorId,
    },
    ...(search && {
      OR: [
        { content: { contains: search, mode: "insensitive" } },
        {
          post: {
            title: { contains: search, mode: "insensitive" },
          },
        },
      ],
    }),
  };

  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.comment.count({ where }),
  ]);

  return {
    comments,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: skip + comments.length < total,
    },
  };
};

module.exports = {
  createComment,
  updateComment,
  deleteComment,
  getUserComments,
  getPostCommentsService,
  getAllAuthorPostComments,
};
