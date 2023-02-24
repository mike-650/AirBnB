'use strict';

let options = {};
options.tableName = 'SpotImages'
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(options, [
      {
        spotId: 1,
        url: "falseImage.lol/image",
        preview: false
      },
      {
        spotId: 1,
        url: "https://static.wikia.nocookie.net/supermarioglitchy4/images/c/ca/7D5C7CB2-76B4-4FD5-8D47-59B4BCD688D4.jpeg/revision/latest?cb=20200307170201",
        preview: true
      },
      {
        spotId: 2,
        url: "https://static.wikia.nocookie.net/finalfantasy/images/b/b7/Nibelheim-SiblingsHouse1f-ffvii.png/revision/latest?cb=20140818063523",
        preview: true
      },
      {
        spotId: 2,
        url: "googalia.lol/randomImg3",
        preview: false
      },
      {
        spotId: 3,
        url: "yawhooha.lol/randomImg5",
        preview: false
      },
      {
        spotId: 3,
        url: "yawhoo.lol/arbitraryImage",
        preview: true
      },
      {
        spotId: 7,
        url: "https://wehco.media.clients.ellingtoncms.com/imports/adg/photos/102548280_1711d3bca3cce53a95a43d5f3bca2f65-o_a_t800.jpg?90232451fbcadccc64a17de7521d859a8f88077d",
        preview: true
      }
    ], {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(options, {}, {});
  }
};
