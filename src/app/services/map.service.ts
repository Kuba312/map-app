import { Injectable } from '@angular/core';
import * as L from 'leaflet';

@Injectable({ providedIn: 'root' })
export class MapService {

    mainPolygon: L.Polygon;
    distnaceClickEvent: any;

    constructor() {
        this.mainPolygon = L.polygon([], { color: 'purple' });
    }

    drawPolygon(map: L.Map) {
        map.off('click', this.distnaceClickEvent);

        // initialize empty polygon
        const polygon = this.mainPolygon.addTo(map);
        // add listening to the map
        map.on('click', (event) => {
            const latlng = event.latlng;
            // add drawed polygon to map
            polygon.addLatLng(latlng);
        });
    }

    stopDrawingPolygon(map: L.Map) {
        const masterPolygon = L.polygon([], { color: 'grey' }).addTo(map);
        const masterPolygonCoords = [];

        map.on('dblclick', (e) => {
            const mainPolygon = this.mainPolygon.addTo(map);

            const clickedPolygonAllCoords = mainPolygon.getLatLngs();
            console.log(clickedPolygonAllCoords);

            // cause we dobuble clicked we got the last line the same like a previus
            let clickedAllCoordsExpectLastOne = clickedPolygonAllCoords.pop();
            masterPolygonCoords.push(clickedAllCoordsExpectLastOne);

            // here we save our poly lines that we drawed
            masterPolygon.setLatLngs(masterPolygonCoords);

            // reset our drawing - we can start from new line
            mainPolygon.setLatLngs([]);

            // disable listening click event
            map.off('click');
            let drawPolygonBtnElement: HTMLElement = document.querySelector('.draw-polygon');
            if (drawPolygonBtnElement) {
                // and remove style from button
                L.DomUtil.removeClass(drawPolygonBtnElement, 'draw-active');
                map.on('click', this.distnaceClickEvent);
            }
        })
    }

    mesuareDistanceBetweenTwoPoints(map: L.Map) {
        let counter = 0;
        // we have to keep our points that we click on the map (lat and lng)
        let coordiantes = [];
        this.distnaceClickEvent = (e: L.LeafletMouseEvent) => {
            ++counter;
            let latlng = e.latlng;

            const marker = L.marker(latlng, {
                opacity: .9
            }).addTo(map);

            coordiantes.push(latlng);

            // add popup to our marker
            marker.bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false, // prevent closing popup when user click on random point on map,
                })
            )
                .setPopupContent(counter + "")
                .openPopup();

            // calculate distance
            if (counter >= 2) {
                // distance - this function allow us ti calculate distance between two points
                let distance = map.distance(coordiantes[0], coordiantes[1]);
                console.log(distance.toFixed(1));
                // remove first coords because the last one should be first in the next click!!!
                coordiantes.shift();
            }
        }
        map.on('click', this.distnaceClickEvent)
    }

}