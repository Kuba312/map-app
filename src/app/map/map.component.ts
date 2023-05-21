import { AfterViewInit, Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import { MarkerService } from '../services/marker.service';
import { ShapeService } from '../services/shape.service';
import { MapService } from '../services/map.service';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
// customize default icon apperance
const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
// set default icon in Leaflet
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit {

  map: L.Map;
  // map is built from tiles and we have to initialize tiles by open map street view
  // and add it to the map by addTo() method
  openStreetMapStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    minZoom: 3,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  stadiaMaps = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  states: any;

  private readonly defaultLayerOptions = {
    weight: 3,
    opacity: 0.5,
    color: '#008f68',
    fillOpacity: 0.8,
    fillColor: '#6DB65B'
  };

  constructor(
    private markerService: MarkerService,
    private shapeService: ShapeService,
    private mapService: MapService) { }


  ngOnInit(): void { }

  // The map div will need to exist in the DOM before 
  // you can reference it to create your map
  ngAfterViewInit(): void {
    this.initMap();
  }


  private initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => this.getPosition(position));
    }
  }

  getPosition(position: GeolocationPosition) {
    const { latitude, longitude } = position.coords;
    const coords: any = [latitude, longitude];

    // L.map - allow idicates Leaflet element where the map should be rendered
    this.map = L.map('map', {
      center: coords,
      zoomAnimation: true,
      fadeAnimation: true,
      zoom: 13,
      layers: [
        // standard style of map when map is loaded
        this.openStreetMapStandard
      ]
    });
    this.addLayersControls()
    this.renderMarkerOfCurrentPosition(coords);
    this.loadAdditionalFeatures();
  }


  private addLayersControls() {
    // add some additional theme to the map 
    const baseLayersMaps = {
      '<b>OpenStreetMapStandard<b>': this.openStreetMapStandard,
      'StadiaMaps': this.stadiaMaps
    }
    L.control.layers(baseLayersMaps).addTo(this.map);
  }

  private addDrawingPolygonOnMap() {
    const customControl = L.Control.extend({
      onAdd: (map: L.Map) => {
        // create button on the map
        const div = L.DomUtil.create('button', 'draw-polygon');
        div.innerHTML = 'Draw a polygon';
        L.DomEvent.on(div, 'click', (e) => {
          L.DomEvent.stopPropagation(e);
          let toggleDrawPolygonButton = div.classList.toggle('draw-active');

          // disable listening on calculating distance when polygon drawing is enabled
          this.map.off('click', this.mapService.distnaceClickEvent);

          if (toggleDrawPolygonButton) {
            // if button is active - we draw polygon
            this.mapService.drawPolygon(map);
          }
        })
        return div;
      }
    });
    // add button to the map
    this.map.addControl(new customControl({ position: 'topright' }));
  }



  private renderMarkerOfCurrentPosition(coords: any) {
    L.marker(coords)
      .addTo(this.map)
      .bindPopup(L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: `popup`
      })
      ).setPopupContent(`working!`)
      .openPopup();
  }


  private loadAdditionalFeatures() {
    if (this.map) {
      this.markerService.makeCapitalMakeres(this.map);

      // Draw shapes in usa states
      // get data from server
      this.shapeService.getStateShapes()
        .subscribe(states => {
          this.states = states;
          this.initStatesLayer();
        });
      this.addDrawingPolygonOnMap();
      this.mapService.stopDrawingPolygon(this.map);
      this.mapService.mesuareDistanceBetweenTwoPoints(this.map);
    }
  }

  // add layers of States and hightlights them
  private initStatesLayer() {
    /*
      Creates a GeoJSON layer.
      Optionally accepts an object in GeoJSON format 
      to display on the map (you can alternatively add it 
      later with addData method) and an options object.
    */
    const stateLayer = L.geoJSON(this.states, {
      style: (feature) => (this.defaultLayerOptions),
      // Useful for attaching events and popups to features.
      // Allows us to attach some event on each layer on the map
      onEachFeature: (feature, layer) => (
        layer.on({
          mouseover: (e) => (this.highlightFeature(e)),
          mouseout: (e) => (this.resetFeature(e)),
        })
      )
    });

    this.map.addLayer(stateLayer);

    // Brings the layer group to the top [sic] of all other layers
    stateLayer.bringToBack();
  }


  private highlightFeature(e) {
    const layer = e.target;
    layer.setStyle({
      weight: 10,
      opacity: 1.0,
      color: '#DFA612',
      fillOpacity: 1.0,
      fillColor: '#FAE042'
    });
  }

  private resetFeature(e) {
    const layer = e.target;
    layer.setStyle(this.defaultLayerOptions);
  }


}
