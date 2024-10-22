export interface APIOptions {
    translationVersion: string;
    ttsVersion: string;
    asrVersion: string;
}

export interface TranslationRequest {
    in: string; // Input string to be translated (max length 1000 characters)
    fromLanguage: LanguageCodes; // Language code
    toLanguage: LanguageCodes
}

export interface TranslationResponse {
    translatedText: string; // The translated text
}

export interface TextToSpeechRequest {
    text: string; // The text to convert to speech
    language: LanguageCodes; // The language the text will be spoken in
}

// Enum of supported languages
export enum LanguageCodes {
    Twi = 'tw',
    Yoruba = 'yo',
    Ga = 'gaa',
    Dagbani = 'dag',
    Ewe = 'ee',
    Kikuyu = 'ki',  
    English = 'en'
}

export interface SpeechToTextRequest {
    language: LanguageCodes; // The language the contents of the audio file should be transcribed to
    audioFile: ArrayBuffer; // the audio file as a bytes array
}

export interface SpeechToTextResponse {
    transcribedText: string; // Text transcribed from speech input
}

export interface Language {
    code: LanguageCodes; // Language code (e.g., 'en')
    name: string; // Full language name (e.g., 'English')
}

export interface ErrorResponse {
    type: string;
    message: string;
}