import { environment } from './environment.js';

export const ymapsLayersConfig = {
    mapTypes: [
        { name: 'yandex#map,ngrr1', layers: ['yandex#map', 'nextgis#ngrr1', 'nextgis#ngrr2'] },
        { name: 'yandex#map,ngrr2', layers: ['yandex#map', 'nextgis#ngrr2'] },
        { name: 'yandex#map,ngrr3', layers: ['yandex#map', 'nextgis#ngrr3'] },
        { name: 'yandex#map,ngrr1,ngrr2,ngrr3', layers: ['yandex#map', 'nextgis#ngrr1', 'nextgis#ngrr2', 'nextgis#ngrr3'] },
        { name: 'yandex#map,ngrr1,ngrr2', layers: ['yandex#map', 'nextgis#ngrr1', 'nextgis#ngrr2'] },
        { name: 'yandex#map,ngrr2,ngrr3', layers: ['yandex#map', 'nextgis#ngrr2', 'nextgis#ngrr3'] },
        { name: 'yandex#map,ngrr1,ngrr3', layers: ['yandex#map', 'nextgis#ngrr1', 'nextgis#ngrr3'] }
    ],

    layers: [
        { tileUrl: `${environment.apiGeoservicesUri.uri}ngrr1/%z/%x/%y.png?apikey=${environment.apiGeoservicesUri.apiKey}`, name: 'nextgis#ngrr1', title: 'Единицы кадастрового деления', copyright: 'Росреестр|Единицы кадастрового деления', minZoom: 3, maxZoom: 20, pane: 'layers', zIndex: 200 },
        { tileUrl: `${environment.apiGeoservicesUri.uri}ngrr2/%z/%x/%y.png?apikey=${environment.apiGeoservicesUri.apiKey}`, name: 'nextgis#ngrr2', title: 'Земельные участки',copyright: 'Росреестр|Земельные участки', minZoom: 3, maxZoom: 19, pane: 'layers', zIndex: 200 },
        { tileUrl: `${environment.apiGeoservicesUri.uri}ngrr3/%z/%x/%y.png?apikey=${environment.apiGeoservicesUri.apiKey}`, name: 'nextgis#ngrr3', title: 'Зоны с особыми условиями использования территории', copyright: 'Росреестр|Зоны с особыми условиями использования территории', minZoom: 11, maxZoom: 20, pane: 'layers', zIndex: 200 },
    ]
};