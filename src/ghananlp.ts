import axios, { AxiosInstance } from 'axios';
import { TranslationRequest, TranslationResponse, Language, ErrorResponse, TextToSpeechRequest, APIOptions, SpeechToTextRequest, SpeechToTextResponse } from './interface'

export class GhanaNLP {
    private apiKey: string;
    private translationClient: AxiosInstance;
    private ttsClient: AxiosInstance;
    private asrClient: AxiosInstance;

    constructor(apiKey: string, options: APIOptions = { translationVersion: 'v1', ttsVersion: 'v1', asrVersion: 'v1' }) {
        if (!apiKey) {
            throw new Error('An API key is required');
        }
        this.apiKey = apiKey;
        this.translationClient = this.createClient(options.translationVersion, {
            'Content-Type': 'application/json',
        })
        this.ttsClient = this.createClient(`tts/${options.ttsVersion}`, {
            'Content-Type': 'application/json',
        })
        this.asrClient = this.createClient(`asr/${options.asrVersion}`)
    }

    private createClient(basePath: string, headers: object = {}): AxiosInstance {
        return axios.create({
            baseURL: `https://translation-api.ghananlp.org/${basePath}`,
            headers: {
                'Ocp-Apim-Subscription-Key': this.apiKey,
                ...headers,
            },
        });
    }

    /**
     * Translates the given input text.
     * @param {TranslationRequest} request - Object containing the text to be translated and language pair code.
     * @returns {Promise<TranslationResponse>} The translated text.
     */
    async translate(request: TranslationRequest): Promise<TranslationResponse> {
        if (request.in.length > 1000) {
            throw new Error('Input text length exceeds 1000 characters');
        }

        const apiRequest = { in: request.in, lang: `${request.fromLanguage}-${request.toLanguage}` }

        try {
            const response = await this.translationClient.post<string>(`/translate`, apiRequest);
            return { translatedText: response.data };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * Retrieves a list of supported languages.
     * @returns {Promise<Language[]>} The list of language codes with their corresponding language names.
     */
    async getLanguages(): Promise<Language[]> {
        try {
            const response = await this.translationClient.get<Language[]>(`/languages`);
            return response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
      * Converts the given text to speech for the specified language.
      * @param {TextToSpeechRequest} request - Object containing the text to be converted and the language to convert text to.
      * @returns {Promise<any>} The response from the Text-to-Speech API.
      */
    async textToSpeech(request: TextToSpeechRequest): Promise<any> {
        try {
            const response = await this.ttsClient.post(`/tts`, request, { responseType: 'arraybuffer' })
            return response.data;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    /**
     * 
     * @param {SpeechToTextRequest} request - Object containing the audio file (bytes array) and the language to transcribe the audio to.
     * @returns {Promise<SpeechToTextResponse>} The response from the ASR/Speech-to-Text API
     */
    async transcribeAudio(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
        try {
            const buffer = Buffer.isBuffer(request.audioFile)
                ? request.audioFile
                : Buffer.from(request.audioFile);

            const response = await this.asrClient.post<string>(`/transcribe`, buffer, {
                headers: {
                    'Content-Type': 'audio/mpeg',
                },
                params: { language: request.language }
            });

            return { transcribedText: response.data };
        } catch (error: any) {
            this.handleError(error)
        }
    }

    /**
     * Handles API errors and provides appropriate messages.
     * @param {Object} error - Axios error object.
     */
    private handleError(error: any): never {
        if (error.response) {
            const errResponse: ErrorResponse = error.response.data;
            console.error('Error:', errResponse.message || 'An error occurred');
            throw new Error(errResponse.message || 'An error occurred');
        } else if (error.request) {
            console.error('No response received from the API');
            throw new Error('No response received from the API');
        } else {
            console.error('Error:', error.message);
            throw new Error(error.message);
        }
    }
}

