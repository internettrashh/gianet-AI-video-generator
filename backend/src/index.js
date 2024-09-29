import express from 'express';
import { generateVideoContent } from './src/agentManager.js';
import fs from 'fs/promises';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// To parse JSON bodies
app.use(express.json());

// Global variable to store the generation status
let generationStatus = 'idle';

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    generationStatus = 'in_progress';
    res.status(202).json({ message: 'Video generation started', status: generationStatus });

    // Start the video generation process
    const results = await generateVideoContent(prompt);
    
    // Assuming the videoCompiler.js is modified to export a function that we can call here
    // This part is not in the provided codebase, so you'd need to modify videoCompiler.js
    // await createFinalVideo(results);

    generationStatus = 'completed';
  } catch (error) {
    console.error('Error during video generation:', error);
    generationStatus = 'error';
  }
});

app.get('/status', (req, res) => {
  res.json({ status: generationStatus });
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