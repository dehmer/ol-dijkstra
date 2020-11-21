import { Fill, Stroke, Circle, Style, Text } from 'ol/style'
import corridors from './corridors/index'
import * as SIDC from './sidc'
import { primaryColor, accentColor } from './color-schemes'

const scheme = 'medium'
const styleOptions = feature => {
  const sidc = feature.get('sidc')

  return {
    primaryColor: primaryColor(scheme)(SIDC.identity(sidc)),
    accentColor: accentColor(SIDC.identity(sidc)),
    dashPattern: SIDC.status(sidc) === 'A' ? [20, 10] : null,
    thin: 3,
    thick: 5
  }
}

const styles = (mode, options) => write => ({
  solidLine: inGeometry => {
    const geometry = write(inGeometry)
    return [
      { width: options.thick, color: options.accentColor, lineDash: options.dashPattern },
      { width: options.thin, color: options.primaryColor, lineDash: options.dashPattern }
    ].map(stroke => new Style({ stroke: new Stroke(stroke), geometry }))
  },

  dashedLine: inGeometry => {
    const geometry = write(inGeometry)
    return [
      { width: options.thick, color: options.accentColor, lineDash: [20, 10] },
      { width: options.thin, color: options.primaryColor, lineDash: [20, 10] }
    ].map(stroke => new Style({ stroke: new Stroke(stroke), geometry }))
  },

  wireFrame: inGeometry => {
    if (mode !== 'selected') return []
    const stroke = new Stroke({ color: 'red', lineDash: [20, 8, 2, 8], width: 1.5 })
    return new Style({ geometry: write(inGeometry), stroke })
  },

  handles: inGeometry => {
    if (mode !== 'selected') return []
    const fill = new Fill({ color: 'rgba(255,0,0,0.6)' })
    const stroke = new Stroke({ color: 'white', width: 3 })
    return new Style({ geometry: write(inGeometry), image: new Circle({ fill, stroke, radius: 7 }) })
  },

  text: (inGeometry, options) => new Style({
    text: new Text(options),
    geometry: write(inGeometry)
  }),

  fill: (inGeometry, options) => new Style ({
    geometry: write(inGeometry),
    fill: new Fill(options)
  })
})

export const style = mode => (feature, resolution) => {
  const style = () => {
    const sidc = SIDC.normalize(feature.get('sidc'))
    const fn = corridors[sidc] || (() => null)
    return fn({ mode, feature, resolution, styles: styles(mode, styleOptions(feature)) })
  }

  return style()
}
