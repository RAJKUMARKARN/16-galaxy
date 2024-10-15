const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'your_jwt_secret_key';  // Secret key for JWT

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/authDB', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

// User schema and model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Protected Route (requires JWT)
app.get('/dashboard', (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json({ message: 'Welcome to your dashboard' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
