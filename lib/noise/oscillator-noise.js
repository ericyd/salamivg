import { PI } from '../constants.js'
import { createRng, random, randomInt } from '../random.js'
import { Vector2 } from '../vector2.js'
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

/**
 * @callback OscillatorCurlFn
 * @param {number} x
 * @param {number} [y=0]
 * @returns {Vector2}
 */

// Straight from slide 29 of this:
// https://raw.githubusercontent.com/petewerner/misc/master/Curl%20Noise%20Slides.pdf
// Originally implemented here: https://github.com/ericyd/generative-art/blob/b9a1bc25ec60fb99e7e9a2bd9ba32c55da40da67/openrndr/src/main/kotlin/noise/curl.kt#L21
/**
 * Creates a curl noise function based on oscillators.
 *
 * epsilon is the length of the differential (might be using wrong terminology there)
 * I think there is some room for experimentation here... I'm not sure what the "right" epsilonilon is
 * @param {string} seed
 * @param {number} [epsilon=0.5]
 * @returns {OscillatorCurlFn}
 */
export function createOscCurl(seed, epsilon = 0.5) {
  const noiseFn = createOscNoise(seed)
  return (x, y = 0) => {
    // a is the partial derivative of our field at point (x, y) in y direction
    // ∂ / ∂y
    // The slides describe this as "∂x1/∂y" but personally I understand it better as ∂/∂y
    //
    // More readably, this is
    //    const a1 = noiseFn(x, y + epsilon)
    //    const a2 = noiseFn(x, y - epsilon)
    //    const a = (a1 - a2) / (2.0 * epsilon)
    // but this is simplified for MAXIMUM SPEED 😂
    const a =
      (noiseFn(x, y + epsilon) - noiseFn(x, y - epsilon)) / (2.0 * epsilon)

    // b is the partial derivative of our field at point (x, y) in x direction
    // ∂ / ∂x
    // The slides describe this as "∂y1/∂x" but personally I understand it better as ∂/∂x
    //
    // Expanded:
    //    const b1 = noiseFn(x + epsilon, y)
    //    const b2 = noiseFn(x - epsilon, y)
    //    const b = (b1 - b2) / (2.0 * epsilon)
    const b =
      (noiseFn(x + epsilon, y) - noiseFn(x - epsilon, y)) / (2.0 * epsilon)

    return new Vector2(a, -b)
  }
}
