import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URI);
    console.log(connect.connection.host);
    console.log(connect.connection.port);
    console.log("Mongoose connection established");
  } catch (error) {
    console.log(`Error connecting to MongoDB : ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
