
import { YaAPILoader } from './ymaps-api-loader.js';
import { YaLayersService } from './ymaps-layers.service.js';


export class YaMapService {

    mapReady;

    constructor(htmlElement, options) {
        this._options = options || {}
        this.loader = new YaAPILoader(this._options.config)
        this.mapReady = this._apiLoader(htmlElement, this._options);
    }

  
    async destroy() {
        const map = await this._maps;
        map.destroy();
        document.getElementById('ymapsScript').remove();
        ymaps = null;
    }

    _apiLoader(htmlElement, options) {
        return new Promise((resolve, reject) => {
            this.loader.load().then(() => {
                this._maps = this._createMap(htmlElement, options);
                this._setPaneLayers();
                this._layers = new YaLayersService(options.layers);
                this._setBackgroundContainerMap();
                resolve(this._maps);
            }).catch((error) => reject(error));
        });
    }

    _createMap(htmlElement, options) {
        return new Promise((resolve, reject) => {
            resolve(this._createOptions(htmlElement, options));
        }).catch((error) => reject(error));
    }

    _createOptions(htmlElement, options) {
        return new ymaps.Map(htmlElement, { ...options.state }, {
            ...options.options, yandexMapDisablePoiInteractivity: true,
            restrictMapArea: [[-83.8, -170.8], [83.8, 170.8]], 
            suppressMapOpenBlock: true,
            autoFitToViewport: 'always'
        });
    }
   

    async _setBackgroundContainerMap() {
        const { container } = await this._maps;
        container.getElement().style.background = '#fff';
    }

    async _setPaneLayers() {
        const map = await this._maps;
        const options = {
            zIndex: 105,
            transparent: true
        };

        map.panes.append('layers', new ymaps.pane.MovablePane(map, options));
    }

}