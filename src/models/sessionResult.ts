export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface RecordedFrame {
  timestamp: number;
  landmarks: LandmarkPoint[];
  isPositionOk: boolean;
  jointAngles: {
    elbow: number;
    knee: number;
    hip: number;
    shoulder: number;
  };
}

export interface SessionResult {
  id?: number;
  exerciseId: string;
  validReps: number;
  formBreaks: number;
  accuracy: number;        // 0–100
  durationSeconds: number;
  timestamp: string;       // ISO 8601
  /**
   * Email of the participant who recorded this session. Added to support
   * the scout monitoring dashboard (a scout needs to know whose session
   * they're looking at). Optional/backfilled as undefined for any legacy
   * rows saved before this field existed.
   */
  userEmail?: string;
  /**
   * Recorded biomechanical skeleton landmark frames for Digital Twin playback & coach review.
   */
  recordedFrames?: RecordedFrame[];
}

export interface ScoutNote {
  id?: number;
  sessionId: number;
  scoutEmail: string;
  scoutName: string;
  note: string;
  createdAt: string; // ISO 8601
}

