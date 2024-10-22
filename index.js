const express = require('express')
const cors = require('cors')
const amqplib = require('amqplib')
const admin = require('firebase-admin');
var serviceAccount = require("./key.json");

const app = express();
app.use(cors());

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Messagig
const port = 5002;
var connection = null;
var channel = null;

// API
app.get('/read/all', async (req, res) => {
    try {
        const markerRef = db.collection('markerInfo');
        const response = await markerRef.get();
        let responseArr = [];
        response.forEach(doc => {
            responseArr.push(doc.data());
        })
        res.send(responseArr);
    }
    catch (error) {
        res.send(error);
    }
})

// add connection to user, so when showing the markerinfo also show user (and car)
app.get('/read/:id', async (req, res) => {
    try {
        const markerRef = db.collection('markerInfo').doc(req.params.id);
        const markerData = await markerRef.get();

        //car and user
        // const responseMessage = await sendMessage(req.params.id);

        // You can now use responseMessage here
        const combinedResponse = {
            markerData: markerData.data(),
            // dataFromOtherSource: responseMessage
        };
        res.send(combinedResponse);
    } catch (error) {
        res.send(error);
    }
})

app.post('/create', async (req, res) => {
    try {
        const { lastSeen, location, userId, car } = req.body;

        const newData = {
            lastSeen: new admin.firestore.Timestamp(lastSeen._seconds, lastSeen._nanoseconds), 
            location: new admin.firestore.GeoPoint(location.latitude, location.longitude), 
            userId, 
            car,
        };

        const docRef = await db.collection('markerInfo').add(newData);

        res.status(201).json({ message: 'carInfo created successfully', id: docRef.id });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

const db = admin.firestore();

app.listen(port, async () => {
    console.log(`Server is running on PORT ${port}`);
});