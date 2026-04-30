const request = require('supertest');

describe('CORS preflight', () => {
  let app;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalCorsOrigins = process.env.CORS_ORIGINS;

  beforeAll(() => {
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGINS = 'https://jour-marche.vercel.app';

    jest.resetModules();
    app = require('../../app');
  });

  afterAll(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }

    if (originalCorsOrigins === undefined) {
      delete process.env.CORS_ORIGINS;
    } else {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    }

    jest.resetModules();
  });

  it('returns the configured origin on preflight requests', async () => {
    const res = await request(app)
      .options('/health')
      .set('Origin', 'https://jour-marche.vercel.app')
      .set('Access-Control-Request-Method', 'GET');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('https://jour-marche.vercel.app');
  });
});
