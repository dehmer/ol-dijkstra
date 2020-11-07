import { Fill, Stroke, Circle, Style } from 'ol/style'
import { corridors } from './corridors'

export const parameterized = sidc =>
  `${sidc[0]}*${sidc[2]}*${sidc.substring(4, 10)}`

export const style = mode => (feature, resolution) => {
  const sidc = parameterized(feature.get('sidc'))
  const fn = corridors[sidc] || (() => null)

  const styles = {
    outline: (geometry, options = {}) => {
      const color = options.color || '#3399CC'
      const lineDash = options.lineDash
      const innerWidth = 3
      const outerWidth = 5

      const outerStroke = new Stroke({ color, width: outerWidth, lineDash })
      const innerStroke = mode === 'selected'
        ? new Stroke({ color, width: innerWidth, lineDash })
        : new Stroke({ color: '#ffffff', width: innerWidth, lineDash })

      return [
        new Style({ geometry, stroke: outerStroke }),
        new Style({ geometry, stroke: innerStroke }),
      ]
    },

    dashed: (geometry, options = {}) => {
      if (mode !== 'selected') return []
      const color = options.color || '#3399CC'
      const lineDash = options.lineDash || [5, 5]
      const stroke = new Stroke({ color, lineDash, width: 1 })
      return [new Style({ geometry, stroke })]
    },

    handles: geometry => {
      if (mode !== 'selected') return []
      const fill = new Fill({ color: 'rgba(255,0,0,0.6)' })
      const stroke = new Stroke({ color: 'white', width: 3 })
      return [
        new Style({ geometry, image: new Circle({ fill, stroke, radius: 7 }) })
      ]
    }
  }

  const options = { mode, feature, resolution, styles }
  return fn(options)
}
