import { Fill, Stroke, Circle, Style } from 'ol/style'
import GeometryType from 'ol/geom/GeometryType'
import { style as G_G_OLAGM } from './G_G_OLAGM'

export const createDefaultStyle = options => {
  const fill = new Fill({ color: 'rgba(255,255,255,0.4)' })
  const stroke = new Stroke({ color: '#3399CC', width: 1.25 })
    return new Style({
    fill,
    stroke,
    image: new Circle({ fill, stroke, radius: 5 }),
    ...options
  })
}

export const createErrorStyle = options => {
  const fill = new Fill({ color: 'rgba(255,0,0,0.4)' })
  const stroke = new Stroke({ color: '#FF0000', width: 1.25 })
    return new Style({
    fill,
    stroke,
    image: new Circle({ fill, stroke, radius: 5 }),
    ...options
  })
}

export const createEditingStyle = () => {
  const styles = {}

  const whiteOpaque = [255, 255, 255, 1]
  const whiteTransparent = [255, 255, 255, 0.5]
  const blue = [0, 153, 255, 1]
  const width = 3

  styles[GeometryType.POLYGON] = [
    new Style({ fill: new Fill({ color: whiteTransparent }) })
  ]

  styles[GeometryType.LINE_STRING] = [
    new Style({ stroke: new Stroke({ color: whiteOpaque, width: width + 2 }) }),
    new Style({ stroke: new Stroke({ color: blue, width: width }) })
  ]

  styles[GeometryType.POINT] = [
    new Style({
      image: new Circle({
        radius: width * 2,
        fill: new Fill({ color: blue }),
        stroke: new Stroke({ color: whiteOpaque, width: width / 2 })
      }),
      zIndex: Infinity
    })
  ]

  styles[GeometryType.MULTI_POLYGON] = styles[GeometryType.POLYGON]
  styles[GeometryType.MULTI_LINE_STRING] = styles[GeometryType.LINE_STRING]
  styles[GeometryType.MULTI_POINT] = styles[GeometryType.POINT]

  styles[GeometryType.GEOMETRY_COLLECTION] = styles[GeometryType.POLYGON].concat(
    styles[GeometryType.LINE_STRING],
    styles[GeometryType.POINT]
  )

  return styles
}


const styles = {
  'G*G*OLAGM-': G_G_OLAGM
}

export const parameterized = sidc =>
  `${sidc[0]}*${sidc[2]}*${sidc.substring(4, 10)}`


export const style = (feature, resolution) => {
  const sidc = parameterized(feature.get('sidc'))
  const fn = styles[sidc] || createDefaultStyle
  return fn(feature, resolution)
}
