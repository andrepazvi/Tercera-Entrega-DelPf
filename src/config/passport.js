const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');
const User = mongoose.model('User');


const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

module.exports = passport => {
  passport.use(new JwtStrategy(jwtOptions, (jwt_payload, done) => {
    User.findById(jwt_payload.id)
      .then(user => {
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      })
      .catch(err => console.error(err));
  }));

  const cookieExtractor = (req) => {
    let token = null;
    if (req && req.cookies) {
      token = req.cookies['jwt'];
    }
    return token;
  };

  passport.use(
    'jwt',
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: process.env.JWT_SECRET, // o config.jwt_secret según tu estructura
      },
      async (jwt_payload, done) => {
        try {
          console.log('~~~Passport Jwt success~~~ payload:', jwt_payload);
          return done(null, jwt_payload);
        } catch (err) {
          return done(err);
        }
      }
    )
  );
  passport.use(
    'register',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      async (req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body;
        try {
          let user = await User.findOne({ email: username });
          if (user) {
            console.log('~~~Passport Register alert. "El usuario ya existe"~~~');
            return done(null, { userExists: true });
          }
          const newUser = new User({
            first_name,
            last_name,
            email,
            age,
            password: createHash(password),
          });

          await newUser.save();

          const userCart = new Cart({
            user: newUser._id,
            products: [],
          });

          await userCart.save();

          newUser.cart = userCart._id;

          await newUser.save();

          const data = newUser;
          console.log('~~~Passport Register success. "Usuario registrado"~~~', data);
          return done(null, data);
        } catch (error) {
          return done('Passport Register error. Error al obtener el usuario:' + error);
        }
      }
    )
  );

  passport.use(
    'login',
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: 'email',
      },
      async (req, username, password, done) => {
        try {
          if (username === 'adminCoder@coder.com' && password === 'adminCod3r123') {
            /* Admin login */
            const adminUser = {
              email: 'adminCoder@coder.com',
              admin: true,
              role: 'admin',
            };
            delete adminUser.password;
            console.log('~~~Passport Admin Login success~~~', adminUser);
            return done(null, adminUser);
          } else {
            /* User login */
            const user = await User.findOne({ email: username });
            if (!user || !isValidPassword(password, user)) {
              console.log('~~~Passport Login alert. Invalid credentials~~~');
              return done(null, false);
            }
            delete user.password;
            const data = user;
            console.log('~~~Passport User Login success~~~', data);
            return done(null, data);
          }
        } catch (error) {
          return done('~~~Passport Login error: ' + error, '~~~');
        }
      }
    )
  );

  passport.use(
    'github',
    new GitHubStrategy(
      {
        clientID: `${config.github_client_id}`,
        clientSecret: `${config.github_secret_key}`,
        callbackURL: `${config.github_callback_url}`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log(profile);
          let user = await User.findOne({ email: profile._json.email });
          if (!user) {
            let newUser = {
              first_name: profile._json.name,
              last_name: 'GitHub user',
              email: profile._json.email,
              password: '[]',
            };
            let result = await User.create(newUser);

            const userCart = new Cart({
              user: result._id,
              products: [],
            });
            await userCart.save();

            result.cart = userCart._id;
            await result.save();

            done(null, result);
          } else {
            done(null, user);
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  const initializePassport = () => {
    passport.serializeUser((user, done) => {
      done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
      let user = await User.findById(id);
      done(null, user);
    });
  };
};

