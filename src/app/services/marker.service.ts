import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { PopupService } from './popup.service';

@Injectable({ providedIn: 'root' })
export class MarkerService {
    capitals: string = '/assets/data/usa-capitals.geojson';

    constructor(private http: HttpClient, private popupService: PopupService) { }

    static scaledRadius(population: number, maxPopulation: number): number {
        return 20 * (population / maxPopulation);
    }


    makeCapitalMakeres(map: L.Map) {
        this.http.get(this.capitals).subscribe((res: any) => {
            const maxPop = Math.max(...res.features.map(x => x.properties.population), 0);
            console.log(maxPop);

            res.features.forEach((capital: any): void => {
                // coords of capitals
                const lon = capital.geometry.coordinates[0];
                const lat = capital.geometry.coordinates[1];
                // add marker to map where we want to add our capitals
                const circle = L.circleMarker([lat, lon], {
                    radius: MarkerService.scaledRadius(capital.properties.population, maxPop)
                });

                // add popups to markers of capitals 
                circle.bindPopup(this.popupService.makeCapitalPopup(capital.properties), {
                    autoClose: false,
                    closeOnClick: false,
                });

                circle
                .addTo(map);
            });
        })
    }

}