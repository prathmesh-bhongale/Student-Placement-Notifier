require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectMongo, connectMySQL } = require('./config/database');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { ensureAdmin } = require('./scripts/seedAdmin');

const app = express();

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing. Copy .env.example to .env and set it.');
  process.exit(1);
}

app.use(helmet());
app.use(
  cors({
    origin: (process.env.FRONTEND_URL || 'http://localhost:5173').split(',').map((s) => s.trim()),
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.post('/api/chatbot', require('./controllers/chatbotController').chat);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectMongo();
    await connectMySQL();
    await ensureAdmin();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

if (require.main === module) start();

module.exports = app;
