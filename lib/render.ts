/**
 * Helper functions for running this framework locally as an art platform.
 *
 * This file is exported separately from the rest of the lib to isolate Node.js dependencies.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { basename, extname, join } from 'node:path'
import { Svg, SvgAttributes, SvgBuilder } from './components/index'

const NOOP = () => {}

/**
 * RenderLoopOptions defines the options for the render loop.
 */
export type RenderLoopOptions = {
  /**
   * Number of times the render loop will run. Each loop will write the SVG to a file and open it if `open` is true.
   * @default 1
   */
  loopCount?: number
  /**
   * Opens the rendered SVG after every frame using the system `open` command.
   * @default true
   */
  openEveryFrame?: boolean
  /**
   * Logs the filename to "console.log" after every frame.
   * @default true
   */
  logFilename?: boolean
  /**
   * The directory to write the rendered SVGs to.
   * @default 'screenshots'
   */
  renderDirectory?: string
}

export function timestamp(d = new Date()): string {
  return d.toISOString().replace(/[^a-zA-Z0-9]/g, '-')
}

/**
 * @returns the most recent rendered SVG
 */
export function renderSvg(
  {
    loopCount = 1,
    openEveryFrame = true,
    logFilename = true,
    renderDirectory = 'screenshots',
    ...svgAttributes
  }: SvgAttributes & RenderLoopOptions,
  builder: SvgBuilder,
): string {
  let loops = 0
  let rendered = ''
  while (loops < loopCount) {
    const svg = new Svg(svgAttributes)
    loops++
    const sketchFilename = basename(process.argv[1], extname(process.argv[1]))
    mkdirSync(join(renderDirectory, sketchFilename), { recursive: true })
    const postLoop = builder(svg) ?? NOOP
    const filename = join(
      renderDirectory,
      sketchFilename,
      `${timestamp()}-${svg.formatFilenameMetadata()}.svg`,
    )
    rendered = svg.render()
    writeFileSync(filename, rendered)
    if (openEveryFrame) {
      const command = process.platform === 'win32' ? 'start' : 'open'
      execSync(`${command} "${filename}"`)
    }
    if (logFilename) {
      console.log(filename)
    }
    postLoop()
  }
  return rendered
}

/**
 * Turns the `render` function into a NOOP.
 * Useful if you want to explore multiple algorithms in the same sketch
 */
renderSvg.skip = NOOP
