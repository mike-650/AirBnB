const express = require('express');
const router = express.Router();
const Sequelize = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { User, Spot, SpotImage, Review } = require('../../db/models');
const { requireAuthentication, requireAuthorization } = require('../../utils/auth');
const { runInContext } = require('vm');

const validateSpotInput = [
  check('address')
    .exists({ checkFalsy: true })
    .withMessage('Street address is required'),
  check('city')
    .exists({ checkFalsy: true })
    .withMessage('City is required'),
  check('state')
    .exists({ checkFalsy: true })
    .withMessage('State is required'),
  check('country')
    .exists({ checkFalsy: true })
    .withMessage('Country is required'),
  check('lat')
    .exists({ checkFalsy: true })
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude is not valid'),
  check('lng')
    .exists({ checkFalsy: true })
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude is not valid'),
  check('name')
    .exists({ checkFalsy: true })
    .isLength({ max: 50 })
    .withMessage('Name must be less than 50 characters'),
  check('description')
    .exists({ checkFalsy: true })
    .withMessage('Description is required'),
  check('price')
    .exists({ checkFalsy: true })
    .withMessage('Price per day is required'),
  handleValidationErrors
];

// Get All Spots
router.get('/', async (req, res) => {
  const spots = await Spot.findAll({
    include: [
      {
        model: Review
      },
      {
        model: User,
        as: 'Owner'
      }
    ]
  })


  res.json(spots)
});

// Get All Spots by Current User *Authentication Required*
router.get('/current', requireAuthentication, async (req, res) => {
  // req.user.dataValues.id <-- current user's id
  const spots = await Spot.findAll({
    where: {
      ownerId: req.user.dataValues.id
    },
    attributes: {
      // find average rating and alias it as 'avgRating'
      include: [[Sequelize.fn('AVG', Sequelize.col('reviews.stars')), 'avgRating']]
    },
    include: [
      {
        model: Review,
        // don't include any attributes from the Review model in the output
        attributes: []
      },
      {
        model: SpotImage,
        separate: true
      }
    ],
    // group by spot id to get the average for each unique spot
    group: ['spot.id']
  });

  let spotsList = [];

  // allows us to manipulate each POJO
  spots.forEach(spot => {
    spotsList.push(spot.toJSON());
  })

  // Iterate through the SpotImages array to find the preview image
  // if there is one, and set previewImage to the url
  spotsList.forEach(spot => {
    spot.SpotImages.forEach(image => {
      if (image.preview === true) {
        spot.previewImage = image.url
      };
    });
    if (!spot.previewImage) {
      spot.previewImage = 'null';
    };

    // set the avgRating to 0 if the eager load from earlier returned null
    if (spot.avgRating === null) {
      spot.avgRating = 0.0;
    };
    delete spot.SpotImages;
  });

  return res.status(200).json({ 'Spots': spotsList });
});

// Get a spot by Id
router.get('/:spotId', async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findOne({
    where: { id: spotId },
    include: [
      {
        model: SpotImage,
        attributes: ['id', 'url', 'preview'],
      },
      {
        model: User,
        as: 'Owner',
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: Review,
        attributes: [],
      }
    ],
    attributes: {
      include: [
        // Find all the reviews and calc the avg rating associated with this Spot Model
        [Sequelize.fn('COUNT', Sequelize.col('reviews.id')), 'numReviews'],
        [Sequelize.fn('AVG', Sequelize.col('reviews.stars')), 'avgStarRating']
      ]
    },
    //
    group: ['Spot.id', 'SpotImages.id', 'Owner.id']
  });

  if (spot === null) {
    return res.status(404).json({
      "message": "Spot couldn't be found",
      "statusCode": 404
    });
  };
  return res.json(spot);
})

// Create a Spot
router.post('/', [requireAuthentication, validateSpotInput], async (req, res) => {
  const {
    address, city, state,
    country, lat, lng,
    name, description, price
  } = req.body;

  const ownerId = req.user.dataValues.id;

  let spot = await Spot.createSpot(
    {
      ownerId, address, city,
      state, country, lat, lng,
      name, description, price
    });

  return res.status(201).json(spot);
})

// Add an Image to a Spot based on Spot's id
router.post('/:spotId/images', [requireAuthentication, requireAuthorization], async (req, res)=> {

})

module.exports = router;
