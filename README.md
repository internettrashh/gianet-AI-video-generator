# Multi-Agent Content Generation System: Turning Ideas into Videos

## Introduction

Welcome to the Multi-Agent Content Generation System, an innovative project that leverages GaiaNet's decentralized AI inference network to transform simple prompts into fully realized videos. This system, which we call the "Brat model," uses a sophisticated network of AI agents to generate content across multiple modalities.

## About GaiaNet

GaiaNet provides decentralized AI inference via public and private hosted nodes. This approach offers several advantages:
- Distributed computing power
- Increased reliability and fault tolerance
- Potential for lower latency depending on node proximity

Our project utilizes GaiaNet's API to access large language models and other AI capabilities in a decentralized manner.

## How It Works

The system operates in three main stages:

1. **Agent Generation**: The system creates 10 unique AI agents, each initialized with different parameters and specializations.

2. **Content Creation**: Each agent performs two key tasks:
   - Audio Generation: Creating unique soundscapes or narratives.
   - Image Generation: Producing visuals that complement the audio.

3. **Video Compilation**: The videoGenerator module combines all the generated content into a cohesive video.

When a user submits a prompt:
1. The prompt is sent to the scriptGenerator, which creates a script using GaiaNet's API.
2. The script is divided into scenes, each processed by an audio and image generation agent.
3. The generated audio and images are compiled into a final video.

## Project Structure

```
.
├── codebase.sh
├── goals.txt
├── package.json
└── src
    ├── audioGenerator.js
    ├── imageGenerator.js
    ├── index.js
    ├── scriptGenerator.js
    └── videoGenerator.js
```

## Key Components

- `src/index.js`: The main entry point and Express server setup.
- `src/scriptGenerator.js`: Generates the initial script from the user's prompt.
- `src/audioGenerator.js`: Handles audio content creation.
- `src/imageGenerator.js`: Manages image generation.
- `src/videoGenerator.js`: Coordinates the agents and compiles the final video.

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd <project-directory>
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your GaiaNet API endpoint:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

## Running the Project

1. Start the server:
   ```
   npm start
   ```

2. The server will start on the port specified in your environment (default is 3000).

## API Endpoints

- `POST /api/generate`: Start video generation with a prompt
- `GET /api/status/:jobId`: Get the status of a generation job
- `GET /api/audio/:jobId`: Retrieve the generated audio for a job

## Future Developments

- Increasing the number and specialization of agents
- Implementing user feedback loops for content refinement
- Exploring real-time video generation capabilities

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.
