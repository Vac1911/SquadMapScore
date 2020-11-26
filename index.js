import server from "./server/index.js"
import SquadLayerScore from "./squad-layers/layer-score.js"

console.log(new SquadLayerScore(server).getResults());
