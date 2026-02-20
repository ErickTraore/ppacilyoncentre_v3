'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const [tables] = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'Messages'"
    );
    if (Array.isArray(tables) && tables.length > 0) {
      await queryInterface.renameTable('Messages', 'PresseGle');
    }
  },

  async down(queryInterface) {
    const [tables] = await queryInterface.sequelize.query(
      "SHOW TABLES LIKE 'PresseGle'"
    );
    if (Array.isArray(tables) && tables.length > 0) {
      await queryInterface.renameTable('PresseGle', 'Messages');
    }
  },
};
