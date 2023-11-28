/* ************************************************************************** */
/* /src/components/users/usersServices/usersServices.js -
 controlador de los usuarios. */
/* ************************************************************************** */

const { User } = require('../../../models/users');
const { Cart } = require('../../../models/carts');
const { createHash } = require('../../../utils/bcrypt/bcrypt');
/* Repository */
const { usersServices } = require('../../../repositories/index');
const { cartsServices } = require('../../../repositories/index');

class UsersServices {
  /* ////////////////////////////////////////// */
  /* Jwt */
  /* ////////////////////////////////////////// */

  getUsers = async (res) => {
    try {
      /* Repository */
      const users = await usersServices.findAll();
      const data = users;
      return res.sendSuccess({ message: 'Todos los usuarios', payload: data });
    } catch (error) {
      return res.sendServerError('Error al obtener los usuarios');
    }
  };

  addUser = async (payload, res) => {
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

      /* Repository */
      await usersServices.save(newUser);

      const userCart = new Cart({
        user: newUser._id,
        products: [],
      });

      /* Repository */
      await cartsServices.save(userCart);

      newUser.cart = userCart._id;

      const data = newUser;

      return res.sendCreated({ message: 'Usuario agregado correctamente', payload: data });
    } catch (error) {
      return res.sendServerError('Error al agregar el usuario');
    }
  };

  recoveryUser = async ({ email, password, res }) => {
    try {
      /* Repository */
      let user = await usersServices.findOne({
        email: email,
      });

      if (!user) {
        return res.sendUnauthorized('El usuario no existe en la base de datos');
      }

      /* Repository */
      let data = await usersServices.findByIdAndUpdate(user._id, { password: createHash(password) }, { new: true });

      return res.sendSuccess({ message: 'Contraseña actualizada correctamente', payload: data });
    } catch (error) {
      return res.sendServerError('Error al recuperar la contraseña');
    }
  };

  getUserById = async (uid, res) => {
    try {
      /* Repository */
      const user = await usersServices.findById(uid);

      if (!user) {
        return res.sendNotFound('Usuario no encontrado');
      }

      const data = user;

      return res.sendSuccess({ message: 'Usuario obtenido correctamente', payload: data });
    } catch (error) {
      return res.sendServerError('Error al obtener el usuario');
    }
  };

  updateUser = async (uid, updateFields, res, req) => {
    try {
      const allowedFields = ['first_name', 'last_name', 'email', 'age', 'password', 'role'];

      const invalidFields = Object.keys(updateFields).filter((field) => !allowedFields.includes(field));

      if (invalidFields.length > 0) {
        return res.sendUserError(`Los siguientes campos no se pueden modificar: ${invalidFields.join(', ')}`);
      }

      /* Repository */
      const updatedUser = await usersServices.findByIdAndUpdate(uid, updateFields, { new: true });

      if (!updatedUser) {
        return res.sendNotFound('Usuario no encontrado');
      }

      req.app.io.emit('updateUser', updatedUser);

      const data = updatedUser;

      return res.sendSuccess({ message: 'Usuario actualizado correctamente', payload: data });
    } catch (error) {
      return res.sendServerError('Error al actualizar el usuario');
    }
  };

  deleteUser = async (uid, res, req) => {
    try {
      /* Repository */
      const deletedUser = await usersServices.findByIdAndDelete(uid);

      if (!deletedUser) {
        return res.sendNotFound('Usuario no encontrado');
      }

      req.app.io.emit('deleteUser', uid);
      const data = deletedUser;
      return res.sendSuccess({ message: 'Usuario eliminado correctamente', payload: data });
    } catch (error) {
      return res.sendServerError('Error al eliminar el usuario');
    }
  };
}

module.exports = new UsersServices();
