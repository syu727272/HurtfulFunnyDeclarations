require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

// Initialize Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const XAI_API_KEY = process.env.XAI_API_KEY;
const NODE_ENV = process.env.NODE_ENV || 'development';
const DEBUG_MODE = process.env.DEBUG_MODE === 'true';

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  if (DEBUG_MODE) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// API Routes
app.get('/api/events', async (req, res) => {
  try {
    // Calculate date range (1 month from now)
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);
    
    const formattedToday = today.toISOString().split('T')[0];
    const formattedNextMonth = nextMonth.toISOString().split('T')[0];
    
    // Grok API request to fetch Tokyo events
    const response = await axios.get('https://api.grok.io/events', {
      headers: {
        'Authorization': `Bearer ${XAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      params: {
        location: 'Tokyo',
        startDate: formattedToday,
        endDate: formattedNextMonth,
        limit: 30
      }
    });
    
    // Format and return the events data
    const events = response.data.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate,
      endDate: event.endDate,
      location: event.location,
      venue: event.venue,
      organizer: event.organizer,
      category: event.category,
      url: event.url
    }));
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch events', 
      details: DEBUG_MODE ? error.message : null 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', environment: NODE_ENV });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  if (DEBUG_MODE) {
    console.log('Debug mode enabled');
  }
});

module.exports = app;
