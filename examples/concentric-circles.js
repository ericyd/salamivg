import { renderSvg, circle, hypot, vec2, map } from '../lib/index.js'

const config = {
  width: 100,
  height: 100,
  scale: 2,
  loopCount: 1,
}

renderSvg(config, (svg) => {
  const center = vec2(svg.width, svg.height).div(2)
  svg.setBackground('#fff')
  svg.fill = null
  svg.stroke = '#000'
  svg.numericPrecision = 3

  svg.circle(
    circle({
      x: center.x,
      y: center.y,
      radius: hypot(svg.width, svg.height) * 0.04,
      'stroke-width': 1,
    }),
  )

  const nRings = 14
  for (let i = 1; i <= nRings; i++) {
    const baseRadius = map(
      0,
      Math.log(nRings),
      hypot(svg.width, svg.height) * 0.09,
      hypot(svg.width, svg.height) * 0.3,
      Math.log(i),
    )
    const sineInfluence = map(
      0,
      Math.log(nRings),
      baseRadius * 0.01,
      baseRadius * 0.1,
      Math.log(i),
    )
    svg.path((p) => {
      p.strokeWidth = map(1, nRings, 0.3, 0.05, i)
      let radius = baseRadius + Math.sin(0) * baseRadius * 0.1
      p.moveTo(vec2(Math.cos(0) * radius, Math.sin(0) * radius).add(center))
      for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
        radius = baseRadius + Math.sin(angle * 6) * sineInfluence //baseRadius * 0.1
        p.lineTo(
          vec2(Math.cos(angle) * radius, Math.sin(angle) * radius).add(center),
        )
      }
      p.close()
    })
  }
})
