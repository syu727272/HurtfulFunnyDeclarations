const request = require('supertest');
const app = require('../index');

// Mock the axios library to avoid real API calls
jest.mock('axios');
const axios = require('axios');

describe('Grok Tokyo Events API', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return a status of 200 and environment information', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /api/events', () => {
    it('should return events from the Grok API', async () => {
      // Mock the axios response
      const mockEvents = [
        {
          id: 'event123',
          title: 'Tokyo Tech Festival',
          description: 'Annual technology showcase in Tokyo',
          startDate: '2025-04-01T10:00:00+09:00',
          endDate: '2025-04-01T18:00:00+09:00',
          location: 'Tokyo',
          venue: 'Tokyo International Exhibition Center',
          organizer: 'Tokyo Tech Association',
          category: 'Technology',
          url: 'https://example.com/events/tokyo-tech-festival'
        }
      ];
      
      axios.get.mockResolvedValue({ data: mockEvents });
      
      const response = await request(app).get('/api/events');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      
      if (response.body.length > 0) {
        const event = response.body[0];
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('title');
        expect(event).toHaveProperty('description');
        expect(event).toHaveProperty('startDate');
        expect(event).toHaveProperty('endDate');
        expect(event).toHaveProperty('location');
        expect(event).toHaveProperty('venue');
        expect(event).toHaveProperty('organizer');
        expect(event).toHaveProperty('category');
        expect(event).toHaveProperty('url');
      }
      
      // Verify that axios was called with the correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        'https://api.grok.io/events',
        expect.objectContaining({
          params: expect.objectContaining({
            location: 'Tokyo',
            limit: 30
          })
        })
      );
    });
    
    it('should handle API errors', async () => {
      // Mock the axios error
      axios.get.mockRejectedValue(new Error('API error'));
      
      const response = await request(app).get('/api/events');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch events');
    });
  });
});
