/* ************************************************************************** */
/* /src/components/users/index.js - Contiene las rutas y controladores de 
usersController.js. */
/* ************************************************************************** */

const CustomRouter = require('../../routes/router');
const usersController = require('./usersController/usersController');
const { validateUserId } = require('../../utils/routes/routerParams');

class UsersRoutes extends CustomRouter {
  constructor() {
    super();
    this.setupRoutes();
  }

  setupRoutes() {
    // Middleware para manejar los parámetros cid y pid
    this.router.param('uid', validateUserId);

    const basePath = '/api/session/useradmin'; // Almacena el prefijo de la ruta

    /* ************************************************************************************ */
    /* Sistema de autorización para delimitar el acceso a endpoints:*/
    /* ************************************************************************************ */

    /* ************************************************************************************ */
    /* Public */
    /* ************************************************************************************ */
    this.get(`${basePath}/`, ['ADMIN'], usersController.getUsers);
    this.post(`${basePath}/recovery`, ['PUBLIC'], usersController.recoveryUser);
    /* ************************************************************************************ */
    /* Admin */
    /* ************************************************************************************ */
    this.post(`${basePath}/register`, ['ADMIN'], usersController.addUser);
    this.get(`${basePath}/:uid`, ['ADMIN'], usersController.getUserById);
    this.put(`${basePath}/:uid`, ['ADMIN'], usersController.updateUser);
    this.delete(`${basePath}/:uid`, ['ADMIN'], usersController.deleteUser);
  }
}

module.exports = new UsersRoutes();
