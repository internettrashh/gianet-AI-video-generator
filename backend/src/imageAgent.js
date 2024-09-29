import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import axios from "axios";

dotenv.config();

const API_URL = "https://api.segmind.com/v1/flux-schnell";
let currentKeyIndex = 0;

function getApiKey() {
  return process.env[`SEGMIND_API_KEY${currentKeyIndex}`];
}

async function generateImage(prompt, sceneNumber, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      console.log(`Generating image for prompt: "${prompt.substring(0, 50)}..."`);
      const API_KEY = getApiKey();
      
      if (!API_KEY) {
        console.error('No more API keys available');
        return null;
      }

      const data = {
        prompt: prompt.toString(),
        steps: 4,
        seed: Math.floor(Math.random() * 1000000000), // Random seed
        sampler_name: "euler",
        scheduler: "normal",
        samples: 1,
        width: 1024,
        height: 1024,
        denoise: 1
      };

      const response = await axios.post(API_URL, data, {
        headers: { 'x-api-key': API_KEY },
        responseType: 'arraybuffer'
      });

      // Save the image
      const imageName = `scene-${sceneNumber}.jpg`;
      const imagePath = path.join(process.cwd(), imageName);
      
      fs.writeFileSync(imagePath, response.data);
      console.log(`Image saved successfully as: ${imagePath}`);

      return imagePath; // Exit the function if successful
      
    } catch (error) {
      console.error(`Error on attempt ${attempt + 1}:`, error.message);
      if (error.response) {
        console.error('API response status:', error.response.status);
        console.error('API response data:', error.response.data.toString());
      }
      currentKeyIndex++; // Move to the next key
      if (attempt < maxAttempts - 1) {
        console.log(`Switching to next API key. Attempt ${attempt + 2} of ${maxAttempts}`);
      }
    }
  }

  console.error('All attempts exhausted. Unable to generate image.');
  return null;
}

export { generateImage };

// For testing purposes
if (import.meta.url === `file://${process.argv[1]}`) {
  const testPrompt = "A serene landscape with a calm lake surrounded by lush green trees under a clear blue sky";
  const testSceneNumber = 1;
  
  console.log('Starting image generator test...');
  generateImage(testPrompt, testSceneNumber)
    .then(imagePath => {
      if (imagePath) {
        console.log("Test successful. Image saved at:", imagePath);
      } else {
        console.log("Test failed. No image was generated or saved.");
      }
    })
    .catch(error => {
      console.error("An unexpected error occurred during the test:", error);
    })
    .finally(() => {
      console.log('Image generator test completed.');
    });
}