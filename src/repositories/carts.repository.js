const { Cart } = require('../models/carts');
const BaseRepository = require('./base.repository');

class CartsRepository extends BaseRepository {
  constructor() {
    super(Cart);
  }
  findCartById = async (id, populateOptions = {}) => {
    try {
      const item = await this.model.findById(id).populate(populateOptions).exec();
      if (!item) {
        console.log(`${this.model.modelName} not found in repository`);
        return null;
      }
      console.log(`${this.model.modelName}Repository findById running`);
      return item;
    } catch (error) {
      throw error;
    }
  };
}

module.exports = CartsRepository;
