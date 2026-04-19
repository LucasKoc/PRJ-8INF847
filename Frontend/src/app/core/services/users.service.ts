import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PublicUser } from '../models/entities';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/users`;

  search(query: string, limit = 10): Observable<PublicUser[]> {
    const params = new URLSearchParams({ q: query, limit: String(limit) });
    return this.http.get<PublicUser[]>(`${this.base}/search?${params}`);
  }

  get(id: string): Observable<PublicUser> {
    return this.http.get<PublicUser>(`${this.base}/${id}`);
  }
}
