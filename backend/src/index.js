import express from 'express';
import cors from 'cors';
import { generateVideoContent, getAgentStatus } from './agentManager.js';
import fs from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
async function serveVideo(req, res, forceDownload = false) {
  const videoPath = path.join(__dirname, '..', 'output.mp4');

  try {
    await fs.access(videoPath);
  } catch (error) {
    console.error('Error accessing video file:', error);
    return res.status(404).send('Video not found. Generation might not be completed or there was an error during compilation.');
  }

  const stat = await fs.stat(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = createReadStream(videoPath, { start, end });  // Use createReadStream here
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    if (forceDownload) {
      head['Content-Disposition'] = 'attachment; filename="generated_video.mp4"';
    }
    res.writeHead(200, head);
    createReadStream(videoPath).pipe(res);  // Use createReadStream here
  }
}

async function listFiles(dir) {
  let files = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await listFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

// New endpoint to list all files
app.get('/files', async (req, res) => {
  try {
    const rootDir = path.join(__dirname, '..');  // List files from the backend folder
    const files = await listFiles(rootDir);
    const relativeFiles = files.map(file => path.relative(rootDir, file));
    res.json({ 
      currentDirectory: rootDir,
      files: relativeFiles 
    });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});


app.get('/video', (req, res) => serveVideo(req, res, true));
app.get('/output.mp4', (req, res) => serveVideo(req, res, false));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});