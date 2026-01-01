# FADs by PHURAY - Backend API

A production-ready Node.js/Express e-commerce API with MongoDB integration, authentication, and order management.

## Features

✅ RESTful API with proper error handling  
✅ MongoDB integration with Mongoose ODM  
✅ JWT-based authentication  
✅ Admin panel with order management  
✅ Product management (CRUD)  
✅ Order tracking and management  
✅ CORS enabled for frontend integration  
✅ Environment-based configuration  
✅ Validation and sanitization  
✅ Pagination support  

## Tech Stack

- **Framework**: Express.js 4.18+
- **Database**: MongoDB 5.0+
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs for password hashing
- **Validation**: express-validator
- **CORS**: Cross-origin resource sharing
- **Development**: Nodemon for hot reload

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js    # Auth logic
│   │   ├── productController.js # Product logic
│   │   └── orderController.js   # Order logic
│   ├── middleware/
│   │   ├── auth.js              # JWT & role middleware
│   │   └── errorHandler.js      # Error handling
│   ├── models/
│   │   ├── Product.js           # Product schema
│   │   ├── Order.js             # Order schema
│   │   └── User.js              # User schema
│   ├── routes/
│   │   ├── authRoutes.js        # Auth endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   └── orderRoutes.js       # Order endpoints
│   └── server.js                # Express app & startup
├── .env.example                 # Environment variables template
├── package.json                 # Dependencies
├── seed.js                      # Database seeder
└── README.md                    # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB 5.0+ (local or Atlas)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create `.env` file from template**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:
   JWT_SECRET=your_super_secret_key_here
   FRONTEND_URL=http://localhost:5173
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

5. **Seed the database (optional, but recommended)**
   ```bash
   npm run seed
   ```

### Running the Server

**Development** (with hot reload)
```bash
npm run dev
```

**Production**
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- **POST** `/api/auth/admin/login` - Admin login
- **POST** `/api/auth/register` - User registration
- **POST** `/api/auth/login` - User login

### Products (Public)
- **GET** `/api/products` - List all products (with pagination & filtering)
- **GET** `/api/products/:id` - Get single product

### Products (Admin only)
- **POST** `/api/products` - Create product
- **PATCH** `/api/products/:id` - Update product
- **DELETE** `/api/products/:id` - Delete product

### Orders
- **POST** `/api/orders` - Create order (public)
- **GET** `/api/orders` - List orders (admin only)
- **GET** `/api/orders/:id` - Get single order (admin only)
- **PATCH** `/api/orders/:id` - Update order status (admin only)
- **PATCH** `/api/orders/:id/ship` - Mark order as shipped (admin only)
- **PATCH** `/api/orders/:id/cancel` - Cancel order (admin only)

### Health Check
- **GET** `/api/health` - Server health status

## Query Parameters

### Products List
- `category` - Filter by category (Jackets, Tops, Bottoms, Shoes, Dresses, Bags, Jewellery)
- `search` - Search by name or description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Example:**
```
GET /api/products?category=Tops&search=shirt&page=1&limit=5
```

### Orders List
- `status` - Filter by status (processing, shipped, delivered, cancelled)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

## Demo Credentials

**Admin Access:**
```
Username: admin
Password: admin123
```

**For Production:** Change these in `.env` file!

## Deployment

### MongoDB Atlas (Recommended for Production)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fads_ecommerce
   ```

### Heroku Deployment

1. Install Heroku CLI
2. Login and create app:
   ```bash
   heroku login
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI="your_mongodb_atlas_url"
   heroku config:set JWT_SECRET="your_secret_key"
   heroku config:set NODE_ENV=production
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```

### AWS/DigitalOcean/VPS Deployment

1. Clone repository on server
2. Install Node.js and MongoDB
3. Configure `.env` with production values
4. Use process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start src/server.js --name "fads-api"
   pm2 save
   pm2 startup
   ```
5. Set up Nginx reverse proxy pointing to port 5000
6. Enable HTTPS with Let's Encrypt

## Error Handling

All errors return standardized JSON response:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "statusCode": 400,
    "stack": "..." // Only in development
  }
}
```

## Security Best Practices

✅ **Implemented:**
- JWT authentication with expiration
- Password hashing with bcryptjs
- CORS enabled with origin restriction
- Input validation and sanitization
- Environment variables for secrets
- Error messages don't leak sensitive info
- Admin-only routes protected

**For Production:**
1. Change `JWT_SECRET` to a strong random key
2. Change admin credentials
3. Set `NODE_ENV=production`
4. Use HTTPS/SSL
5. Enable rate limiting (add express-rate-limit)
6. Add request logging (add morgan)
7. Use environment-specific configs
8. Regular backups of MongoDB

## Database Models

### Product
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (enum),
  image: String (required),
  stock: Number (default: 0),
  rating: Number (0-5),
  reviews: Number,
  active: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

### Order
```javascript
{
  orderId: String (unique, auto-generated),
  customer: {
    name, email, phone, address
  },
  items: [{
    productId, quantity, price, name
  }],
  total: Number,
  status: String (processing, shipped, delivered, cancelled),
  paymentMethod: String,
  paymentStatus: String,
  timestamps: { createdAt, updatedAt }
}
```

### User
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  role: String (customer, admin),
  active: Boolean,
  timestamps: { createdAt, updatedAt }
}
```

## Frontend Integration

Update `src/config/api.js` in your frontend:
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
```

Set environment variable in frontend `.env`:
```
VITE_API_URL=http://your-deployed-backend-url/api
```

## Troubleshooting

### "Cannot connect to MongoDB"
- Ensure MongoDB is running locally or connection string is correct
- Check firewall/network access for Atlas clusters
- Verify MONGODB_URI in `.env`

### "CORS error when calling from frontend"
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Ensure frontend requests include proper headers

### "401 Unauthorized"
- Check JWT token is being sent in Authorization header
- Verify token hasn't expired
- Ensure admin routes use proper authentication

## Support & Contributing

For issues or feature requests, please contact the development team.

---

**Built with ❤️ for FADs by PHURAY**  
Ready for production deployment! 🚀
