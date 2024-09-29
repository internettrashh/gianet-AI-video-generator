import express from 'express';
import cors from 'cors';
import { generateVideoContent, getAgentStatus } from './agentManager.js';
import fs from 'fs';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: ['https://gianet-ai-video-generator.vercel.app', 'http://localhost:3000'],
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

// Existing /video endpoint (kept for backwards compatibility)
app.get('/video', (req, res) => {
  const videoPath = path.join(process.cwd(), 'output.mp4');

  // Check if the file exists
  fs.access(videoPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing video file:', err);
      return res.status(404).json({ error: 'Video not found. Generation might not be completed.' });
    }

    // Get the file stats
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Handle range requests for video streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Serve the whole file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="generated_video.mp4"'
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  });
});

// New route to serve the video file directly
app.get('/output.mp4', (req, res) => {
  const videoPath = path.join(process.cwd(), 'output.mp4');

  fs.access(videoPath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error('Error accessing video file:', err);
      return res.status(404).send('Video not found. Generation might not be completed.');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(videoPath).pipe(res);
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});