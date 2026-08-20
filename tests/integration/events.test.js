const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../../app');

describe('Events API Integration Tests', () => {
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventpulse_test';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('GET /api/events should return 200 OK', async () => {
    const res = await request(app).get('/api/events');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'success');
    expect(Array.isArray(res.body.data)).toBeTruthy();
  });

  it('POST /api/events without JWT token should return 401 Unauthorized', async () => {
    const res = await request(app).post('/api/events').send({
      title: 'Unauthorized Event'
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('status', 'fail');
  });

  it('POST /api/events with missing required fields should return 422 Unprocessable Entity', async () => {
    const adminToken = jwt.sign(
      { userId: new mongoose.Types.ObjectId().toString(), role: 'admin' },
      process.env.JWT_SECRET || 'super_secret_eventpulse_jwt_key_2026',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: '' });

    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('status', 'fail');
    expect(res.body).toHaveProperty('errors');
  });
});