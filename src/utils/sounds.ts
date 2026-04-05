let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function playTone(freq: number, duration: number, gain = 0.3, type: OscillatorType = 'sine') {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    osc.frequency.value = freq
    osc.type = type
    gainNode.gain.setValueAtTime(gain, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {}
}

export function playSuccess() {
  playTone(440, 0.1)
  setTimeout(() => playTone(550, 0.1), 80)
  setTimeout(() => playTone(660, 0.15), 160)
}

export function playLevelUp() {
  [330, 440, 550, 660].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.15, 0.4), i * 100)
  })
}

export function playAchievement() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, 0.35), i * 80)
  })
}

export function playRouletteTick() {
  playTone(220, 0.05, 0.2, 'square')
}

export function playRouletteStop() {
  playTone(440, 0.1)
  setTimeout(() => playTone(660, 0.2), 100)
}
