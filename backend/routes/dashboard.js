const express = require('express');
const axios = require('axios');
const { protect } = require('../middleware/authMiddleware');
const db = require('../database');
const router = express.Router();

// GET /api/dashboard
router.get('/', protect, async (req, res) => {
    const userId = req.user.id;
    let weatherData = null;

    try {
        // 1. Fetch user info (including location) and notebooks
        const userSql = 'SELECT id, username, location FROM users WHERE id = ?';
        const notebooksSql = 'SELECT id, name FROM notebooks WHERE userId = ? ORDER BY name';

        const userPromise = new Promise((resolve, reject) => {
            db.get(userSql, [userId], (err, row) => err ? reject(err) : resolve(row));
        });

        const notebooksPromise = new Promise((resolve, reject) => {
            db.all(notebooksSql, [userId], (err, rows) => err ? reject(err) : resolve(rows));
        });

        const [user, notebooks] = await Promise.all([userPromise, notebooksPromise]);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. If user has a location and API key is set, fetch weather
        if (user.location && process.env.WEATHER_API_KEY && process.env.WEATHER_API_KEY !== 'your_openweathermap_api_key_here') {
            try {
                const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${user.location}&appid=${process.env.WEATHER_API_KEY}&units=metric`;
                const weatherResponse = await axios.get(weatherUrl);
                weatherData = {
                    temp: weatherResponse.data.main.temp,
                    description: weatherResponse.data.weather[0].description,
                    icon: weatherResponse.data.weather[0].icon,
                    city: weatherResponse.data.name,
                };
            } catch (weatherError) {
                console.error("Could not fetch weather data:", weatherError.message);
                weatherData = { error: "Could not fetch weather data." };
            }
        }

        // 3. Combine and send response
        res.json({
            user: { username: user.username, location: user.location },
            notebooks,
            weather: weatherData
        });

    } catch (error) {
        console.error('Dashboard fetch error:', error);
        res.status(500).json({ message: 'Server error fetching dashboard data' });
    }
});

module.exports = router;
