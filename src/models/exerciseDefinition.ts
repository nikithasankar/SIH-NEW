export type TrackingMode = 'repBased' | 'timeBased';

export type JointTriplet =
  | 'shoulderElbowWrist'
  | 'hipKneeAnkle'
  | 'shoulderHipKnee'
  | 'shoulderHipAnkle'
  | 'elbowShoulderHip'
  | 'highKnees';

export interface ExerciseDefinition {
  id: string;
  displayName: string;
  iconAsset: string;
  mode: TrackingMode;
  primaryJoint: JointTriplet;
  upThresholdDeg: number;
  downThresholdDeg: number;
  useSecondaryJointCheck?: boolean;
  isInverted?: boolean;
}
