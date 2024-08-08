import { YaMapService } from './services/ymaps-map.service.js';
import { MapState as state } from './constants/ymaps-state.constant.js'
import { MapOptions as options } from './constants/ymaps-options.constant.js';
import { MapConfig as config } from './constants/ymaps-config.constant.js';
import { default as listBoxOptions } from './constants/ymaps-list-box.constant.js';
import { ListOptions as listOptions } from './constants/list-options.constant.js';
import { TypesMap as typesMaps } from './constants/types-map.constant.js';

/**
 * Yandex Maps API
 * 
 * @see https://yandex.ru/dev/jsapi-v2-1/doc/ru/
 */

let map;
let mapService;
let listBoxControl;

const mapType = 'yandex#map';

async function onInit() {
    onInitMap();
}

function onInitMap() {
    const mapOptions = { state, options, config };
    mapService = new YaMapService('map', mapOptions);
    mapService.mapReady.then((yaMap) => {
        map = yaMap;
        map.setType(mapType);
        map.cursors.push('arrow');
        setOpacityLayer(0.7);
        buildListBoxOptions();
        document.querySelector('#map').setAttribute('data-load', true);
    });
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

function onEventsListBox(event){
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
