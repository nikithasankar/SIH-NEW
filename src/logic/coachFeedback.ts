/**
 * ONFORM AI Coach — Dynamic Biomechanical Voice & Visual Feedback Engine
 *
 * System Prompt: ONFORM AI Coach
 * "You are 'ONFORM AI Coach,' an advanced, energetic, and highly observant AI fitness coach.
 *  Your primary goal is to help users maintain perfect form, prevent injury, and maximize
 *  their workouts using real-time pose-tracking data.
 *
 *  Behavioral Guidelines:
 *  - Be direct and actionable: Do not use filler words. If form is off, immediately state the correction.
 *  - Tone: Energetic, encouraging, and authoritative.
 *  - Positive Reinforcement: When a user corrects their form based on your previous cue, acknowledge it briefly.
 *  - Context Awareness: Only provide feedback based on the exact exercise being performed and the specific biomechanical error detected."
 */

export interface ExerciseCues {
  formBreak: string[];
  repCompleted: string[];
  recoveryCorrection: string[];
}

export const EXERCISE_COACH_CUES: Record<string, ExerciseCues> = {
  pushup: {
    formBreak: [
      'Go lower on that push-up!',
      'Chest down, full depth!',
      'Lower your chest to 90 degrees!',
    ],
    repCompleted: [
      'Clean push-up!',
      'Strong push!',
      'Power up!',
      'Great rep!',
    ],
    recoveryCorrection: [
      'Much better depth!',
      'Perfect range of motion!',
      'That is the standard!',
    ],
  },
  squat: {
    formBreak: [
      'Squat deeper, break parallel!',
      'Lower your hips below knees!',
      'Drive deeper into that squat!',
    ],
    repCompleted: [
      'Solid squat!',
      'Great power!',
      'Explosive drive!',
      'Excellent depth!',
    ],
    recoveryCorrection: [
      'Much better depth!',
      'Perfect squat depth!',
      'Great correction!',
    ],
  },
  shoulder_press: {
    formBreak: [
      'Go higher on that press!',
      'Full lockout overhead!',
      'Push all the way to the top!',
    ],
    repCompleted: [
      'Strong press!',
      'Full extension!',
      'Great overhead power!',
    ],
    recoveryCorrection: [
      'Perfect extension!',
      'Locked out, great fix!',
      'That is the height!',
    ],
  },
  lunge: {
    formBreak: [
      'Drop that back knee lower!',
      'Step out and lower your hips!',
    ],
    repCompleted: [
      'Strong drive!',
      'Great balance!',
      'Solid lunge!',
    ],
    recoveryCorrection: [
      'Much better depth!',
      'Great balance fix!',
    ],
  },
  situp: {
    formBreak: [
      'Come all the way up!',
      'Contract your core, full sit-up!',
    ],
    repCompleted: [
      'Strong core!',
      'Good crunch!',
      'Power through!',
    ],
    recoveryCorrection: [
      'Full contraction, nice!',
      'Great form recovery!',
    ],
  },
  bicep_curl: {
    formBreak: [
      'Curl all the way up, squeeze!',
      'Full range on the curl!',
    ],
    repCompleted: [
      'Clean curl!',
      'Strong squeeze!',
      'Controlled rep!',
    ],
    recoveryCorrection: [
      'Full range, excellent!',
      'Perfect squeeze at top!',
    ],
  },
  high_knees: {
    formBreak: [
      'Raise knees higher, hip level!',
      'Alternate feet quickly!',
    ],
    repCompleted: [
      'Quick feet!',
      'High tempo!',
      'Keep driving!',
    ],
    recoveryCorrection: [
      'Great knee height!',
      'Pace locked in!',
    ],
  },
  plank: {
    formBreak: [
      'Keep your back straight, hips level!',
      'Do not let hips sag!',
      'Engage your core, stay flat!',
    ],
    repCompleted: [
      'Resist gravity, hold steady!',
      'Locked in!',
      'Core of steel!',
    ],
    recoveryCorrection: [
      'Perfect alignment restored!',
      'Back in solid position!',
    ],
  },
};

/**
 * Deterministically or randomly select a coaching cue based on context.
 */
export function getCoachFeedback(
  exerciseId: string,
  event: 'form_break' | 'rep_completed',
  wasPreviousFormBreak: boolean = false
): string {
  const cues = EXERCISE_COACH_CUES[exerciseId] || {
    formBreak: ['Check your form, full range!'],
    repCompleted: ['Good rep!'],
    recoveryCorrection: ['Much better form!'],
  };

  if (event === 'form_break') {
    const list = cues.formBreak;
    return list[Math.floor(Math.random() * list.length)];
  }

  if (event === 'rep_completed') {
    // If the user just fixed a form break from their previous attempt, provide positive reinforcement
    if (wasPreviousFormBreak && cues.recoveryCorrection.length > 0) {
      const list = cues.recoveryCorrection;
      return list[Math.floor(Math.random() * list.length)];
    }
    const list = cues.repCompleted;
    return list[Math.floor(Math.random() * list.length)];
  }

  return 'Stay on form!';
}
