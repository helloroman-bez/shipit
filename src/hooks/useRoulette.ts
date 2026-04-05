import { useState, useRef, useCallback } from 'react'
import type { RouletteTask } from '@/types'
import { ROULETTE_TASKS } from '@/data/rouletteTasks'
import { playRouletteTick, playRouletteStop } from '@/utils/sounds'

export function useRoulette(soundEnabled: boolean) {
  const [result, setResult] = useState<RouletteTask | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [displayTask, setDisplayTask] = useState<RouletteTask | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countRef = useRef(0)

  const spin = useCallback(() => {
    if (isSpinning) return
    const finalTask = ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)]
    setResult(finalTask)
    setIsSpinning(true)
    countRef.current = 0

    intervalRef.current = setInterval(() => {
      countRef.current += 1
      const randomTask = ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)]
      setDisplayTask(randomTask)
      if (soundEnabled) playRouletteTick()

      const delay = 80 + countRef.current * 12
      if (countRef.current >= 18) {
        clearInterval(intervalRef.current!)
        setDisplayTask(finalTask)
        setIsSpinning(false)
        if (soundEnabled) playRouletteStop()
      } else {
        clearInterval(intervalRef.current!)
        intervalRef.current = setInterval(() => {
          // handled by recursive logic below
        }, delay)
        // Restart with new delay
        clearInterval(intervalRef.current!)
        setTimeout(() => {
          if (countRef.current < 18) {
            intervalRef.current = setInterval(() => {}, 99999)
            spinStep(finalTask, soundEnabled)
          }
        }, delay)
      }
    }, 80)
  }, [isSpinning, soundEnabled])

  const spinStep = useCallback((finalTask: RouletteTask, soundEnabled: boolean) => {
    let count = 0
    const tick = () => {
      count++
      countRef.current = count
      if (count >= 20) {
        setDisplayTask(finalTask)
        setIsSpinning(false)
        if (soundEnabled) playRouletteStop()
        return
      }
      setDisplayTask(ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)])
      if (soundEnabled) playRouletteTick()
      setTimeout(tick, 80 + count * 10)
    }
    tick()
  }, [])

  const spinClean = useCallback(() => {
    if (isSpinning) return
    const finalTask = ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)]
    setResult(finalTask)
    setIsSpinning(true)
    setDisplayTask(null)
    countRef.current = 0

    let count = 0
    const tick = () => {
      count++
      if (count >= 20) {
        setDisplayTask(finalTask)
        setIsSpinning(false)
        if (soundEnabled) playRouletteStop()
        return
      }
      setDisplayTask(ROULETTE_TASKS[Math.floor(Math.random() * ROULETTE_TASKS.length)])
      if (soundEnabled) playRouletteTick()
      setTimeout(tick, 60 + count * 12)
    }
    tick()
  }, [isSpinning, soundEnabled, spinStep])

  return { result, displayTask, isSpinning, spin: spinClean }
}
