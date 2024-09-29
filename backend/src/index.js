import express from 'express';
import cors from 'cors';
import { generateVideoContent, getAgentStatus } from './agentManager.js';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['https://gianet-ai-video-generator.vercel.app', 'http://localhost'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// To parse JSON bodies
app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    res.status(202).json({ message: 'Video generation started', status: getAgentStatus() });

    // Start the video generation process
    await generateVideoContent(prompt);
  } catch (error) {
    console.error('Error during video generation:', error);
  }
});

app.get('/status', (req, res) => {
  res.json(getAgentStatus());
});

app.get('/video', async (req, res) => {
  const videoPath = path.join(process.cwd(), 'output.mp4');

  try {
    await fs.access(videoPath);
    res.sendFile(videoPath);
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Video not found. Generation might not be completed.' });
    } else {
      console.error('Error accessing video file:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});