/**
 * Oscillator noise
 *
 * Kinda similar to this (https://piterpasma.nl/articles/wobbly) although I had the idea independently
 */

import { Compressor, CompressorOptions } from './compressor'

export type OscillatorAttributes = {
  period: number
  amplitude: number
  /**
   * @default Math.sin
   */
  wave?(t: number): number
  /**
   * @default 0
   */
  phase: number
  /**
   * When `compress` is `true`, the compressor will default to { W: amplitude * 0.3, T: amplitude * 0.7, R: 2 }
   * @default false
   */
  compress: boolean | CompressorOptions
}

export class Oscillator {
  #frequencyModulators: Oscillator[] = []
  #amplitudeModulators: Oscillator[] = []
  #phaseModulators: Oscillator[] = []

  readonly #period: number
  readonly #frequency: number
  readonly #amplitude: number
  readonly #wave: (t: number) => number
  readonly #phase: number
  #compressor: Compressor | null

  /**
   * @param {OscillatorAttributes} attributes
   */
  constructor({
    phase = 0,
    period,
    amplitude,
    wave = Math.sin,
    compress = false,
  }: OscillatorAttributes) {
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

  set compressor(options: CompressorOptions) {
    this.#compressor = new Compressor(options)
  }

  frequency(x: number, y: number = 0): number {
    const modulated = this.#frequencyModulators.reduce(
      (sum, curr) => sum + curr.output(x, y),
      0,
    )
    return this.#frequency + modulated
  }

  amplitude(x: number, y: number = 0): number {
    const modulated = this.#amplitudeModulators.reduce(
      (sum, curr) => sum + curr.output(x, y),
      0,
    )

    // yModulation oscillates between [-1, 1] on a period of this.#amplitude
    // the purpose of yModulation is to ensure that waves vary over both the x axis and y axis
    const yModulation = Math.sin(y / this.#amplitude)
    return this.#amplitude * yModulation + modulated
  }

  phase(x: number, y: number = 0): number {
    const modulated = this.#phaseModulators.reduce(
      (sum, curr) => sum + curr.output(x, y),
      0,
    )
    return this.#phase + modulated
  }

  modulateFrequency(osc: Oscillator): Oscillator {
    this.#frequencyModulators.push(osc)
    return this
  }

  modulateAmplitude(osc: Oscillator): Oscillator {
    this.#amplitudeModulators.push(osc)
    return this
  }

  modulatePhase(osc: Oscillator): Oscillator {
    this.#phaseModulators.push(osc)
    return this
  }

  compress(input: number): number {
    return this.#compressor === null ? input : this.#compressor.compress(input)
  }

  output(x: number, y: number = 0): number {
    return this.compress(
      this.#wave(x * this.frequency(x, y) + this.phase(x, y)) *
        this.amplitude(x, y),
    )
  }

  clone(attributes: Partial<OscillatorAttributes>): Oscillator {
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
    return newOsc
  }
}
