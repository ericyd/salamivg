import { ClosedInterval } from '../types'

export type CompressorOptions = {
  /**
   * the knee. Should be proportionate to the signal being compressed, and greater than 0.
   */
  W: number
  /**
   * the threshold. Should be proportionate to the signal being compressed, and greater than 0.
   */
  T: number
  /**
   * the compression ratio. Should be in range [1, Infinity]
   */
  R: ClosedInterval<1, typeof Infinity>
}

// based on https://dsp.stackexchange.com/questions/73619/how-to-derive-equation-for-second-order-interpolation-of-soft-knee-cutoff-in-a-c
export class Compressor {
  W: number
  T: number
  R: ClosedInterval<1, typeof Infinity>

  constructor({ W, T, R }: CompressorOptions) {
    this.W = W
    this.T = T
    if (this.T < 0) {
      console.warn(
        `T is '${T}', but was expected to be in range [0, Infinity]. Wonkiness may ensue.`,
      )
    }
    this.R = R
  }
  /**
   * This should be the only public function,
   * but while developing I need to have the other functions available for testing.
   */
  compress(input: number): number {
    if (this.belowKnee(input)) {
      return input
    }
    if (this.insideKnee(input)) {
      return this.compressInsideKnee(input)
    }
    return this.compressAboveKnee(input)
  }

  belowKnee(input: number): boolean {
    // original formula
    // return 2 * (input - this.T) < -this.W
    return Math.abs(input) < this.T && 2 * (Math.abs(input) - this.T) < -this.W
  }

  insideKnee(input: number): boolean {
    return 2 * Math.abs(Math.abs(input) - this.T) <= this.W
  }

  compressInsideKnee(input: number): number {
    const sign = input < 0 ? -1 : 1
    return (
      sign *
      (Math.abs(input) +
        ((1 / this.R - 1) * (Math.abs(input) - this.T + this.W / 2) ** 2) /
          (2 * this.W))
    )
  }

  /**
   * Above the knee, compression is same as "hard knee" compression formula
   */
  compressAboveKnee(input: number): number {
    const sign = input < 0 ? -1 : 1
    return sign * (this.T + (Math.abs(input) - this.T) / this.R)
  }

  /**
   * Returns current compressor options.
   */
  options(): CompressorOptions {
    return { W: this.W, T: this.T, R: this.R }
  }
}
