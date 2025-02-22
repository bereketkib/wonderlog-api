const {
  createPost,
  getPublishedPosts,
  getPublicPostById,
  getAuthorPosts,
  getAuthorPostById,
  updatePost,
  deletePost,
  getAuthorPostCount,
  getDashboardStats,
} = require("../services/postService");

// Public Controllers
const getAllPublishedPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = "", sort = "recent" } = req.query;
    const posts = await getPublishedPosts(
      parseInt(page),
      parseInt(limit),
      search,
      sort
    );
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

const getPublicPost = async (req, res, next) => {
  try {
    const post = await getPublicPostById(req.params.id);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

// Author Controllers
const getMyPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "all",
      sort = "newest",
    } = req.query;
    const posts = await getAuthorPosts(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      search,
      sort,
      status
    );
    res.json(posts);
  } catch (error) {
    next(error);
  }
};

const getMyPost = async (req, res, next) => {
  try {
    const post = await getAuthorPostById(req.params.id, req.user.id);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const getMyPostCount = async (req, res, next) => {
  try {
    const count = await getAuthorPostCount(req.user.id);
    res.json(count);
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const post = await createPost(req.user.id, req.body);
    res.status(201).json(post);
  } catch (error) {
    next(error);
  }
};

const updateMyPost = async (req, res, next) => {
  try {
    const post = await updatePost(req.params.id, req.user.id, req.body);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

const deleteMyPost = async (req, res, next) => {
  try {
    await deletePost(req.params.id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getMyDashboardStats = async (req, res, next) => {
  try {
    const refreshToken = await prisma.refreshToken.findFirst({
      where: {
        userId: req.user.id,
      },
    });

    const remainingTime = refreshToken.expiresAt.getTime() - Date.now();

    res.cookie("refreshToken", refreshToken.token, {
      httpOnly: true,
      secure: true,
      maxAge: remainingTime,
      sameSite: "none",
    });

    const stats = await getDashboardStats(req.user.id);

    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPublishedPosts,
  getPublicPost,
  getMyPosts,
  getMyPost,
  getMyPostCount,
  create,
  updateMyPost,
  deleteMyPost,
  getMyDashboardStats,
};
