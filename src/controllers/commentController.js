const {
  createComment,
  updateComment,
  deleteComment,
  getUserComments,
  getAllAuthorPostComments,
  getPostCommentsService,
} = require("../services/commentService");

const create = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const comment = await createComment(req.user.id, postId, req.body);
    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const comment = await updateComment(id, req.user.id, req.body);
    res.json(comment);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteComment(id, req.user.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

const getMyComments = async (req, res, next) => {
  try {
    const comments = await getUserComments(req.user.id);
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const comments = await getPostCommentsService(
      req.params.postId,
      req.user.id
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

const getAuthorPostComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, sort = "newest", search = "" } = req.query;

    const comments = await getAllAuthorPostComments(
      req.user.id,
      parseInt(page),
      parseInt(limit),
      sort,
      search
    );
    res.json(comments);
  } catch (error) {
    next(error);
  }
};

const bulkDelete = async (req, res, next) => {
  try {
    const { commentIds } = req.body;

    if (!commentIds || !Array.isArray(commentIds)) {
      return res.status(400).json({ error: "Invalid comment IDs provided" });
    }

    await Promise.all(
      commentIds.map(async (id) => {
        try {
          await deleteComment(id, req.user.id);
        } catch (error) {
          console.error(`Failed to delete comment ${id}:`, error);
          throw error;
        }
      })
    );

    res.status(204).send();
  } catch (error) {
    console.error("Bulk delete error:", error);
    next(error);
  }
};

module.exports = {
  create,
  update,
  remove,
  getMyComments,
  getPostComments,
  getAuthorPostComments,
  bulkDelete,
};
