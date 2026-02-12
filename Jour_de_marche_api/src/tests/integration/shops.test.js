const request = require('supertest');
const mongoose = require('mongoose');

let app;
let User;
let Category;

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
}, 30000);

describe('Shops Routes', () => {
  let token;
  let categoryId;

  beforeEach(async () => {
    // Create a test user and get token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Shop',
        lastName: 'Owner',
        email: 'shopowner@example.com',
        password: 'password123',
        role: 'seller',
      });

    token = userRes.body.data.token;

    // Create a test category
    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
    });
    categoryId = category._id;
  }, 15000);

  describe('POST /api/shops', () => {
    it('should create a shop successfully', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Shop',
          category: categoryId,
          description: 'A test shop',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Shop');
    }, 15000);

    it('should return detailed error on validation failure', async () => {
      const res = await request(app)
        .post('/api/shops')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: '', // Invalid: required and empty
          // Missing category
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Erreur lors de la création de la boutique');
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBeDefined();
      expect(res.body).toHaveProperty('errors');
      // For Mongoose ValidationError, errors should be an object with field errors
      if (res.body.errors) {
        expect(typeof res.body.errors).toBe('object');
      }
    }, 15000);
  });
});
