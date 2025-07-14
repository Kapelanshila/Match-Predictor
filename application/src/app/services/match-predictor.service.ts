import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MatchPredictorService {
  private apiEndpoint = 'http://127.0.0.1:5000/predict';

  constructor(private http: HttpClient) { }

  getPredictions(homeTeam: string, awayTeam: string): Observable<any> {
    const payload = { home_team: homeTeam, away_team: awayTeam };
    return this.http.post(this.apiEndpoint, payload);
  }
}
