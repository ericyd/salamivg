/**
 * Helper functions for running this framework locally as an art platform.
 * 
 * This file is exported separately from the rest of the lib to isolate Node.js dependencies.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { basename, extname, join } from 'node:path'
import { Svg } from './components/index.js'

const NOOP = () => {}

/**
 * @typedef {object} RenderLoopOptions
 * @property {number} loopCount number of times the render loop will run. Each loop will write the SVG to a file and open it if `open` is true.
 * @property {boolean} openEveryFrame Opens the rendered SVG after every frame using the system `open` command
 * @property {boolean} logFilename Logs the filename to "console.log" after every frame
 * @property {string} [renderDirectory="screenshots"] The directory to write the rendered SVGs to
 */

/**
 * @param {Date} [d=new Date()] 
 * @returns {string}
 */
export function timestamp(d = new Date()) {
  return d.toISOString().replace(/[^a-zA-Z0-9]/g, '-')
}

/**
 * 
 * @param {import('./components/svg.js').SvgAttributes & RenderLoopOptions} config 
 * @param {import('./components/svg.js').SvgBuilder} builder 
 * @returns {string} the most recent rendered SVG
 */
export function renderSvg({ loopCount = 1, openEveryFrame = true, logFilename = true, renderDirectory = 'screenshots', ...svgAttributes}, builder) {
  let loops = 0
  let rendered = ''
  while (loops < loopCount) {
    const svg = new Svg(svgAttributes)
    loops++
    const sketchFilename = basename(process.argv[1], extname(process.argv[1]))
    mkdirSync(join(renderDirectory, sketchFilename), { recursive: true })
    const postLoop = builder(svg) ?? NOOP
    const filename = join(renderDirectory, sketchFilename, `${timestamp()}-${svg.formatFilenameMetadata()}.svg`)
    rendered = svg.render()
    writeFileSync(filename, rendered)
    if (openEveryFrame) {
      const command = process.platform === "win32" ? 'start' : 'open'
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
 * @callback skip
 */
renderSvg.skip = NOOP