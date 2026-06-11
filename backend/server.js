const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const cookieParser = require('cookie-parser');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const twilioRoutes = require('./routes/twilioRoutes');
const heatmapRoutes = require('./routes/heatmap');
const issueRoutes = require('./routes/issueRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const { initSocket } = require('./Sockets/VolunteerSocket');

dotenv.config();
connectDB();

const app = express();
app.set("trust proxy", 1);

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://jansevak1.onrender.com"
    ],
    credentials: true
  }
});

initSocket(io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://jansevak1.onrender.com"
  ],
  credentials: true
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

app.use('/twilio', twilioRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/admin', adminRoutes); 
app.use('/api', heatmapRoutes);

server.listen(PORT, () => {
  console.log(`JanSawak Server running on port ${PORT}`);
});