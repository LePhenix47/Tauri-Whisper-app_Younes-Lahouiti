import { useEffect, useRef, useState, useCallback } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { Button, Chip, Select, SelectItem } from '@heroui/react';
import { MdMic, MdStop, MdWarning, MdPlayArrow, MdDelete } from 'react-icons/md';
import { useListVoskModels } from '@app/hooks/useModels';
import { useVoskLiveTranscription } from '@app/hooks/useVoskLiveTranscription';
import './LiveRecorder.scss';

/**
 * Convert Float32Array PCM to Int16Array PCM
 * Browser AudioContext outputs Float32 [-1, 1]
 * Vosk needs Int16 [-32768, 32767]
 */
function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    // Use bitwise OR for truncation (no rounding bias)
    int16Array[i] = (clamped * 32767) | 0;
  }
  return int16Array;
}

/**
 * LiveRecorder Component
 *
 * A real-time microphone recorder with live waveform visualization.
 * Features:
 * - Toggle recording on/off with a single button
 * - Live waveform that reacts to voice input
 * - Playback recorded audio
 * - Graceful error handling for mic permissions
 * - Clean, minimal UI
 *
 * @returns React component with recording interface
 */
export default function LiveRecorder() {
  // Refs for WaveSurfer and RecordPlugin instances
  const waveformRef = useRef<HTMLDivElement>(null);
  const playbackWaveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const playbackWavesurferRef = useRef<WaveSurfer | null>(null);
  const recordPluginRef = useRef<RecordPlugin | null>(null);

  // State management
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Vosk transcription state
  const [selectedModel, setSelectedModel] = useState("vosk-model-small-en-us-0.15");
  const { data: voskModels = [] } = useListVoskModels();

  // Web Audio API refs for PCM capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Vosk transcription hook
  const {
    partialText,
    finalText,
    error: transcriptionError,
    startSession,
    processChunk,
    endSession,
  } = useVoskLiveTranscription({
    modelName: selectedModel,
    onPartialResult: (text) => console.log("[Vosk] Partial:", text),
    onFinalResult: (text) => console.log("[Vosk] Final:", text),
    onError: (err) => console.error("[Vosk] Error:", err),
  });

  /**
   * Initialize WaveSurfer and RecordPlugin on component mount
   */
  useEffect(() => {
    if (!waveformRef.current) return;

    // Create WaveSurfer instance for recording
    const wavesurfer = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: 'rgb(100, 149, 237)',
      progressColor: 'rgb(65, 105, 225)',
      cursorColor: 'transparent',
      barWidth: 3,
      barGap: 2,
      barRadius: 3,
      height: 120,
      normalize: true,
      interact: false,
    });

    // Create RecordPlugin instance
    const recordPlugin = wavesurfer.registerPlugin(
      RecordPlugin.create({
        scrollingWaveform: true,
        renderRecordedAudio: false,
      })
    );

    // Listen for recording-stopped event to capture the blob
    recordPlugin.on('record-end', (blob: Blob) => {
      setRecordedBlob(blob);
    });

    // Store references
    wavesurferRef.current = wavesurfer;
    recordPluginRef.current = recordPlugin;
    setIsInitialized(true);

    // Cleanup on unmount
    return () => {
      // Stop PCM capture if active
      if (audioContextRef.current || scriptProcessorRef.current || mediaStreamRef.current) {
        if (scriptProcessorRef.current) {
          scriptProcessorRef.current.disconnect();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach(track => track.stop());
        }
      }

      // Stop recording if active
      if (recordPlugin.isRecording()) {
        recordPlugin.stopRecording();
      }

      // Destroy playback instance
      if (playbackWavesurferRef.current) {
        playbackWavesurferRef.current.destroy();
      }

      // Destroy main wavesurfer
      wavesurfer.destroy();
    };
  }, []);

  /**
   * Initialize playback waveform when a recording is available
   */
  useEffect(() => {
    if (!recordedBlob || !playbackWaveformRef.current) return;

    // Destroy existing playback instance if any
    if (playbackWavesurferRef.current) {
      playbackWavesurferRef.current.destroy();
    }

    // Create new WaveSurfer instance for playback
    const playbackWavesurfer = WaveSurfer.create({
      container: playbackWaveformRef.current,
      waveColor: 'rgb(100, 200, 100)',
      progressColor: 'rgb(50, 150, 50)',
      cursorColor: '#333',
      barWidth: 2,
      barGap: 1,
      barRadius: 2,
      height: 80,
      normalize: true,
    });

    // Load the recorded blob
    const url = URL.createObjectURL(recordedBlob);
    playbackWavesurfer.load(url);

    // Listen to play/pause events
    playbackWavesurfer.on('play', () => setIsPlaying(true));
    playbackWavesurfer.on('pause', () => setIsPlaying(false));
    playbackWavesurfer.on('finish', () => setIsPlaying(false));

    playbackWavesurferRef.current = playbackWavesurfer;

    // Cleanup blob URL when component unmounts or new recording is made
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recordedBlob]);

  /**
   * Start PCM audio capture with Web Audio API
   * Accepts an existing MediaStream to avoid duplicate mic requests
   */
  const startPCMCapture = useCallback(async (stream: MediaStream) => {
    try {
      mediaStreamRef.current = stream;

      // Create audio context
      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);

      // Create script processor for PCM capture (4096 buffer size = ~0.25s at 16kHz)
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      // Process audio
      scriptProcessor.onaudioprocess = (event) => {
        const inputData = event.inputBuffer.getChannelData(0); // Float32Array
        const pcmData = float32ToInt16(inputData);
        processChunk(pcmData);
      };

      // Connect nodes
      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      console.log('[PCM] Audio capture started');
    } catch (err) {
      console.error('[PCM] Failed to start capture:', err);
      throw err;
    }
  }, [processChunk]);

  /**
   * Stop PCM audio capture
   * Note: Does NOT stop the MediaStream tracks - RecordPlugin handles that
   */
  const stopPCMCapture = useCallback(() => {
    // Disconnect audio processing nodes
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    // Clear the stream reference but don't stop tracks
    // (RecordPlugin will stop them when it stops recording)
    mediaStreamRef.current = null;

    console.log('[PCM] Audio capture stopped');
  }, []);

  /**
   * Toggle recording on/off
   */
  const toggleRecording = async () => {
    if (!recordPluginRef.current) {
      setError('Recorder not initialized');
      return;
    }

    try {
      setError(null);

      if (isRecording) {
        // Stop recording
        recordPluginRef.current.stopRecording();
        stopPCMCapture();

        // End Vosk session
        try {
          await endSession();
        } finally {
          // Always set recording to false, even if endSession fails
          setIsRecording(false);
        }
      } else {
        // Check if model is available
        if (!voskModels.some(m => m === selectedModel)) {
          setError(`Vosk model '${selectedModel}' not downloaded. Please download it from the Models page.`);
          return;
        }

        // Clear previous recording
        setRecordedBlob(null);

        // Start Vosk session FIRST
        await startSession();

        try {
          // Get microphone stream ONCE
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            }
          });

          // Start both audio captures with the SAME stream
          await Promise.all([
            recordPluginRef.current.startRecording({ deviceId: stream.getAudioTracks()[0].getSettings().deviceId }),
            startPCMCapture(stream)
          ]);

          setIsRecording(true);
        } catch (err) {
          // If mic access fails, clean up the Vosk session
          await endSession();
          throw err;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access microphone';
      setError(errorMessage);
      setIsRecording(false);
      console.error('Recording error:', err);
    }
  };

  /**
   * Toggle playback
   */
  const togglePlayback = () => {
    if (!playbackWavesurferRef.current) return;
    playbackWavesurferRef.current.playPause();
  };

  /**
   * Delete recorded audio
   */
  const deleteRecording = () => {
    setRecordedBlob(null);
    if (playbackWavesurferRef.current) {
      playbackWavesurferRef.current.destroy();
      playbackWavesurferRef.current = null;
    }
  };

  return (
    <div className="live-recorder">
      <h2 className="live-recorder__title">Live Speech Recorder</h2>

      {/* Model Selection */}
      <div className="live-recorder__model-select">
        <Select
          label="Transcription Language"
          placeholder="Select a language"
          selectedKeys={[selectedModel]}
          onChange={(e) => setSelectedModel(e.target.value)}
          isDisabled={isRecording}
          size="sm"
        >
          {voskModels.map((model) => (
            <SelectItem key={model}>
              {model}
            </SelectItem>
          ))}
        </Select>
        {voskModels.length === 0 && (
          <p style={{ fontSize: '0.875rem', color: 'var(--color-danger)', marginTop: '0.5rem' }}>
            No Vosk models downloaded. Visit the Models page to download one.
          </p>
        )}
      </div>

      {/* Recording waveform - takes large portion of width */}
      <div className="live-recorder__waveform-wrapper">
        <div
          ref={waveformRef}
          className={`live-recorder__waveform ${isRecording ? 'live-recorder__waveform--active' : ''}`}
        />
        {!isRecording && !recordedBlob && isInitialized && (
          <div className="live-recorder__placeholder">
            Click "Start Recording" to begin
          </div>
        )}
      </div>

      {/* Controls underneath */}
      <div className="live-recorder__controls">
        {/* Error message */}
        {error && (
          <Chip
            color="danger"
            variant="flat"
            startContent={<MdWarning size={18} />}
            className="live-recorder__error"
          >
            {error}
          </Chip>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <Chip
            color="danger"
            variant="dot"
            className="live-recorder__indicator"
          >
            Recording in progress...
          </Chip>
        )}

        {/* Control button */}
        <Button
          color={isRecording ? 'danger' : 'primary'}
          size="lg"
          startContent={isRecording ? <MdStop size={20} /> : <MdMic size={20} />}
          onPress={toggleRecording}
          isDisabled={!isInitialized}
          className="live-recorder__btn"
        >
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
      </div>

      {/* Live Transcription Display */}
      {(partialText || finalText) && (
        <div className="live-recorder__transcription">
          <h3 className="live-recorder__transcription-title">Live Transcription</h3>

          {finalText && (
            <div className="live-recorder__transcription-final">
              <p>{finalText}</p>
            </div>
          )}

          {partialText && (
            <div className="live-recorder__transcription-partial">
              <p>
                {partialText}
                <span className="live-recorder__cursor">|</span>
              </p>
            </div>
          )}

          {transcriptionError && (
            <Chip color="danger" variant="flat" size="sm">
              Transcription error: {transcriptionError.message}
            </Chip>
          )}
        </div>
      )}

      {/* Playback section - shown after recording */}
      {recordedBlob && (
        <div className="live-recorder__playback">
          <h3 className="live-recorder__playback-title">Recorded Audio</h3>

          <div className="live-recorder__playback-waveform-wrapper">
            <div ref={playbackWaveformRef} className="live-recorder__playback-waveform" />
          </div>

          <div className="live-recorder__playback-controls">
            <Button
              color="success"
              size="md"
              startContent={<MdPlayArrow size={20} />}
              onPress={togglePlayback}
              className="live-recorder__playback-btn"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </Button>

            <Button
              color="danger"
              variant="flat"
              size="md"
              startContent={<MdDelete size={20} />}
              onPress={deleteRecording}
              className="live-recorder__delete-btn"
            >
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
