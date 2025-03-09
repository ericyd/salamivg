// convenience types to be explicit about what types are expected
export type Radians = number
export type Degrees = number
export type Integer = number
export type Decimal = number
// Maybe TS already has a way to define a range of numbers,
// but until then these are just for documentation purposes.
/**
 * A number in range (i, j], i.e. greater than i and less than or equal to j.
 */
export type HalfOpenInterval<i, j> = number
/**
 * A number in range [i, j], i.e. greater than or equal to i and less than or equal to j.
 */
export type ClosedInterval<i, j> = number
/**
 * A number in range (i, j), i.e. greater than i and less than j.
 */
export type OpenInterval<i, j> = number
