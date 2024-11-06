// services/carInfoService.js
const MarkerInfo = require('../models/MarkerInfo');  // If using models
const db = require('../config/db.config');

const test = require("../index")

exports.getAllMarkers = async () => {
  const response = await db.collection('markerInfo').get();
  let responseArr = [];

  response.forEach(doc => {
    console.log(doc.data())
    responseArr.push(doc.data());
  });
  return responseArr;
};

exports.getMarkerById = async (id) => {

  const markerRef = db.collection('markerInfo').doc(id);
  const markerData = await markerRef.get();

  // console.log(markerData.data().car)
  // test.requestCarInfo(markerData.data().car)

  //   const combinedResponse = {
  //     ...markerData.data(),
  //     car: carData,
  // };

  // res.send(combinedResponse);

  return markerData.data();
};

exports.createMarker = async (markerInfo) => {

  const docRef = await db.collection('markerInfo').add(markerInfo);
  return { message: 'markerInfo created successfully', id: docRef.id };
};

exports.updateMarker = async (id, updatedData) => {
  const docRef = db.collection('markerInfo').doc(id);
  await docRef.update(updatedData);
  return { message: 'markerInfo updated successfully' };
};

exports.deleteMarker = async (id) => {
  const docRef = db.collection('markerInfo').doc(id);
  await docRef.delete();
  return { message: 'markerInfo deleted successfully' };
};