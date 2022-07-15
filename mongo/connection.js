const mongoose = require("mongoose");

module.exports = {
  connect: () => {
    mongoose.Promise = global.Promise;
    return mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  },
  disconnect: () => {
    return mongoose.disconnect();
  },
};
