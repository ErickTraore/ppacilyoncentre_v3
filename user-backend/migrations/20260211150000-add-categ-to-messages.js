'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'categ', {
      type: Sequelize.STRING(64),
      allowNull: true,
      defaultValue: 'presse',
    });
    await queryInterface.sequelize.query(
      "UPDATE Messages SET categ = 'presse' WHERE categ IS NULL"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Messages', 'categ');
  },
};
