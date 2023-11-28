/* ************************************************************************** */
/* /src/components/auth/authServices/authServices.js -  servicios de los usuarios. */
/* ************************************************************************** */
const { User } = require('../../../models/users');
const JWTService = require('../../../utils/jwt/jwt');
const { createHash, isValidPassword } = require('../../../utils/bcrypt/bcrypt');
const { Cart } = require('../../../models/carts');
const { config } = require('../../../config');
/* Repository */
const { cartsServices } = require('../../../repositories/index');
const { usersServices } = require('../../../repositories/index');

class AuthServices {
  /* ///////////////////////////////////// */
  /* Jwt */
  /* ///////////////////////////////////// */
  register = async (payload, res) => {
    try {
      const { first_name, last_name, email, age, password } = payload;

      if (!first_name || !last_name || !email || !age || !password) {
        return res.sendServerError('Faltan campos obligatorios');
      }

      /* Repository */
      const existingUser = await usersServices.findOne({ email: email });

      if (existingUser) {
        return res.sendUserError('Ya existe un usuario con el mismo correo electrónico');
      }

      const newUser = new User({
        first_name,
        last_name,
        email,
        age,
        password: createHash(password),
      });

      /* Utilización de DTO de  /src/repositories/users.repository.js   */
      const savedUser = await usersServices.createUserDTO(newUser);

      const userCart = new Cart({
        user: savedUser._id,
        products: [],
      });

      /* Repository */
      await cartsServices.save(userCart);

      savedUser.cart = userCart._id;
      await savedUser.save();

      const data = newUser;
      const token = await JWTService.generateJwt({ id: savedUser._id });

      /* Repository */
      let updatedUser = await usersServices.findByIdAndUpdate(savedUser._id, { token }, { new: true });
      console.log('~~~User registrado~~~', updatedUser);
      return res.sendCreated({
        payload: {
          message: 'Usuario agregado correctamente',
          token,
          data,
        },
      });
    } catch (error) {
      return res.sendServerError('Error al agregar el usuario');
    }
  };

  login = async ({ email, password, isAdminLogin }) => {
    try {
      if (isAdminLogin) {
        const adminUser = {
          email: config.admin_email,
          admin: true,
          role: 'admin',
        };
        console.log('admin', adminUser);
        return { status: 200, success: true, response: adminUser, isAdminLogin: true };
      } else {
        /* Repository */
        let user = await usersServices.findOne({
          email: email,
        });

        if (!user) {
          console.log('~~~El usuario no existe en la base de datos!~~~');
          return { status: 401, success: false, response: 'El usuario no existe en la base de datos!' };
        }

        if (!isValidPassword(password, user)) {
          console.log('~~~Credenciales inválidas~~~');
          return { status: 403, success: false, response: 'Credenciales inválidas' };
        }

        console.log('~~~Login jwt success!~~~', user);
        return { status: 200, success: true, response: user, isAdminLogin: false };
      }
    } catch (error) {
      console.log(error);
      return { status: 500, success: false, response: 'Error en el servidor' };
    }
  };

  /* //////////////////////////////////// */
  /* Jwt & Session Logout */
  /* //////////////////////////////////// */
  logout = async (req, res) => {
    try {
      res.clearCookie('jwt');
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            const response = { status: 500, success: false, error: err };
            req.logoutResult = response;
            reject(response);
          } else {
            const response = { status: 200, success: true, message: 'Logout exitoso' };
            req.logoutResult = response;
            resolve(response);
          }
          console.log('Logout Session success');
        });
      });

      return req.logoutResult;
    } catch (err) {
      const response = { status: 500, success: false, error: 'Error durante el logout' };
      req.logoutResult = response;
      return response;
    }
  };
}

module.exports = new AuthServices();
