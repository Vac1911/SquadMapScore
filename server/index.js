import { SquadLayers as SquadLayersClass } from "../squad-layers/squad-layers.js"

const layers = new SquadLayersClass().getLayers();

const randomInt = (min, max) => ~~(Math.random() * (max - min + 1)) + min;

export default {
  layerHistory: Array(32).fill().map(i => layers[randomInt(0, layers.length - 1)])
}
