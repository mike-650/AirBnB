const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { User, Spot, SpotImage, Review, ReviewImage, Booking } = require('../../db/models');
const { requireAuthentication, requireAuthorization, validateReviewInput } = require('../../utils/auth');

// NEED TO TEST
// Get All Bookings for Current User
router.get('/current', requireAuthentication, async (req, res) => {
  const bookings = await Booking.findAll({
    where: {
      userId: req.user.dataValues.id
    },
    include: [
      {
        model: Spot,
        attributes: {
          exclude: ['createdAt', 'updatedAt']
        },
        include: [
          {
            model: SpotImage
          }
        ]
      },
    ]
  });

  if (bookings.length === 0) {
    res.status(404).json({
      message: "There are currently no bookings for this User",
      status: 404
    })
  };

  const bookingsList = [];
  bookings.forEach(booking => {
    bookingsList.push(booking.toJSON());
  })

  bookingsList.forEach(booking => {
    booking.Spot.SpotImages.forEach(image => {
      if (image.preview === true) {
        booking.Spot.previewImage = image.preview;
      };
    });
    if (!booking.Spot.previewImage) {
      booking.Spot.previewImage = "No preview image available";
    };
    delete booking.Spot.SpotImages;
  });

 return res.json({ "Bookings": bookingsList });
});





module.exports = router;
