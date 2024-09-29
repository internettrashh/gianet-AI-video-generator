import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAudio(text, sceneNumber) {
  console.log(`Starting audio generation for scene ${sceneNumber}: "${text.substring(0, 50)}..."`);
  
  const fileName = `scene-${sceneNumber}-audio.mp3`;
  const filePath = path.resolve(process.cwd(), fileName);

  try {
    console.log('Sending request to OpenAI API...');
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    console.log('Received response from OpenAI API');
    console.log('Writing audio buffer to file...');

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(filePath, buffer);

    console.log(`Audio file successfully saved as ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error generating audio:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', error.response.data);
    }
    
    return null;
  }
}

export { generateAudio };

// For testing purposes
if (import.meta.url === `file://${process.argv[1]}`) {
  const testText = "This is a test of the audio generation system. If you can hear this message, the system is working correctly.";
  const testSceneNumber = 1;

  console.log('Starting audio generator test...');
  generateAudio(testText, testSceneNumber)
    .then(audioPath => {
      if (audioPath) {
        console.log("Test successful. Audio generated at:", audioPath);
        // Optionally, you could add code here to play the audio file
      } else {
        console.log("Test failed. No audio file was generated.");
      }
    })
    .catch(error => {
      console.error("An unexpected error occurred during the test:", error);
    })
    .finally(() => {
      console.log('Audio generator test completed.');
    });
}