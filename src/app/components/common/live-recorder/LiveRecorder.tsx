import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import RecordPlugin from 'wavesurfer.js/dist/plugins/record.js';
import { Button, Chip } from '@heroui/react';
import { MdMic, MdStop, MdWarning, MdPlayArrow, MdDelete } from 'react-icons/md';
import './LiveRecorder.scss';

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
      if (recordPluginRef.current && isRecording) {
        recordPluginRef.current.stopRecording();
      }
      if (playbackWavesurferRef.current) {
        playbackWavesurferRef.current.destroy();
      }
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
        setIsRecording(false);
      } else {
        // Clear previous recording
        setRecordedBlob(null);
        // Start recording
        await recordPluginRef.current.startRecording();
        setIsRecording(true);
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
