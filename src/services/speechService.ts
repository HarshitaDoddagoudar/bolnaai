/**
 * Speech Recognition and Speech Synthesis helper using standard Web Speech API.
 * Provides fallback gracefully when browser permissions or APIs are unavailable.
 */

// Extend window interface for webkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class SpeechService {
  private recognition: any = null;
  private isListening: boolean = false;
  private isSpeechSupported: boolean = false;

  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.isSpeechSupported = true;
      } catch (e) {
        console.warn('Speech recognition initialization failed:', e);
      }
    }
  }

  public isRecognitionSupported(): boolean {
    return this.isSpeechSupported && this.recognition !== null;
  }

  public startListening(
    onResult: (text: string) => void,
    onError: (err: string) => void,
    onEnd: () => void
  ): void {
    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser. Please use text input fallback.');
      return;
    }

    if (this.isListening) {
      return;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error || 'Speech input error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      onEnd();
    };

    try {
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      onError(e.message || 'Could not access microphone');
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // Ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string, onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  }

  public stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
