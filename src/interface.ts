export interface APIOptions {
    translationVersion: string;
    ttsVersion: string;
    asrVersion: string;
}

export interface TranslationRequest {
    in: string; // Input string to be translated (max length 1000 characters)
    lang: string; // Language pair code (e.g., 'en-tw' for english to Twi translation)
}

export interface TranslationResponse {
    translatedText: string; // The translated text
}

export interface TextToSpeechRequest {
    text: string; // The text to convert to speech
    language: string; // The language the text will be spoken in
}

export interface SpeechToTextRequest {
    language:  string; // The language the contents of the audio file should be transcribed to
    audioFile: ArrayBuffer; // the audio file as a bytes array
}

export interface SpeechToTextResponse {
    transcribedText: string; // Text transcribed from speech input
}

export interface Language {
    code: string; // Language code (e.g., 'en')
    name: string; // Full language name (e.g., 'English')
}

export interface ErrorResponse {
    type: string;
    message: string;
}