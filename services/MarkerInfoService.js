const MarkerInfo = require('../models/MarkerInfo');  // If using models
const db = require('../config/db.config');
const app = require("../index")


const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectId;

// Place in db config
const uri = "mongodb://mongoadmin:mongoadmin@mongo:27017";
// const uri = "mongodb://mongoadmin:mongoadmin@localhost:27017";
const client = new MongoClient(uri,);

async function connectToMongoDB() {
  //export
  try {
    await client.connect();
    // console.log('Connected to MongoDB successfully!');
    return client.db('markerInfo');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

exports.getAllMarkers = async () => {
  const db = await connectToMongoDB();
  const collection = db.collection('info');
  const response = await collection.find().toArray();
  return response;
};

exports.getMarkerById = async (id) => {
  const db = await connectToMongoDB();
  const collection = db.collection('info');
  const response = await collection.findOne({ _id: new ObjectID(id) });

  const combinedResponse = {
    ...response,
    // userId: await app.requestUserInfo(response.userId),
    car: await app.requestCarInfo(response.car),
  };

  return combinedResponse;
};

exports.createMarker = async (markerInfo) => {
  const db = await connectToMongoDB();
  const collection = db.collection('info')
  const result = await collection.insertOne(markerInfo);
  return { message: 'Document created successfully', data: result.insertedId };
};

exports.updateMarker = async (id, updatedData) => {
  const db = await connectToMongoDB();
  const collection = db.collection('info')
  const result = await collection.updateOne({ _id: new ObjectID(id) }, { $set: updatedData });
  return { message: 'Document updated successfully' };
};

exports.deleteMarker = async (id) => {
  const db = await connectToMongoDB();
  const collection = db.collection('info')
  const result = await collection.deleteOne({ _id: new ObjectID(id) });
  return { message: 'Document updated successfully' };
};