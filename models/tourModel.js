const mongoose = require('mongoose');
const slugify = require('slugify');
const User = require('../models/userModel.js');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tours must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'Tour must have less then 40 or equal to 40 characters !',
      ],
      minlength: [10, 'Tour must have more than 10 characters !'],
    },
    slug: {
      type: String,
    },
    price: {
      type: Number,
      // required: [true,'Tours must have  a name'],
      // unique: true
    },
    duration: {
      type: Number,
      required: [true, 'Must have a Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'Must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'Must have a Difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'smth',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must have below 5'],
      min: [1, 'Rating must have above 1'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    priceDiscount: {
      type: Number,
      validator: {
        function(val) {
          return val < this.price;
        },

        message: 'Dsicount price shouldbe below regular price',
      },
    },

    summary: {
      type: String,
      trim: true,
      required: [true, 'Tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'Tour must have image'],
    },
    images: [String],

    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
    startDates: [Date],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});
// Document Middleware

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.post('save',function(doc,next){
//   console.log(doc);
//   next();
// })
// tourSchema.pre('save',function(next){
//   console.log('It will save the Document ...');
//   next();
// })

tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();

  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});
// tourSchema.post(/^find/, function (docs, next) {
//   // console.log(docs);
//   console.log(`Query takes ${Date.now() - this.start} in milliseconds`);

//   next();
// });

// Aggregation Middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({$match:{secretTour:{$ne:true}}});
//   console.log(this.pipeline());
//   next();
// });

// Compile the schema into a model
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
