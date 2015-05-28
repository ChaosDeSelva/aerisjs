define([
  'aeris/util',
  'aeris/viewcollection',
  'aeris/maps/extensions/strategyobject',
  'aeris/api/collections/geojsonfeaturecollection',
  'aeris/maps/strategy/stormcells'
], function(_, ViewCollection, StrategyObject, GeoJsonFeatureCollection, StormCellsStrategy) {
  /** @class StormCells */
  var StormCells = function(opt_models, opt_options) {
    var options = _.defaults(opt_options || {}, {
      data: new GeoJsonFeatureCollection(null, {
        endpoint: 'stormcells',
        action: 'within'
      }),
      map: null,
      strategy: StormCellsStrategy
    });
    this.map_ = options.map;

    ViewCollection.call(this, opt_models, options);
    StrategyObject.call(this, options);
  };
  _.inherits(StormCells, ViewCollection);
  _.extend(StormCells.prototype, StrategyObject.prototype);


  StormCells.prototype.toGeoJson = function() {
    return this.data_.toGeoJson();
  };

  StormCells.prototype.setMap = function(map) {
    var isSettingMap = !this.hasMap() && map;
    var isRemovingMap = this.hasMap() && !map;

    this.map_ = map;

    if (isSettingMap) {
      this.trigger('map:set', this, map, {});
    }
    else if (isRemovingMap) {
      this.trigger('map:remove', this, map, {});
    }
  };

  StormCells.prototype.getMap = function() {
    return this.map_;
  };

  StormCells.prototype.hasMap = function() {
    return !!this.map_;
  };

  return StormCells;
});