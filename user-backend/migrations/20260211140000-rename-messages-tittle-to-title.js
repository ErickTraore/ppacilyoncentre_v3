'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'Messages';
    const oldCol = 'tittle';
    const newCol = 'title';

    const desc = await queryInterface.describeTable(table);
    if (desc[oldCol] && !desc[newCol]) {
      await queryInterface.renameColumn(table, oldCol, newCol);
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'Messages';
    const oldCol = 'tittle';
    const newCol = 'title';

    const desc = await queryInterface.describeTable(table);
    if (desc[newCol] && !desc[oldCol]) {
      await queryInterface.renameColumn(table, newCol, oldCol);
    }
  },
};

