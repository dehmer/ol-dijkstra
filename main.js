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
import { Modify, Select, defaults as defaultInteractions } from 'ol/interaction'
import { style } from './style'
import json from './corridors.json'

;(() => R.range(1, 61).forEach(i => {
  proj4.defs(`EPSG:${32600 + i}`, `+proj=utm +zone=${i} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`)
  proj4.defs(`EPSG:${32700 + i}`, `+proj=utm +zone=${i} +south +ellps=WGS84 +datum=WGS84 +units=m +no_defs`)
}))()

register(proj4)

const features = new GeoJSON()
  .readFeatures(json, { featureProjection: 'EPSG:3857' })
  .filter((feature, index) => index === 0)

const center = [1741294.4412834928, 6140380.806904582]
const zoom = 11
const view = new View({ center, zoom })
const tileLayer = new TileLayer({ source: new OSM() })
const source = new VectorSource({ features })
const vectorLayer = new VectorLayer({ source, style })
// const layers = [tileLayer, vectorLayer]
const layers = [vectorLayer]
const target = document.getElementById('map')
const select = new Select({ style })
const modify = new Modify({ features: select.getFeatures() })
const interactions = defaultInteractions().extend([select, modify])
new Map({ interactions, view, layers, target })