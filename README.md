# Wonderlog API

A robust RESTful API for the Wonderlog blogging platform, built with Node.js, Express, and Prisma.

## Related Repositories

- [Wonderlog Web](https://github.com/bereketkib/wonderlog-web) - Main web application
- [Wonderlog Dashboard](https://github.com/bereketkib/wonderlog-dashboard) - Author's dashboard

## Features

- User authentication with JWT
- Role-based authorization (User and Author roles)
- Blog post management with draft/publish functionality
- Comment system
- Pagination and search capabilities
- Refresh token rotation
- Error handling and validation

## Tech Stack

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL
- JSON Web Tokens (JWT)
- bcrypt for password hashing

## API Endpoints

### Authentication

```bash
POST /auth/register     # Register a new user
POST /auth/login       # Login user
DELETE /auth/logout    # Logout user
POST /auth/refresh     # Refresh access token
```

### Users

```bash
POST /users/upgrade-to-author    # Upgrade user to author role
```

### Posts

```bash
# Public endpoints
GET /posts            # Get all published posts
GET /posts/:id        # Get a specific published post

# Author endpoints
GET /posts/my         # Get author's posts
POST /posts/my        # Create new post
PUT /posts/my/:id     # Update post
DELETE /posts/my/:id  # Delete post
```

### Comments

```bash
POST /comments/:postId    # Create comment
PUT /comments/:id        # Update comment
DELETE /comments/:id     # Delete comment
GET /comments/my         # Get user's comments
```

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/wonderlog-api.git
cd wonderlog-api
```

````

2. Install dependencies
```bash
npm install
````

3. Set up environment variables

```bash
cp .env.example .env
```

Required environment variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/wonderlog"
JWT_SECRET="your-jwt-secret"
REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRY="15m"
REFRESH_EXPIRY="7d"
PORT=3000
```

````

4. Run database migrations
```bash
npx prisma migrate dev
````

5. Start the server

```bash
npm run dev    # Development
npm start      # Production
```

## API Documentation

### Authentication

All protected routes require a Bearer token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Response Format

Success Response:

```json
{
  "data": {},
  "message": "Operation successful"
}
```

Error Response:

```json
{
  "status": "error",
  "message": "Error description"
}
```

### Pagination

Endpoints that return lists support pagination:

```bash
GET /posts?page=1&limit=10&search=keyword
```

Response includes pagination metadata:

```json
{
  "posts": [],
  "pagination": {
    "total": 100,
    "pages": 10,
    "currentPage": 1,
    "hasMore": true
  }
}
```

## Error Handling

The API implements standard HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- HTTP-only cookies for refresh tokens
- Role-based access control
- Input validation
- Security headers
- Rate limiting

## Testing

Run the test suite:

```bash
npm test
```

Test API endpoints using the provided request collection:

```bash
tests/requests.rest
```

## Contributing

1. Fork the repository
2. Create your feature branch ( git checkout -b feature/amazing-feature )
3. Commit your changes ( git commit -m 'Add amazing feature' )
4. Push to the branch ( git push origin feature/amazing-feature )
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

Bereket Kibreab

## Acknowledgments

- Node.js community
- Express.js team
- Prisma team
