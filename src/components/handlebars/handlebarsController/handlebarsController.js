const HandlebarsServices = require('../handlebarsServices/handlebarsServices');
const { usersServices } = require('../../../repositories/index');

class HandlebarsController {
  getLogin = async (req, res) => {
    const data = await HandlebarsServices.getLogin(res);
    return res.render('login', data);
  };

  getRegister = async (req, res) => {
    const data = await HandlebarsServices.getRegister(res);
    return res.render('register', data);
  };

  getRecovery = async (req, res) => {
    const data = await HandlebarsServices.getRecovery(res);
    return res.render('recovery', data);
  };

  /*   getUser = async (req, res) => {
    const data = await HandlebarsServices.getUser(res);
    const context = { user: req.session.user || req.user, ...data };
    return res.render('profile', context);
  }; */
  getUser = async (req, res) => {
    const data = await HandlebarsServices.getUser(res);
    const userData = req.session.user || req.user;
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);

    // Utiliza userWithCurrentDTO en el contexto
    const context = { user: userWithCurrentDTO, ...data };
    return res.render('profile', context);
  };

  getAdmin = async (req, res) => {
    const data = await HandlebarsServices.getAdmin(res);
    const userData = req.session.user || req.user;
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);
    const context = { user: userWithCurrentDTO, ...data };
    return res.render('dashboard', context);
  };

  getCurrent = async (req, res) => {
    const data = await HandlebarsServices.getCurrent(res);

    // Verifica si req.session.user o req.user están definidos
    const user = req.session.user || req.user;
    if (!user) {
      // Maneja el caso en el que el usuario no está definido (por ejemplo, no ha iniciado sesión)
      // Puedes devolver un mensaje de error o redirigir a una página de inicio de sesión.
      return res.sendServerError('Usuario no autorizado');
    }

    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(user);
    console.log('userWithCurrentDTO getCurrent running', userWithCurrentDTO);
    // Utiliza userWithCurrentDTO en el contexto
    const context = { user: userWithCurrentDTO, ...data };
    return res.render('current', context);
  };

  async getProducts(req, res) {
    const { limit, page, sort, query } = req.query;
    const userData = req.session.user || req.user;
    const data = await HandlebarsServices.getProducts(limit, page, sort, query, res, userData);

    // Filtra y estructura los datos del usuario utilizando getUserWithCurrentDTO
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);

    console.log('userWithCurrentDTO getProducts running', userWithCurrentDTO);
    // Utiliza userWithCurrentDTO en el contexto
    const context = { user: userWithCurrentDTO, ...data };

    return res.render('products', context);
  }

  async getCartProductById(req, res) {
    const { cid } = req.params;
    const cartId = cid;
    const userData = req.session.user || req.user;

    // Filtra y estructura los datos del usuario utilizando getUserWithCurrentDTO
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);
    console.log('userWithCurrentDTO getCartProductById running', userWithCurrentDTO);

    // Utiliza userWithCurrentDTO en la función HandlebarsServices.getCartProductById
    const data = await HandlebarsServices.getCartProductById(cartId, res, userWithCurrentDTO);

    return res.render('carts', data);
  }

  async getRealTimeProducts(req, res) {
    const { limit, page, sort, query } = req.query;
    const userData = req.session.user || req.user;

    // Filtra y estructura los datos del usuario utilizando getUserWithCurrentDTO
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);
    console.log('userWithCurrentDTO getRealTimeProducts running', userWithCurrentDTO);
    // Utiliza userWithCurrentDTO en la función HandlebarsServices.getRealTimeProducts
    const data = await HandlebarsServices.getRealTimeProducts(limit, page, sort, query, res, userWithCurrentDTO);

    return res.render('realTimeProducts', data);
  }

  async getAdminProducts(req, res) {
    const { limit, page, sort, query } = req.query;
    const userData = req.session.user || req.user;
    const data = await HandlebarsServices.getAdminProducts(limit, page, sort, query, res, userData);

    // Filtra y estructura los datos del usuario utilizando getUserWithCurrentDTO
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);

    console.log('userWithCurrentDTO getProducts running', userWithCurrentDTO);
    // Utiliza userWithCurrentDTO en el contexto
    const context = { user: userWithCurrentDTO, ...data };

    return res.render('adminProducts', context);
  }

  async getHomeProducts(req, res) {
    const { limit, page, sort, query } = req.query;
    const userData = req.session.user || req.user;

    // Filtra y estructura los datos del usuario utilizando getUserWithCurrentDTO
    const userWithCurrentDTO = await usersServices.getUserWithCurrentDTO(userData);
    console.log('userWithCurrentDTO getHomeProducts running', userWithCurrentDTO);
    // Utiliza userWithCurrentDTO en la función HandlebarsServices.getRealTimeProducts
    // Utiliza userWithCurrentDTO en la función HandlebarsServices.getHomeProducts
    const data = await HandlebarsServices.getHomeProducts(limit, page, sort, query, res, userWithCurrentDTO);

    return res.render('home', data);
  }

  getChat = async (req, res) => {
    const data = await HandlebarsServices.getChat(res);
    return res.render('chat', data);
  };
}

module.exports = new HandlebarsController();
