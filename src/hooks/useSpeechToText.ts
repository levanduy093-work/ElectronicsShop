import { useEffect, useState, useRef } from 'react';
import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
  SpeechStartEvent,
  SpeechEndEvent,
} from '@react-native-voice/voice';
import { Platform } from 'react-native';
import { requestMicrophonePermission } from '../lib/permissions';

interface UseSpeechToTextOptions {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const voiceRefInitialized = useRef(false);

  useEffect(() => {
    if (voiceRefInitialized.current) return;
    voiceRefInitialized.current = true;

    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechRecognized = onSpeechRecognized;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechPartialResults = onSpeechPartialResults;

    return () => {
      Voice.destroy().catch((err) => console.warn('Voice cleanup error:', err));
    };
  }, []);

  const onSpeechStart = (e: SpeechStartEvent) => {
    setIsListening(true);
    setError(null);
    setRecognizedText('');
    options.onStart?.();
  };

  const onSpeechRecognized = () => {
    console.log('Speech recognized');
  };

  const onSpeechEnd = (e: SpeechEndEvent) => {
    setIsListening(false);
    options.onEnd?.();
  };

  const onSpeechError = (e: SpeechErrorEvent) => {
    const errorMessage = e.error?.toString() || 'Lỗi không xác định';
    setError(errorMessage);
    setIsListening(false);
    options.onError?.(errorMessage);
  };

  const onSpeechResults = (e: SpeechResultsEvent) => {
    const text = e.value?.[0] || '';
    setRecognizedText(text);
    setIsListening(false);
    options.onResult?.(text);
  };

  const onSpeechPartialResults = (e: SpeechResultsEvent) => {
    const text = e.value?.[0] || '';
    setRecognizedText(text);
  };

  const startListening = async () => {
    try {
      setError(null);
      setRecognizedText('');

      // Request permission trước
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setError('Không có quyền truy cập microphone');
        options.onError?.('Không có quyền truy cập microphone');
        return;
      }
      
      const locale = Platform.OS === 'ios' ? 'vi-VN' : 'vi_VN';
      
      await Voice.start(locale);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể bắt đầu ghi âm';
      setError(errorMessage);
      options.onError?.(errorMessage);
    }
  };

  const stopListening = async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (err: any) {
      console.warn('Error stopping voice:', err);
    }
  };

  const cancelListening = async () => {
    try {
      await Voice.cancel();
      setIsListening(false);
      setRecognizedText('');
    } catch (err: any) {
      console.warn('Error canceling voice:', err);
    }
  };

  return {
    isListening,
    recognizedText,
    error,
    startListening,
    stopListening,
    cancelListening,
  };
}
