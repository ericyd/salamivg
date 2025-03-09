import { renderSvg, circle, hypot, vec2, map, Vector2 } from '../dist/index.js'

const config = {
  width: 100,
  height: 100,
  scale: 2,
  loopCount: 1,
}

renderSvg(config, (svg) => {
  // set basic SVG props
  svg.setBackground('#fff')
  svg.fill = null
  svg.stroke = '#000'
  svg.numericPrecision = 3

  // draw circle in middle of viewport
  svg.circle(
    circle({
      center: svg.center,
      radius: hypot(svg.width, svg.height) * 0.04,
      'stroke-width': 1,
    }),
  )

  // draw 14 concentric rings around the center. (14 is arbitrary)
  const nRings = 14
  for (let i = 1; i <= nRings; i++) {
    // use `map` to linearly interpolate the radius on a log scale
    const baseRadius = map(
      0,
      Math.log(nRings),
      hypot(svg.width, svg.height) * 0.09,
      hypot(svg.width, svg.height) * 0.3,
      Math.log(i),
    )

    // as the rings get further from the center,
    // the path is increasingly perturbated by the sine wave.
    const sineInfluence = map(
      0,
      Math.log(nRings),
      baseRadius * 0.01,
      baseRadius * 0.1,
      Math.log(i),
    )

    svg.path((p) => {
      // the stroke width gets thinner as the rings get closer to the edge
      p.strokeWidth = map(1, nRings, 0.8, 0.1, i)

      // the radius varies because the path is perturbated by a sine wave
      const radius = (angle) => baseRadius + Math.sin(angle * 6) * sineInfluence
      const start = Vector2.fromAngle(0).scale(radius(0)).add(svg.center)
      p.moveTo(start)

      // move our way around a circle to draw a smooth path
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        const next = Vector2.fromAngle(angle)
          .scale(radius(angle))
          .add(svg.center)
        p.lineTo(next)
      }
      p.close()
    })
  }
})
