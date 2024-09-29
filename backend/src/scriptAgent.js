import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const apiUrl = 'https://llama.us.gaianet.network/v1/chat/completions';

export async function generateScript(topic) {
  const systemPrompt = `You are an AI assistant tasked with generating a simple 5-scene script for a YouTube video. Each scene should be a single paragraph describing what happens in that scene. Do not include any scene numbers, visual descriptions, or dialogue tags. Just write 5 paragraphs, each representing a scene, separated by a newline.`;

  const userPrompt = `Generate a 5-scene script for a YouTube video about ${topic}. Remember, each scene should be a single paragraph, and scenes should be separated by a newline.`;

  try {
    console.log('Sending request to API...');
    const response = await axios.post(apiUrl, {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    }, {
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    console.log('Received response from API');
    console.log('Response status:', response.status);

    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const rawScript = response.data.choices[0].message.content;
      console.log('Raw script:', rawScript);
      return parseScript(rawScript);
    } else {
      throw new Error('No valid response content found in API response');
    }
  } catch (error) {
    console.error('Error generating script:', error);
    if (error.response) {
      console.error('API response status:', error.response.status);
      console.error('API response data:', error.response.data);
    }
    return null;
  }
}

function parseScript(rawScript) {
  if (!rawScript) {
    console.error('Raw script is empty or undefined');
    return [];
  }

  const scenes = rawScript.split('\n\n').map((scene, index) => ({
    number: index + 1,
    content: scene.trim()
  }));

  console.log('Parsed scenes:', JSON.stringify(scenes, null, 2));

  if (scenes.length !== 5) {
    console.warn(`Expected 5 scenes, but parsed ${scenes.length} scenes`);
  }

  return scenes;
}

// For testing purposes
if (import.meta.url === `file://${process.argv[1]}`) {
  const topic = "The history of cryptocurrency";
  generateScript(topic)
    .then(script => {
      if (script && script.length > 0) {
        console.log("Generated Script:");
        console.log(JSON.stringify(script, null, 2));
      } else {
        console.log("Failed to generate script or script is empty.");
      }
    })
    .catch(error => {
      console.error("An error occurred during script generation:", error);
    });
}