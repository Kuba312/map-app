import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ShapeService {
    constructor(private http: HttpClient) { }
    
    getStateShapes() {
        return this.http.get('/assets/data/gz_2010_us_040_00_5m.json');
    }
}