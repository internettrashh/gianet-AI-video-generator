import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

function getAudioDuration(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration);
    });
  });
}

async function createVideoFromImageAndAudio(image, audio, output) {
  const duration = await getAudioDuration(audio);
  
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(image)
      .inputOptions([`-loop 1`, `-t ${duration}`])
      .input(audio)
      .outputOptions([
        '-c:v libx264',
        '-tune stillimage',
        '-c:a aac',
        '-b:a 192k',
        '-pix_fmt yuv420p',
        '-shortest'
      ])
      .output(output)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });
}

async function concatenateVideos(inputFiles, output) {
  const tempFile = 'temp_list.txt';
  const fileContent = inputFiles.map(file => `file '${file}'`).join('\n');
  await fs.writeFile(tempFile, fileContent);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(tempFile)
      .inputOptions(['-f concat', '-safe 0'])
      .outputOptions(['-c copy'])
      .output(output)
      .on('end', async () => {
        await fs.unlink(tempFile);
        resolve();
      })
      .on('error', reject)
      .run();
  });
}

async function compileVideo(scenePairs) {
  const tempVideos = [];

  for (let i = 0; i < scenePairs.length; i++) {
    const { image, audio } = scenePairs[i];
    const tempOutput = `temp_video_${i}.mp4`;
    await createVideoFromImageAndAudio(
      path.join(__dirname, '..', image),
      path.join(__dirname, '..', audio),
      tempOutput
    );
    tempVideos.push(tempOutput);
    console.log(`Processed scene ${i + 1}`);
  }

  await concatenateVideos(tempVideos, path.join(__dirname, '..', 'output.mp4'));
  console.log('Video compilation complete!');

  // Clean up temp files
  for (const tempVideo of tempVideos) {
    await fs.unlink(tempVideo);
  }
}

async function createFinalVideo() {
  const scenePairs = [
    { image: 'scene-1.jpg', audio: 'scene-1-audio.mp3' },
    { image: 'scene-2.jpg', audio: 'scene-2-audio.mp3' },
    { image: 'scene-3.jpg', audio: 'scene-3-audio.mp3' },
    { image: 'scene-4.jpg', audio: 'scene-4-audio.mp3' },
    { image: 'scene-5.jpg', audio: 'scene-5-audio.mp3' },
  ];

  await compileVideo(scenePairs);
}

export { createFinalVideo };

if (import.meta.url === `file://${process.argv[1]}`) {

  createFinalVideo().catch(console.error);

}
