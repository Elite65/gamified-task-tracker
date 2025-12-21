
// Web Audio API helper for generating tactical alarm sounds

let audioCtx: AudioContext | null = null;
let intervalId: any = null;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

// Play a single pulses (approx 2s)
const playPulse = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Refined "Digital Chime" (Sine Wave)
    osc.type = 'sine';

    const now = ctx.currentTime;

    // Note 1: C5
    osc.frequency.setValueAtTime(523.25, now);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    // Note 2: E5
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    gain.gain.setValueAtTime(0.3, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.start(now);
    osc.stop(now + 1.5);
};

export const playAlarmSound = () => {
    const ctx = initAudio();
    if (!ctx) return;

    // Stop existing loop if any
    stopAlarmSound();

    // Play immediately
    playPulse(ctx);

    // Loop every 1.5 seconds (Matching pulse duration for continuous stream)
    intervalId = setInterval(() => {
        if (ctx.state === 'running') {
            playPulse(ctx);
        }
    }, 1500);
};

export const stopAlarmSound = () => {
    if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
    }
    // Note: We don't stop the exact currently playing oscillator node because 
    // it's short-lived, but we stop the loop so no new ones start.
};
