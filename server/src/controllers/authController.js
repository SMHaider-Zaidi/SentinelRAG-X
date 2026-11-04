const { AuthService } = require('../services/authService');

class AuthController {
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      const user = await AuthService.register({ name, email, password, role });
      return res.status(201).json({ message: 'User registered successfully', user });
    } catch (err) {
      if (err.message.includes('already registered')) {
        return res.status(409).json({ error: err.message });
      }
      console.error('Registration error:', err);
      return res.status(500).json({ error: 'Internal server error during registration' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await AuthService.login({ email, password });
      return res.status(200).json({ message: 'Login successful', ...result });
    } catch (err) {
      if (err.message.includes('Invalid email or password')) {
        return res.status(401).json({ error: err.message });
      }
      console.error('Login error:', err);
      return res.status(500).json({ error: 'Internal server error during login' });
    }
  }

  static async me(req, res) {
    try {
      const { AuthRepository } = require('../services/authService');
      const user = await AuthRepository.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user });
    } catch (err) {
      console.error('Me error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = AuthController;
