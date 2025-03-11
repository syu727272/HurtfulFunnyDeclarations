# Grok Tokyo Events API

This application fetches upcoming events in Tokyo using the Grok API. The application provides a simple REST API endpoint to retrieve events for the next month.

## Features

- Fetches upcoming events in Tokyo for the next month
- Returns up to 30 events with detailed information
- JSON format with approximately 10 fields per event
- Docker containerization for easy deployment
- CI/CD pipeline for automated testing and deployment

## Setup

### Prerequisites

- Node.js 16+ or Docker
- Grok API Key

### Environment Variables

Copy the `.env.example` file to `.env` and fill in your API key:

```bash
cp .env.example .env
```

Then edit the `.env` file and add your Grok API key:

```
XAI_API_KEY=your_api_key_here
```

### Installation

#### Using Node.js directly:

```bash
npm install
npm start
```

#### Using Docker:

```bash
docker-compose up -d
```

## API Endpoints

### GET /api/events

Retrieves events in Tokyo for the next month.

**Response Format:**
```json
[
  {
    "id": "event123",
    "title": "Tokyo Tech Festival",
    "description": "Annual technology showcase in Tokyo",
    "startDate": "2025-04-01T10:00:00+09:00",
    "endDate": "2025-04-01T18:00:00+09:00",
    "location": "Tokyo",
    "venue": "Tokyo International Exhibition Center",
    "organizer": "Tokyo Tech Association",
    "category": "Technology",
    "url": "https://example.com/events/tokyo-tech-festival"
  },
  ...
]
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "environment": "production"
}
```

## Development

### Debug Mode

Enable debug mode by setting `DEBUG_MODE=true` in the `.env` file.

### Testing

```bash
npm test
```

## Deployment

The application includes a CI/CD pipeline using GitHub Actions. Push to the main branch to trigger automatic testing and deployment.

## License

MIT
