import { generateScript } from './scriptAgent.js';
import { generateAudio } from './audioAgent.js';
import { generateImage } from './imageAgent.js';
import { createFinalVideo } from './videoCompiler.js';
import { agentStatus } from './index.js';
const SCENE_COUNT = 5;

// let agentStatus = {
//   script: 'idle',
//   audio: Array(SCENE_COUNT).fill('idle'),
//   image: Array(SCENE_COUNT).fill('idle')
// };

function getAgentStatus() {
  return JSON.parse(JSON.stringify(agentStatus));
}

async function runAgentPair(sceneContent, sceneNumber) {
  agentStatus.audio[sceneNumber - 1] = 'in_progress';
  agentStatus.image[sceneNumber - 1] = 'in_progress';

  try {
    const [audioPath, imagePath] = await Promise.all([
      generateAudio(sceneContent, sceneNumber),
      generateImage(sceneContent, sceneNumber)
    ]);

    agentStatus.audio[sceneNumber - 1] = 'completed';
    agentStatus.image[sceneNumber - 1] = 'completed';

    return { sceneNumber, audioPath, imagePath };
  } catch (error) {
    agentStatus.audio[sceneNumber - 1] = 'error';
    agentStatus.image[sceneNumber - 1] = 'error';
    throw error;
  }
}

async function generateVideoContent(prompt) {
  console.log("Generating video content...");

  agentStatus.script = 'in_progress';
  console.log("Generating script...");
  const script = await generateScript(prompt);
  if (!script) {
    agentStatus.script = 'error';
    throw new Error("Failed to generate script");
  }
  agentStatus.script = 'completed';

  const results = [];

  for (let i = 0; i < SCENE_COUNT; i += 2) {
    const scene1 = script[i];
    const scene2 = script[i + 1];

    const [result1, result2] = await Promise.all([
      runAgentPair(scene1.content, scene1.number),
      scene2 ? runAgentPair(scene2.content, scene2.number) : Promise.resolve(null)
    ]);

    results.push(result1);
    if (result2) results.push(result2);
  }

  console.log("Video content generation completed.");
  createFinalVideo().catch(console.error);
  return results;
}

export { generateVideoContent, getAgentStatus, agentStatus, SCENE_COUNT };

// For testing purposes
if (import.meta.url === `file://${process.argv[1]}`) {
  const testPrompt = "Create a short story about a robot learning to paint";
  
  console.log('Starting video content generation test...');
  generateVideoContent(testPrompt)
    .then(results => {
      console.log("Generation completed. Results:");
      console.log(JSON.stringify(results, null, 2));
      console.log("Final agent status:");
      console.log(JSON.stringify(getAgentStatus(), null, 2));
    })
    .catch(error => {
      console.error("An error occurred during generation:", error);
      console.log("Final agent status:");
      console.log(JSON.stringify(getAgentStatus(), null, 2));
    });
}