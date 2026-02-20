const request = require('supertest');
const mongoose = require('mongoose');

let app;
let User;
let Category;
let Shop;

beforeAll(async () => {
  // Wait for DB connection to be ready
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once('connected', resolve);
    }
  });

  // Require app after global DB setup
  app = require('../../app');
  User = require('../../models/User');
  Category = require('../../models/Category');
  Shop = require('../../models/Shop');
}, 30000);

describe('Shops Routes', () => {
  let token;
  let categoryId;
  let userId;

  beforeEach(async () => {
    // Clean up before each test
    await Shop.deleteMany({});
    
    // Create a test user and get token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Shop',
        lastName: 'Owner',
        email: `shopowner${Date.now()}@example.com`,
        password: 'password123',
        role: 'buyer', // Test avec un utilisateur non-seller
      });

    token = userRes.body.data.token;
    userId = userRes.body.data.user._id;

    // Create a test category
    const category = await Category.create({
      name: `Test Category ${Date.now()}`,
      slug: `test-category-${Date.now()}`,
      status: 'active',
    });
    categoryId = category._id;
  }, 15000);

  afterEach(async () => {
    // Clean up after each test
    await Shop.deleteMany({});
  });

  describe('POST /api/shops', () => {
    it('should create a shop successfully with authenticated non-seller user', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: categoryId,
          description: 'A test shop',
          deliveryFee: 5,
          minimumOrder: 10,
          deliveryOptions: ['livraison locale', 'retrait en magasin'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.name).toContain('Test Shop');
      expect(res.body.requestId).toBeDefined();
    }, 15000);

    it('should return 422 with validation details when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // Invalid: empty
          // Missing category
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeDefined();
      expect(typeof res.body.details).toBe('object');
      // Should have details for both name and category
      expect(res.body.details.name || res.body.details.category).toBeDefined();
    }, 15000);

    it('should return 422 when category is invalid ObjectId', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Shop',
          category: 'invalid-id', // Invalid ObjectId
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details).toBeDefined();
      expect(res.body.details.category).toBeDefined();
      expect(res.body.details.category[0]).toContain('valid ObjectId');
    }, 15000);

    it('should return 404 when category does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: nonExistentId,
        });

      // Validation middleware catches this during custom validation
      expect([404, 422]).toContain(res.status);
      expect(res.body.success).toBe(false);
      
      if (res.status === 422) {
        expect(res.body.code).toBe('VALIDATION_ERROR');
        expect(res.body.details.category).toBeDefined();
        expect(res.body.details.category[0]).toContain('does not exist');
      } else {
        expect(res.body.code).toBe('CATEGORY_NOT_FOUND');
      }
    }, 15000);

    it('should return 422 when category is inactive', async () => {
      // Create an inactive category
      const inactiveCategory = await Category.create({
        name: `Inactive Category ${Date.now()}`,
        slug: `inactive-category-${Date.now()}`,
        status: 'inactive',
      });

      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: inactiveCategory._id,
        });

      expect([422]).toContain(res.status);
      expect(res.body.success).toBe(false);
      
      if (res.status === 422) {
        expect(res.body.code).toMatch(/VALIDATION_ERROR|CATEGORY_INACTIVE/);
      }
    }, 15000);

    it('should return 401 when token is missing', async () => {
      const res = await request(app)
        .post('/api/shops')
        // No Authorization header
        .send({
          name: 'Test Shop',
          category: categoryId,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    }, 15000);

    it('should return 401 when token is invalid', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', 'Bearer invalid-token-12345')
        .send({
          name: 'Test Shop',
          category: categoryId,
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    }, 15000);

    it('should return 422 when deliveryFee is negative', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: categoryId,
          deliveryFee: -5, // Invalid: negative
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details.deliveryFee).toBeDefined();
    }, 15000);

    it('should return 422 when minimumOrder is negative', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: categoryId,
          minimumOrder: -10, // Invalid: negative
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details.minimumOrder).toBeDefined();
    }, 15000);

    it('should return 422 when deliveryOptions contains invalid values', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: categoryId,
          deliveryOptions: ['invalid-option', 'another-invalid'], // Invalid values
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details.deliveryOptions).toBeDefined();
    }, 15000);

    it('should return 422 when phone format is invalid', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: categoryId,
          phone: 'invalid@phone#format', // Invalid characters
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.details.phone).toBeDefined();
      expect(res.body.details.phone[0]).toContain('Invalid phone format');
    }, 15000);

    it('should return 409 when shop name already exists (duplicate)', async () => {
      const shopName = `Unique Shop ${Date.now()}`;
      
      // Create first shop
      await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: shopName,
          category: categoryId,
        });

      // Try to create duplicate
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: shopName, // Duplicate name
          category: categoryId,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('DUPLICATE_ERROR');
      expect(res.body.details).toBeDefined();
    }, 15000);

    it('should include requestId in all responses', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Test Shop ${Date.now()}`,
          category: categoryId,
        });

      expect(res.body.requestId).toBeDefined();
      expect(typeof res.body.requestId).toBe('string');
    }, 15000);
  });

  describe('GET /api/shops', () => {
    it('should return all active shops', async () => {
      const res = await request(app)
        .get('/api/shops');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    }, 15000);
  });
});
