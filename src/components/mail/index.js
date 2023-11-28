const CustomRouter = require('../../routes/router');
const mailController = require('./maillController/mailController');
/* const { validateMessageId } = require('../../utils/routes/routerParams'); */

class mailRoutes extends CustomRouter {
  constructor() {
    super();
    this.setupRoutes();
  }

  setupRoutes() {
    // Middleware para manejar el parámetro eid
    /* this.router.param('eid', validateMessageId); */

    const basePath = '/mail'; 
    /* Sistema de autorización para delimitar el acceso a endpoints:*/

    // Rutas para manejar los mensajes

    this.post(`${basePath}/`, ['ADMIN'], mailController.sendMail);
  }
}

module.exports = new mailRoutes();
