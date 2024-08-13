import { YaMapService } from './services/ymaps-map.service.js';
import { MapState as state } from './constants/ymaps-state.constant.js'
import { MapOptions as options } from './constants/ymaps-options.constant.js';
import { MapConfig as config } from './constants/ymaps-config.constant.js';
import { default as listBoxOptions } from './constants/ymaps-list-box.constant.js';
import { ListOptions as listOptions } from './constants/list-options.constant.js';
import { TypesMap as typesMaps } from './constants/types-map.constant.js';
import { PolygonOptions } from './constants/ymaps-polygon.options.constant.js';

/**
 * Yandex Maps API
 * 
 * @see https://yandex.ru/dev/jsapi-v2-1/doc/ru/
 */

let map;
let mapService;
let listBoxControl;
let marker;
let feature;

const mapType = 'yandex#map';

async function onInit() {
    onInitMap();
    onPreloader(false);
}

function onInitMap() {
    const mapOptions = { state, options, config };
    mapService = new YaMapService('map', mapOptions);
    mapService.mapReady.then((yaMap) => {
        map = yaMap;
        map.setType(mapType);
        map.cursors.push('arrow');
        setOpacityLayer(0.7);
        addListenerMap();
        buildListBoxOptions();
        document.querySelector('#map').setAttribute('data-load', true);
    });
}

function addListenerMap() {
    map.events.add('click', onClickMap.bind(this));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function buildMarker(coordinates) {
    return new ymaps.GeoObject({
        geometry: {
            type: "Point",
            coordinates: coordinates
        }
    }, {
        preset: "islands#redDotIcon",
        hasBalloon: false,
        hideIconOnBalloonOpen: false,
        hasHint: false,
    });
}

async function onClickMap(event) {
    onPreloader(true);
    const coordinates = event.get('coords');
    marker && map?.geoObjects?.remove(marker);
    marker = buildMarker(coordinates);
    map?.geoObjects?.add(marker);
    feature && feature.removeFromMap(map);
    findFeatureByLatLng(coordinates)
        .then((data) => {
            feature && feature.removeFromMap(map);
            feature = new ymaps.geoQuery(data);
            feature.addToMap(map);
        }).catch((err) => {
            console.error(err);
        })
        .finally(() => {
            onPreloader(false);
        })
}

async function buildFeaturePolygon(data) {
    const { coordinates } = await bildGeoObject(data) || {};
    if (!coordinates) return;

    return {
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coordinates] },
        properties: { ...data.properties, ...createProperty(data.properties) },
        options: { ...PolygonOptions, strokeWidth: 1 }
    }
}


function bildGeoObject(data) {
    if (!data || !data?.geometry) return;
    return new Promise((resolve, reject) => {
        const coordinates = data.geometry.type === 'MultiPolygon'
            ? reverseCoordinates(buildPolygon(data))
            : reverseCoordinates(data.geometry.coordinates[0])
        resolve({ coordinates })
    });
}

function onPreloader(isShow) {
    const preloader = document.querySelector('.mdc-linear-progress');
    delay(1000).then(() => isShow ? preloader.style.width = '100%' : preloader.style.width = '0');
}

function createProperty(data) {
    if (!data) return;
    const { id, address, type, area_value, util_by_doc } = data || {};
    return {
        balloonContentHeader: `<div><strong>Кадастровый номер: ${id}</strong></div>`,
        balloonContentBody: `<div><strong>Адрес: ${address ? address : ' - '}</strong></div><div>${util_by_doc ? util_by_doc : ' - '}</div> <div>Тип объекта: ${type}<div>Площадь: ${area_value}</div>`,
    }
}

function buildPolygon(data) {
    const polygon = new ymaps.geometry.pixel.MultiPolygon(data?.geometry?.coordinates, 'nonZero', {});
    return polygon.getCoordinates()[0][0]
}

function findFeatureByLatLng(coordinates) {
    return new Promise(async (resolve, reject) => {
        const data = await getData(coordinates);
        const feature = !!data?.features?.length && await buildFeaturePolygon(data?.features[0]);
        feature ? resolve(feature) : reject(null);
    });
}

function reverseCoordinates(data) {
    return data && data?.map((item) => {
        return item.reverse();
    });
}

async function getData(coordinates) {
    const response = await fetch(`https://geoservices.nextgis.com/pkk/features/by_pos?lat=${coordinates[0]}&lon=${coordinates[1]}&cache=include&types=1,5&apikey=fd62aacae84de1524d79224b94ce632f`);
    const data = await response.json();
    return data;
}

function buildListBoxOptions() {
    const listBoxItems = listOptions
        .map((title) => {
            return new ymaps.control.ListBoxItem({ data: { content: title }, state: { selected: false } })
        });

    const reducer = (filters, filter) => {
        filters[filter.data.get('content')] = filter.isSelected();
        return filters;
    };

    listBoxControl = new ymaps.control.ListBox(listBoxOptions(listBoxItems, reducer));
    map.controls.add(listBoxControl, { float: 'right' });
    addListenerListBox();
}

function addListenerListBox() {
    listBoxControl.events.add(['select', 'deselect'], onEventsListBox);
}

function onEventsListBox(event) {
    const listBoxItem = event.get('target');
    const selectedTypes = listBoxControl.getAll()
        .filter((item) => item.data.get('type') === event?.get('target').data?.get('type'))
        .map((item) => item?.state?.get('selected') ? typesMaps[item.data.get('content')] : false)
        .filter((item) => item);

    const filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
    filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
    listBoxControl.state.set('filters', filters);
    map.setType(selectedTypes.toString() ? `yandex#map,${selectedTypes.toString()}` : mapType);
}

function setOpacityLayer(opacity) {
    map.panes.get('layers').getElement().style.opacity = opacity;
}

document.addEventListener('DOMContentLoaded', onInit);
