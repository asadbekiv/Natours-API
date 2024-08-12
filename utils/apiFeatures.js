class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFiels = ['page', 'sort', 'limit', 'fields'];
    excludedFiels.forEach((el) => delete queryObj[el]);
    // 2 ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => '$${match}');

    this.query.find(JSON.parse(queryStr));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      let sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFileds() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      // console.log(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // console.log(page);
    // console.log(limit);

    this.query = this.query.skip(skip).limit(limit);

    // if(this.queryString.page){
    //     const numberTours=await Tour.countDocuments();
    //     if(skip>=numberTours)throw new Error('This page does not exsist !')
    // }
    return this;
  }
}

module.exports = APIFeatures;
