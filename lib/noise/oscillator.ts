/**
 * Oscillator noise
 *
 * Kinda similar to this (https://piterpasma.nl/articles/wobbly) although I had the idea independently
 */

import { Compressor } from './compressor.js'

/**
 * @typedef {object} OscillatorAttributes
 * @property {number} period
 * @property {number} amplitude
 * @property {(t: number) => number} [wave=Math.sin]
 * @property {number} [phase=0]
 * @property {boolean | import('./compressor.js').CompressorOptions} [compress=false] When `compress` is `true`, the compressor will default to { W: amplitude * 0.3, T: amplitude * 0.7, R: 2 }
 */

export class Oscillator {
  /** @type {Oscillator[]} */
  #frequencyModulators = []
  /** @type {Oscillator[]} */
  #amplitudeModulators = []
  /** @type {Oscillator[]} */
  #phaseModulators = []
  /** @type {number} */
  #period
  /** @type {number} */
  #frequency
  /** @type {number} */
  #amplitude
  /** @type {(t: number) => number} */
  #wave
  /** @type {number} */
  #phase
  /** @type {Compressor | null} */
  #compressor

  /**
   * @param {OscillatorAttributes} attributes
   */
  constructor({
    phase = 0,
    period,
    amplitude,
    wave = Math.sin,
    compress = false,
  }) {
    this.#phase = phase
    this.#period = period
    this.#frequency = (2 * Math.PI) / this.#period
    this.#amplitude = amplitude
    this.#wave = wave
    const compressorEnabled = compress === true || typeof compress === 'object'
    const compressorOptions =
      typeof compress === 'object'
        ? compress
        : { W: amplitude * 0.3, T: amplitude * 0.7, R: 2 }
    this.#compressor = compressorEnabled
      ? new Compressor(compressorOptions)
      : null
  }

  toString() {
    return `Oscillator { period: ${this.#period}, amplitude: ${
      this.#amplitude
    }, phase: ${this.#phase}, compress: ${!!this.#compressor} }`
  }

  /**
   * @param {import('./compressor.js').CompressorOptions} options
   */
  set compressor(options) {
    this.#compressor = new Compressor(options)
  }

  /**
   *
   * @param {number} x
   * @param {number} [y=0]
   * @returns {number}
   */
  frequency(x, y = 0) {
    const modulated = this.#frequencyModulators.reduce(
      (sum, curr) => sum + curr.output(x, y),
      0,
    )
    return this.#frequency + modulated
  }

  /**
   *
   * @param {number} x
   * @param {number} [y=0]
   * @returns {number}
   */
  amplitude(x, y = 0) {
    const modulated = this.#amplitudeModulators.reduce(
      (sum, curr) => sum + curr.output(x, y),
      0,
    )

    // yModulation oscaillates bewteen [-1, 1] on a period of this.#amplitude
    // the purpose of yModulation is to ensure that waves vary over both the x axis and y axis
    const yModulation = Math.sin(y / this.#amplitude)
    return this.#amplitude * yModulation + modulated
  }

  /**
   *
   * @param {number} x
   * @param {number} [y=0]
   * @returns {number}
   */
  phase(x, y = 0) {
    const modulated = this.#phaseModulators.reduce(
      (sum, curr) => sum + curr.output(x, y),
      0,
    )
    return this.#phase + modulated
  }

  /**
   * @param {Oscillator} osc
   * @returns {Oscillator}
   */
  modulateFrequency(osc) {
    this.#frequencyModulators.push(osc)
    return this
  }

  /**
   * @param {Oscillator} osc
   * @returns {Oscillator}
   */
  modulateAmplitude(osc) {
    this.#amplitudeModulators.push(osc)
    return this
  }

  /**
   * @param {Oscillator} osc
   * @returns {Oscillator}
   */
  modulatePhase(osc) {
    this.#phaseModulators.push(osc)
    return this
  }

  /**
   * @param {number} input
   * @returns {number}
   */
  compress(input) {
    return this.#compressor === null ? input : this.#compressor.compress(input)
  }

  /**
   *
   * @param {number} x
   * @param {number} [y=0]
   * @returns {number}
   */
  output(x, y = 0) {
    return this.compress(
      this.#wave(x * this.frequency(x, y) + this.phase(x, y)) *
        this.amplitude(x, y),
    )
  }

  /**
   * @param {Partial<OscillatorAttributes>} attributes
   */
  clone(attributes) {
    const newOsc = new Oscillator({
      phase: this.#phase,
      amplitude: this.#amplitude,
      wave: this.#wave,
      compress: this.#compressor ? this.#compressor.options() : false,
      period: this.#period,
      ...attributes,
    })
    for (const o of this.#amplitudeModulators) {
      newOsc.modulateAmplitude(o)
    }
    for (const o of this.#frequencyModulators) {
      newOsc.modulateFrequency(o)
    }
    for (const o of this.#phaseModulators) {
      newOsc.modulatePhase(o)
    }
  }
}
