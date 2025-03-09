// utility functions intended only for internal use

export function warnWithDefault<T>(message: string, defaultValue: T): T {
  console.warn(message)
  return defaultValue
}

/**
 * more useful than an IIFE
 */
export function error(message: string): never {
  throw new Error(message)
}
