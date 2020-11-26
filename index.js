import server from "./server/index.js"
import SquadLayerScore from "./squad-layers/layer-score.js"

console.table(new SquadLayerScore(server).getResults());
