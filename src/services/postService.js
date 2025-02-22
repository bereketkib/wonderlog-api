const prisma = require("../config/database");

const getPublishedPosts = async (
  page = 1,
  limit = 10,
  search = "",
  sort = "recent"
) => {
  const skip = (page - 1) * limit;
  const where = {
    published: true,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  let orderBy = { createdAt: "desc" };

  switch (sort) {
    case "oldest":
      orderBy = { createdAt: "asc" };
      break;
    case "featured":
      orderBy = [{ viewCount: "desc" }, { createdAt: "desc" }];
      break;
    case "recent":
    default:
      orderBy = { createdAt: "desc" };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: skip + posts.length < total,
    },
  };
};

const getPublicPostById = async (id) => {
  const post = await prisma.post.findFirst({
    where: {
      id,
      published: true,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        include: {
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
      },
    },
  });

  if (!post) {
    throw new Error("Post not found");
  }

  // Increment view count
  await prisma.post.update({
    where: { id },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  return post;
};

const getAuthorPosts = async (
  authorId,
  page = 1,
  limit = 10,
  search = "",
  sort = "newest",
  status = "all"
) => {
  const skip = (page - 1) * limit;

  const where = {
    authorId,
    ...(status !== "all" && {
      published: status === "published",
    }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  let orderBy = { updatedAt: "desc" };

  switch (sort) {
    case "oldest":
      orderBy = { updatedAt: "asc" };
      break;
    case "newest":
    default:
      orderBy = { updatedAt: "desc" };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        comments: true,
        _count: {
          select: { comments: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      hasMore: skip + posts.length < total,
    },
  };
};

const getAuthorPostById = async (id, authorId) => {
  const post = await prisma.post.findUnique({
    where: {
      id,
      authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      comments: {
        include: {
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
      },
    },
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }
  return post;
};

const getAuthorPostCount = async (authorId) => {
  return await prisma.post.count({
    where: {
      authorId,
    },
  });
};

const createPost = async (authorId, { title, content, published = false }) => {
  return await prisma.post.create({
    data: {
      title,
      content,
      published,
      authorId,
      viewCount: 0,
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

const updatePost = async (id, authorId, { title, content, published }) => {
  const post = await prisma.post.findFirst({
    where: {
      id,
      authorId,
    },
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  return await prisma.post.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(typeof published === "boolean" && { published }),
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

const deletePost = async (id, authorId) => {
  const post = await prisma.post.findFirst({
    where: {
      id,
      authorId,
    },
  });

  if (!post) {
    throw new Error("Post not found or unauthorized");
  }

  // Delete post and all related comments in a transaction
  await prisma.$transaction([
    // Delete all comments first
    prisma.comment.deleteMany({
      where: { postId: id },
    }),
    // Then delete the post
    prisma.post.delete({
      where: { id },
    }),
  ]);
};

const getDashboardStats = async (authorId) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const refreshToken = prisma.refreshToken.findFirst({
    where: {
      userId: authorId,
    },
  });

  const remainingTime = refreshToken.expiresAt.getTime() - Date.now();

  res.cookie("refreshToken", refreshToken.token, {
    httpOnly: true,
    secure: true,
    maxAge: remainingTime,
    sameSite: "none",
  });

  const [posts, comments, recentPosts, todayViews] = await Promise.all([
    // Get post stats
    prisma.post.groupBy({
      by: ["published"],
      where: { authorId },
      _count: true,
    }),
    // Get comments stats
    prisma.comment.aggregate({
      where: {
        post: { authorId },
      },
      _count: true,
    }),
    // Get recent posts with stats
    prisma.post.findMany({
      where: { authorId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: {
          select: { comments: true },
        },
      },
    }),

    // Get today's views count
    prisma.post.aggregate({
      where: {
        authorId,
        createdAt: {
          gte: startOfToday,
        },
      },
      _sum: { viewCount: true },
    }),
  ]);

  const totalPosts = posts.reduce((acc, curr) => acc + curr._count, 0);
  const publishedPosts = posts.find((p) => p.published)?._count || 0;

  // Get recent comments count (last 24 hours)
  const recentComments = await prisma.comment.count({
    where: {
      post: { authorId },
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  return {
    posts: {
      total: totalPosts,
      published: publishedPosts,
      draft: totalPosts - publishedPosts,
    },
    comments: {
      total: comments._count,
      recent: recentComments,
    },
    views: {
      total: await prisma.post
        .aggregate({
          where: { authorId },
          _sum: { viewCount: true },
        })
        .then((result) => result._sum.viewCount || 0),
      today: todayViews._sum.viewCount,
    },
    recentPosts: recentPosts.map((post) => ({
      id: post.id,
      title: post.title,
      createdAt: post.createdAt,
      views: post.viewCount,
      commentsCount: post._count.comments,
      published: post.published,
    })),
  };
};

module.exports = {
  createPost,
  getPublishedPosts,
  getPublicPostById,
  getAuthorPosts,
  getAuthorPostById,
  updatePost,
  deletePost,
  getAuthorPostCount,
  getDashboardStats,
};
