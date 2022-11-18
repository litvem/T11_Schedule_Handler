const { default: mongoose } = require("mongoose");

mongoose.connect(
  "mongodb://localhost:27017/dentistimoDB",
  { useNewUrlParser: true },
  (err) => {
    if (err) {
      console.error("Failed to connect to MongoDB");
      process.exit(1);
    }
    console.log("Connected to Mongo database: dentistimoDB");
  }
);

module.exports = mongoose;
