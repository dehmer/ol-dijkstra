import proj4 from 'proj4'

// [EPSG:3857] -> string
export const zoneCode = point => {
  const proj = proj4('EPSG:3857', 'EPSG:4326')
  const [longitude, latitude] = proj.forward(point)
  const zone = Math.ceil((longitude + 180) / 6)
  const south = latitude < 0
  const utmCode = (south ? 32700 : 32600) + zone
  return `EPSG:${utmCode}`
}
