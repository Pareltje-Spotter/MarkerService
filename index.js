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

async function requestCarInfo(licenseplate) {
    connection = await amqplib.connect('amqp://rabbitmq:rabbitmq@rabbitmq');
    channel = await connection.createChannel();

    const queue = 'markerQueue';

    await channel.assertQueue(queue, {
        durable: false
    });

    const correlationId = licenseplate.toString();
    console.log(' [x] Requesting car info:');

    return new Promise((resolve, reject) => {
        channel.consume(queue, function (msg) {
            if (msg.properties.correlationId === correlationId) {
                console.log(' [.] Got: %s', JSON.parse(msg.content) );
                connection.close();
                resolve(JSON.parse(msg.content));
            }
        }, {
            noAck: true
        });

        channel.sendToQueue('carQueue',
            Buffer.from(licenseplate), {
            correlationId: correlationId,
            replyTo: queue
        });
    });
}

// API
app.get('markerinfo', async (req, res) => {
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
app.get('/markerinfo/:id', async (req, res) => {
    try {
        const markerRef = db.collection('markerInfo').doc(req.params.id);
        const markerData = await markerRef.get();

        const licenseplate = markerData.data().car;
        const carData = await requestCarInfo(licenseplate);

        // Overwrite the existing car data
        const combinedResponse = {
            ...markerData.data(),
            car: carData,
        };

        res.send(combinedResponse);
    } catch (error) {
        res.send(error);
    }
})

//read/id & read/id met data

app.post('/markerinfo/create', async (req, res) => {
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

//  Actual Id is used (6r37Hb0lUSeCS6kPwYoR), maybe change this later 
app.put('/markerinfo/update/:id', async (req, res) => {
    try {
        const { lastSeen, location, userId, car } = req.body;
        // Retrieve the ID from the request parameters
        const id = req.params.id;
        // Retrieve the updated data from the request body
        const updatedData = {
            lastSeen: new admin.firestore.Timestamp(lastSeen._seconds, lastSeen._nanoseconds),
            location: new admin.firestore.GeoPoint(location.latitude, location.longitude),
            userId,
            car
        };
        // Get a reference to the document to be updated
        const docRef = admin.firestore().collection('markerInfo').doc(id);
        // Update the document
        await docRef.update(updatedData);

        res.status(200).json({ message: 'Document updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

app.delete('/markerinfo/delete/:id', async (req, res) => {
    try {
        const docRef = db.collection('markerInfo').doc(req.params.id);
        await docRef.delete();

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
})


const db = admin.firestore();

app.listen(port, async () => {
    console.log(`Server is running on PORT ${port}`);
});