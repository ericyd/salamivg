import { PI } from '../constants.js'
import { createRng, random, randomInt } from '../random.js'
import { Oscillator } from './oscillator.js'

/**
 * @callback OscillatorNoiseFn
 * @param {number} x
 * @param {number} [y=0]
 * @returns {number} ideally in range [-1, 1]
 */

/**
 * Creates a noise function based on oscillators
 * @param {string} seed
 * @returns {OscillatorNoiseFn}
 */
export function createOscNoise(seed) {
  const rng = createRng(seed)
  const osc = new Oscillator({
    amplitude: 1,
    period: random(PI, 4 * PI, rng),
    phase: random(-PI, PI, rng),
    compress: true,
  })
  // console.debug(`root oscillator ${osc}`)

  const ampModulatorCount = randomInt(2, 5, rng)
  for (let i = 0; i < ampModulatorCount; i++) {
    const period = random(2.1, 9.2, rng)
    const modulator = new Oscillator({
      period,
      amplitude: random(0.1, 0.5, rng),
      phase: random(-period / 2, period / 2, rng),
      compress: true,
    })
    // console.debug(`amp modulator ${modulator}`)
    osc.modulateAmplitude(modulator)
  }

  const phaseModulatorCount = randomInt(1, 2, rng)
  for (let i = 0; i < phaseModulatorCount; i++) {
    const period = random(8.1, 20.2, rng)
    const modulator = new Oscillator({
      period,
      amplitude: random(0.1, 2.5, rng),
      phase: random(-period / 2, period / 2, rng),
      compress: true,
    })
    // console.debug(`phase modulator ${modulator}`)
    osc.modulatePhase(modulator)
  }

  return (x, y = 0) => osc.output(x, y)
}
