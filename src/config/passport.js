const { Strategy, ExtractJwt } = require("passport-jwt");
const passport = require("passport");
const prisma = require("./database");
const { JWT_SECRET } = require("./env");

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET,
};

passport.use(
  new Strategy(options, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          refreshTokens: true,
        },
      });
      if (!user) return done(null, false);

      const hasValidToken = user.refreshTokens.length > 0;
      if (!hasValidToken) return done(null, false);

      done(null, user);
    } catch (error) {
      done(error, false);
    }
  })
);

module.exports = passport;
