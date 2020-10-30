import * as R from 'ramda'
import proj4 from 'proj4'

import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import Map from 'ol/Map'
import OSM from 'ol/source/OSM'
import VectorSource from 'ol/source/Vector'
import View from 'ol/View'
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer'
import { register } from 'ol/proj/proj4'
import { Fill, Stroke, Style, Circle } from 'ol/style'
import { map as mapFeature } from './G_G_OLAGM'
// import { map as mapFeature } from './G_G_OLAGS'
import json from './corridors.json'

;(() => R.range(1, 61).forEach(i => {
  proj4.defs(`EPSG:${32600 + i}`, `+proj=utm +zone=${i} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`)
  proj4.defs(`EPSG:${32700 + i}`, `+proj=utm +zone=${i} +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs`)
}))()

register(proj4)


const fill = new Fill({ color: 'rgba(255,255,155,0.4)' })
const stroke = new Stroke({ color: '#3399CC', width: 1 })
const image = new Circle({ fill, stroke, radius: 5 })
const defaultStyle = new Style({ fill, stroke, image })
const style = feature => feature.get('style') || defaultStyle

const corridors = new GeoJSON()
  .readFeatures(json, { featureProjection: 'EPSG:3857' })
  // .filter((feature, index) => index === 2)

// TODO: error handling
const features = corridors.map(mapFeature)

const center = [1741294.4412834928, 6140380.806904582]
const zoom = 11
const view = new View({ center, zoom })
const tileLayer = new TileLayer({ source: new OSM() })
const source = new VectorSource({ features })
const vectorLayer = new VectorLayer({ source, style })
// const layers = [tileLayer, vectorLayer]
const layers = [vectorLayer]
const target = document.getElementById('map')
new Map({ view, layers, target })