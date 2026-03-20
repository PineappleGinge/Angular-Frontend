import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StatsService {
  private http = inject(HttpClient);

  private readonly statsApiUrl = 'https://bfqn19v948.execute-api.eu-west-1.amazonaws.com/prod/Stats';

  getStats(): Observable<any> {
    return this.http.get<any>(this.statsApiUrl);
  }
}
