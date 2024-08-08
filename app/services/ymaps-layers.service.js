import { ymapsLayersConfig } from "../constants/ymaps-layers.constant.js";

export class YaLayersService {

    constructor() {
        this.layers = ymapsLayersConfig;
        this.addLayers(this.layers);
    }

    addLayers(layersConfig) {
        layersConfig?.layers?.forEach((layer) => {
            const f = { ...layer, cmp: this }
            ymaps.layer.storage.add(layer.name, this.createLayer(f));
        });

        this.createMapTypes(layersConfig.mapTypes);
    }

    createMapTypes(data) {
        data?.forEach((layer) => {
            ymaps.mapType.storage.add(layer.name, new ymaps.MapType(layer.name, layer.layers));
        });
    }

    createLayer(data) {
        return function () {
            let layer = new ymaps.Layer('', {
                projection: ymaps.projection.sphericalMercator,
                pane: data.pane || null,
                tileSize: data?.tileSize || [256, 256],
                tileTransparent: true,
                zIndex: data.zIndex || null
            });

            layer.getTileUrl = (tileNumber, zoom) => {
                if (zoom <= data?.minZoom || zoom > data?.maxZoom) return;
                return data?.tileUrl.replace(/%x/ig, tileNumber[0]).replace(/%y/ig, tileNumber[1] === -1 ? 0 : tileNumber[1]).replace(/%z/ig, zoom)
            }

            layer.getCopyrights = () => {
                return ymaps.vow.resolve(data?.copyright || '');
            };

            layer.getZoomRange = () => {
                return ymaps.vow.resolve([data?.minZoom, data.maxZoom]);
            };

            return layer;
        };

    }

}