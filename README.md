# ghananlp-node
Simple Typescript wrapper for the [GhanaNLP Translation API](https://ghananlp.org/). Allows you to effortlessly translate text between supported languages and retrieve a list of available language pairs.

## Table of Contents
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Usage](#usage)
  - [Translate Text](#translate-text)
  - [Get Supported Languages](#get-supported-languages)
- [Error Handling](#error-handling)
- [API Reference](#api-reference)
- [Roadmap/Coming Soon](#coming-soon)
- [Contributing](#contributing)
- [License](#license)

## Installation

Install the package via npm:

```bash
npm install @paakways/ghananlp-node
```

If you are using TypeScript, make sure to have `axios` types as a development dependency:

```bash
npm install --save-dev @types/axios
```

## Getting Started

1. **Import the library into your Project**

    ```typescript
    import {GhanaNLP} from '@paakways/ghananlp-node';
    ```

2. **Initialize the library with your API Key and version**

    To use the library, you will need to get an API key from the [GhanaNLP APIs website](https://translation.ghananlp.org/apis).

    ```typescript
    const api = new GhanaNLP('YOUR_API_KEY');
    ```

## Usage

### Translate Text

To translate text from one language to another, use the `translate` method. You need to specify the input text and the 'from' and 'to' languages using their GhanaNLP language codes.

```typescript
    const translationRequest = { in: 'Hello World', fromLanguage: 'en', toLanguage: 'tw' };
    try {
        const response = await api.translate(translationRequest)
        console.log('Translated text:', response.translatedText);
    }
    catch(error) {
        console.error('Translation error:', error.message);
    }
```

### Get Supported Languages

You can retrieve a list of all supported languages with their language codes:

```typescript
    try {
        const languages = await api.getLanguages()
        console.log('Supported languages:', languages);
    }
    catch(error) {
        console.error('Error fetching languages:', error.message);
    }
```

### Text-to-Speech

To convert text to audio in a language, use the `textToSpeech` method. You need to specify the input text and the 'from' and 'to' languages using their GhanaNLP language codes

```typescript

// Sample Express route which allows you to input text and get audio back
const { Readable } = require('stream');

function createBufferStream(buffer) {
    const readable = new Readable();
    readable._read = () => {}; 
    readable.push(buffer);
    readable.push(null);
    return readable;
}

app.get('/audio', async (req, res) => {
    try {
        const audioBytes = await api.textToSpeech({ text: req.query.text, language: LanguageCodes.Twi}); // You can now use inbuilt enums - LanguageCodes.Ga or LanguageCodes.Twi or regular strings eg 'gaa' or 'tw' respectively
      
        if (!audioBytes || !Buffer.isBuffer(audioBytes)) {
            return res.status(400).json({ error: 'No audio data available' });
        }

        const contentLength = audioBytes.length;
        const contentType = 'audio/mpeg'; // Adjust based on your audio type

        // No range requested, stream the entire file
        res.writeHead(200, {
            'Content-Length': contentLength,
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes'
        });

        const stream = createBufferStream(audioBytes);
        stream.pipe(res);
        
    } catch (error) {
        console.error('Error streaming audio:', error);
        res.status(500).json({
            error: 'Internal server error while streaming audio'
        });
    }
});

app.get('/player', (req, res) => {
    const audioEndpoint = `/audio?text=${req.query.text}`;
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Audio Player</title>
            <style>
                body { 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    margin: 0; 
                    background: #f0f0f0;
                }
                .player-container {
                    padding: 20px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                audio {
                    width: 300px;
                }
            </style>
        </head>
        <body>
            <div class="player-container">
                <audio controls>
                    <source src="${audioEndpoint}" type="audio/mpeg">
                    Your browser does not support the audio element.
                </audio>
            </div>
        </body>
        </html>
    `);
});

```

### Automatic Speech Recognition/Speech-to-Text

To convert audio to text in a language, use the `transcribeAudio` method. You need to specify the input `audioFile` and the `language` code for the transcription expected

```typescript
    try {
         const audioFile = await fs.readFile(path.join(__dirname,'twi_recording.mp3'))
        const asrRequest = { language: 'tw', audioFile }

        const response = await api.transcribeAudio(asrRequest)
        console.log(response.transcribedText) // eg. Outputs: "Me din de Kwasi"
    }
    catch(error) {
        console.error('Error transcribing text:', error.message);
    }
```

## Error Handling

The library provides error handling to help diagnose issues with the API requests. If an error occurs, it will throw a message detailing the type and description of the error.

Example of catching an error:

```typescript
    try {
        const response = await api.translate({ in: 'Hello', fromLanguage: 'invalid-code', toLanguage: 'tw' })
    }
    catch(error) {
        console.error('Error:', error.message); // Outputs detailed error message
    }
```

## API Reference

### `translate(request: TranslationRequest): Promise<TranslationResponse>`

Translates the given input text from one language to another.

- **Parameters**:
  - `request`: An object containing:
    - `in`: The input text to be translated (max 1000 characters).
    - `fromLanguage`: Language code for text being translated (e.g., `en`).
    - `toLanguage`: Language code for translated text (eg. `tw`).

- **Returns**: A promise that resolves to an object containing the `translatedText`.

### `getLanguages(): Promise<Language[]>`

Retrieves the list of all supported languages.

- **Returns**: A promise that resolves to an array of language objects, each containing:
  - `code`: The language code (e.g., `en` for English).
  - `name`: The full language name (e.g., `English`).

### `textToSpeech(request: TextToSpeechRequest): Promise<binary audio>`

Converts the given input text to a binary audio file

- **Parameters**
  - `request`: An object containing:
    - `text`: The input text to be converted.
    - `language`: Language code for text being converted to speech (e.g., `en`).

- **Returns**: A promise that resolves to the binary audio file.

### `transcribeAudio(request: SpeechToTextRequest): Promise<SpeechToTextResponse>`

Transcribes a binary audio file from speech to text

- **Parameters**
  - `request`: An object containing:
    - `language`: Language code for text being converted to speech (e.g., `gaa`).
    - `audioFile`: The audio file as a `Buffer`

- **Returns**: A promise that resolves to an object containing `transcribedText`.


## Coming Soon
- 

## Contributing

Contributions are welcome! If you find any bugs or have any feature requests, please open an issue or submit a pull request.

1. Fork the repository.
2. Create a new branch.
3. Make your changes and commit them.
4. Push your changes to the branch.
5. Create a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
