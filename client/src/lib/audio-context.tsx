import { createContext, useContext, useReducer, ReactNode } from "react";
import type { Track } from "@shared/schema";

interface AudioState {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Track[];
  isLoading: boolean;
}

type AudioAction =
  | { type: "SET_TRACK"; payload: Track }
  | { type: "TOGGLE_PLAY" }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_TIME"; payload: number }
  | { type: "SET_DURATION"; payload: number }
  | { type: "SET_VOLUME"; payload: number }
  | { type: "ADD_TO_QUEUE"; payload: Track }
  | { type: "CLEAR_QUEUE" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "NEXT_TRACK" }
  | { type: "PREVIOUS_TRACK" };

const initialState: AudioState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 70,
  queue: [],
  isLoading: false,
};

function audioReducer(state: AudioState, action: AudioAction): AudioState {
  switch (action.type) {
    case "SET_TRACK":
      return {
        ...state,
        currentTrack: action.payload,
        currentTime: 0,
        isLoading: false,
      };
    case "TOGGLE_PLAY":
      return {
        ...state,
        isPlaying: !state.isPlaying,
      };
    case "SET_PLAYING":
      return {
        ...state,
        isPlaying: action.payload,
      };
    case "SET_TIME":
      return {
        ...state,
        currentTime: action.payload,
      };
    case "SET_DURATION":
      return {
        ...state,
        duration: action.payload,
      };
    case "SET_VOLUME":
      return {
        ...state,
        volume: action.payload,
      };
    case "ADD_TO_QUEUE":
      return {
        ...state,
        queue: [...state.queue, action.payload],
      };
    case "CLEAR_QUEUE":
      return {
        ...state,
        queue: [],
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "NEXT_TRACK":
      if (state.queue.length > 0) {
        const nextTrack = state.queue[0];
        return {
          ...state,
          currentTrack: nextTrack,
          queue: state.queue.slice(1),
          currentTime: 0,
        };
      }
      return state;
    case "PREVIOUS_TRACK":
      // Simple implementation - just restart current track
      return {
        ...state,
        currentTime: 0,
      };
    default:
      return state;
  }
}

interface AudioContextType {
  state: AudioState;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  setCurrentTime: (time: number) => void;
  setVolume: (volume: number) => void;
  addToQueue: (track: Track) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  formatTime: (seconds: number) => string;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(audioReducer, initialState);

  const playTrack = (track: Track) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_TRACK", payload: track });
    dispatch({ type: "SET_DURATION", payload: track.duration || 0 });
    dispatch({ type: "SET_PLAYING", payload: true });
  };

  const togglePlay = () => {
    dispatch({ type: "TOGGLE_PLAY" });
  };

  const setCurrentTime = (time: number) => {
    dispatch({ type: "SET_TIME", payload: time });
  };

  const setVolume = (volume: number) => {
    dispatch({ type: "SET_VOLUME", payload: volume });
  };

  const addToQueue = (track: Track) => {
    dispatch({ type: "ADD_TO_QUEUE", payload: track });
  };

  const nextTrack = () => {
    dispatch({ type: "NEXT_TRACK" });
  };

  const previousTrack = () => {
    dispatch({ type: "PREVIOUS_TRACK" });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AudioContext.Provider
      value={{
        state,
        playTrack,
        togglePlay,
        setCurrentTime,
        setVolume,
        addToQueue,
        nextTrack,
        previousTrack,
        formatTime,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
