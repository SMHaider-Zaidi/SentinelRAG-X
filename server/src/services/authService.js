const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_sentinel_rag_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

class AuthRepository {
  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1 AND status = 'active'`;
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(userId) {
    const query = `SELECT user_id, name, email, role, status, created_at FROM users WHERE user_id = $1 AND status = 'active'`;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  }

  static async createUser({ name, email, passwordHash, role = 'user' }) {
    const query = `
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, 'active')
      RETURNING user_id, name, email, role, created_at
    `;
    const result = await db.query(query, [name, email, passwordHash, role]);
    return result.rows[0];
  }
}

class AuthService {
  static async register({ name, email, password, role }) {
    const existing = await AuthRepository.findByEmail(email);
    if (existing) {
      throw new Error('Email is already registered');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const user = await AuthRepository.createUser({
      name,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user'
    });

    return user;
  }

  static async login({ email, password }) {
    const user = await AuthRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  static verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }
}

module.exports = { AuthService, AuthRepository };
