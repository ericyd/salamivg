import { PI } from "../constants.js"
import { createRng, random } from "../random.js"
import { Oscillator } from "./oscillator.js"

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
  // hmm... currently not working
  const period = random(PI, 4 * PI, rng)
  const phase = random(-PI, PI, rng)
  const osc = new Oscillator({ amplitude: 1, period, phase, compress: false })
  return (x, y = 0) => osc.output(x, y)
}