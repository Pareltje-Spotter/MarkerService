const express = require('express')
const cors = require('cors')
const amqplib = require('amqplib')
const admin = require('firebase-admin');
const markerInfoController = require('./controllers/MarkerInfoController');

const app = express();
app.use(cors());

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const router = express.Router();
app.use('/markerinfo', router);
router.get('/', markerInfoController.getMarkers);
router.get('/:id', markerInfoController.getMarkerById);
router.post('/create', markerInfoController.createMarker);
router.put('/update/:id', markerInfoController.updateMarker);
router.delete('/delete/:id', markerInfoController.deleteMarker);

// Messagig
const port = 5002;
var connection = null;
var channel = null;

exports.requestCarInfo = async (licenseplate) => {
    // connection = await amqplib.connect('amqp://rabbitmq:rabbitmq@rabbitmq');
    connection = await amqplib.connect('amqp://rabbitmq:rabbitmq@localhost');
    channel = await connection.createChannel();

    const queue = 'markerCarQueue';

    await channel.assertQueue(queue, {
        durable: false
    });

    const correlationId = licenseplate.toString();
    console.log(' [x] Requesting car info:');

    return new Promise((resolve, reject) => {
        channel.consume(queue, function (msg) {
            if (msg.properties.correlationId === correlationId) {
                console.log(' [.] Got: %s', JSON.parse(msg.content));
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

exports.requestUserInfo = async (userId) => {
    connection = await amqplib.connect('amqp://rabbitmq:rabbitmq@rabbitmq');
    // connection = await amqplib.connect('amqp://rabbitmq:rabbitmq@localhost');

    channel = await connection.createChannel();

    const queue = 'markerUserQueue';

    await channel.assertQueue(queue, {
        durable: false
    });

    
    const correlationId = userId.toString();
    console.log(' [x] Requesting user info:' + correlationId);

    return new Promise((resolve, reject) => {
        channel.consume(queue, function (msg) {
            if (msg.properties.correlationId === correlationId) {
                console.log(' [.] Got: %s', JSON.parse(msg.content));
                connection.close();
                resolve(JSON.parse(msg.content));
            }
        }, {
            noAck: true
        });

        channel.sendToQueue('userQueue',
            Buffer.from(userId), {
            correlationId: correlationId,
            replyTo: queue
        });
    });
}

app.listen(port, async () => {
    console.log(`Server is running on PORT ${port}`);
});