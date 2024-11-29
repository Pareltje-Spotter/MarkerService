const markerInfoService = require('../services/MarkerInfoService');
const admin = require('firebase-admin');

exports.getMarkers = async (req, res) => {
    try {
        const markers = await markerInfoService.getAllMarkers();
        res.status(200).json(markers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve cars' });
    }
};

exports.getMarkerById = async (req, res) => {
    try {
        const id = req.params.id;

        const marker = await markerInfoService.getMarkerById(id);
        if (!marker) {
            return res.status(404).json({ error: 'Marker not found' });
        }
        res.status(200).json(marker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve Marker: ' + error });
    }
};

exports.createMarker = async (req, res) => {
    try {
        const { lastSeen, location, userId, car } = req.body;
        const newMarker = await markerInfoService.createMarker(req.body);
        res.status(201).json(newMarker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create marker' });
    }
};

exports.updateMarker = async (req, res) => {
    try {
        const { lastSeen, location, userId, car } = req.body;
        const id = req.params.id;
        const updatedMarker = await markerInfoService.updateMarker(id, req.body);
        res.status(200).json(updatedMarker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update marker' });
    }
};

exports.deleteMarker = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedMarker = await markerInfoService.deleteMarker(id);
        // res.status(204).send(); // No content
        res.status(200).json(deletedMarker);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete marker' });
    }
};