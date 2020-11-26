import fs from 'fs';
import SquadLayers, { SquadLayers as SquadLayersClass } from './squad-layers.js';

const sumTo = n => n * (n + 1) / 2;

export default class SquadLayerScore extends SquadLayersClass {

  /**
   * Creates new scores foreach layer.
   * @param {Object} server - The server to generate scores for.
   * @param {Object} options - Options to use for score generation.
   */
  constructor(server, options = {}) {
    super();

    this.options = Object.assign(options, {
      maxHistoryLength: 32,
      weights: {
        gamemodeScore: 1,
        mapScore: 1,
        sizeScore: 1,
        factionScore: 1,
      }
    })

    this.history = server.layerHistory.slice(0, Math.min(server.layerHistory.length, this.options.maxHistoryLength)).map( lay => this.normalizeLayer(lay) );

    this.results = [];

    console.table(this.history, ["map", "gamemode", "version", "mapSize", "teamOne", "teamTwo"]);
  }

  getResults() {
    const options = this.getNormalLayers().map((layer, i) => {
      let score = {
        name: layer.layerClassname,
        gamemodeScore: this.gamemodeRepetitivenessScore(layer.gamemode) * this.options.weights.gamemodeScore,
        mapScore: this.mapRepetitivenessScore(layer.map) * this.options.weights.mapScore,
        sizeScore: this.sizeRepetitivenessScore(layer.mapSize) * this.options.weights.sizeScore,
        factionScore: (this.factionRepetitivenessScore(layer.teamOne.faction) + this.factionRepetitivenessScore(layer.teamTwo.faction)) / 2 * this.options.weights.factionScore,
      }
      score.sum = (score.gamemodeScore + score.mapScore + score.sizeScore + score.factionScore) / 4
      return score;
    });

    return options.sort( (a, b) => a.sum - b.sum ).slice(0, 3);
  }

  /**
   * Get the frequency and recency of a condition in history.
   * @param {closure} condition - The condition to indicate if a layer is repeated.
   * @return {float} score - A normalized score where: 0 means the condition has not been met, and 1 means the condition was always met
   */
  getAttrRepetitiveness(condition) {
    let max = sumTo(this.history.length),
      occurrence = 0;

    for(let i = 0; i < this.history.length; i++)
      if(condition(this.history[i]))
        occurrence += (this.history.length - i);

    return occurrence != 0 ? occurrence / max : 0;
  }

  /**
   * Get the frequency and recency of a gamemode in history.
   * @param {closure} gamemode - The gamemode to look for.
   * @return {float} score - {@see getAttrRepetitiveness}
   */
  gamemodeRepetitivenessScore(gamemode) {
    return this.getAttrRepetitiveness(l => l.gamemode == gamemode)
  }

  /**
   * Get the frequency and recency of a faction in history.
   * @param {closure} faction - The faction to look for.
   * @return {float} score - {@see getAttrRepetitiveness}
   */
  factionRepetitivenessScore(faction) {
    return this.getAttrRepetitiveness(l => l.teamOne.faction == faction || l.teamTwo.faction == faction)
  }

  /**
   * Get the frequency and recency of a map in history.
   * @param {closure} map - The map to look for.
   * @return {float} score - {@see getAttrRepetitiveness}
   */
  mapRepetitivenessScore(map) {
    return this.getAttrRepetitiveness(l => l.map == map)
  }

  /**
   * Get the frequency and recency of a size in history.
   * @param {closure} size - The size to look for.
   * @return {float} score - {@see getAttrRepetitiveness}
   */
  sizeRepetitivenessScore(size) {
    return this.getAttrRepetitiveness(l => l.mapSize == size)
  }

  getNormalLayers() {
    return this.getLayers().map( lay => this.normalizeLayer(lay) ).filter( lay => lay.map !== 'Tutorials');
  }

  normalizeLayer(layer) {
    const factionAlias = {
      CAF_AR: 'CAF',
      RUS_DE: 'RUS',
    };

    if(Object.keys(factionAlias).includes(layer.teamOne.faction))
      layer.teamOne.faction = factionAlias[layer.teamOne.faction];
    if(Object.keys(factionAlias).includes(layer.teamTwo.faction))
      layer.teamTwo.faction = factionAlias[layer.teamTwo.faction];

    if(layer.map.startsWith("CAF ")) {
      layer.map = layer.map.slice(4);
    }

    return layer;
  }
}
