import type { ExerciseDefinition } from '../models/exerciseDefinition';

export const exerciseCatalog: ExerciseDefinition[] = [
  {
    id: 'pushup',
    displayName: 'Push-Up',
    iconAsset: '💪',
    mode: 'repBased',
    primaryJoint: 'shoulderElbowWrist',
    upThresholdDeg: 160,
    downThresholdDeg: 90,
    isInverted: false,
  },
  {
    id: 'squat',
    displayName: 'Squat',
    iconAsset: '🏋️',
    mode: 'repBased',
    primaryJoint: 'hipKneeAnkle',
    upThresholdDeg: 160,
    downThresholdDeg: 100,
    isInverted: false,
  },
  {
    id: 'lunge',
    displayName: 'Lunge',
    iconAsset: '🦵',
    mode: 'repBased',
    primaryJoint: 'hipKneeAnkle',
    upThresholdDeg: 160,
    downThresholdDeg: 100,
    isInverted: false,
  },
  {
    id: 'situp',
    displayName: 'Sit-Up',
    iconAsset: '🤸',
    mode: 'repBased',
    primaryJoint: 'shoulderHipKnee',
    upThresholdDeg: 150,
    downThresholdDeg: 70,
    isInverted: false,
  },
  {
    id: 'bicep_curl',
    displayName: 'Bicep Curl',
    iconAsset: '💪',
    mode: 'repBased',
    primaryJoint: 'shoulderElbowWrist',
    upThresholdDeg: 160,
    downThresholdDeg: 50,
    isInverted: false,
  },
  {
    id: 'shoulder_press',
    displayName: 'Shoulder Press',
    iconAsset: '🏋️‍♂️',
    mode: 'repBased',
    primaryJoint: 'elbowShoulderHip',
    upThresholdDeg: 90,
    downThresholdDeg: 160,
    isInverted: true,
  },
  {
    id: 'high_knees',
    displayName: 'High Knees',
    iconAsset: '🏃',
    mode: 'repBased',
    primaryJoint: 'highKnees',
    upThresholdDeg: 0,   // not used — high knees uses Y-coordinate logic
    downThresholdDeg: 0,  // not used
    isInverted: false,
  },
  {
    id: 'plank',
    displayName: 'Plank',
    iconAsset: '🧘',
    mode: 'timeBased',
    primaryJoint: 'shoulderHipAnkle',
    upThresholdDeg: 180,
    downThresholdDeg: 160,
    isInverted: false,
  },
];

export function getExerciseById(id: string): ExerciseDefinition | undefined {
  return exerciseCatalog.find((e) => e.id === id);
}
