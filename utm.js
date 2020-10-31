import proj4 from 'proj4'

// [EPSG:3857] -> string
export const zone = reference => {
  const proj = proj4('EPSG:3857', 'EPSG:4326')
  const [longitude, latitude] = proj.forward(reference)
  const zone = Math.ceil((longitude + 180) / 6)
  const south = latitude < 0
  const utmCode = (south ? 32700 : 32600) + zone
  return `EPSG:${utmCode}`
}

export const transform = reference => {
  const code = zone(reference.getCoordinates())
  return {
    toUTM: geometry => geometry.transform('EPSG:3857', code),
    fromUTM: geometry => geometry.transform(code, 'EPSG:3857')
  }
}
