import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PlayerProfile } from '../models/entities';
import { LolRole } from '../models/enums';

export interface CreatePlayerProfilePayload {
  summonerName: string;
  tagLine: string;
  region: string;
  mainRole?: LolRole;
  rank?: string;
  bio?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/player-profiles`;

  me(): Observable<PlayerProfile> {
    return this.http.get<PlayerProfile>(`${this.base}/me`);
  }

  byUserId(userId: string): Observable<PlayerProfile> {
    return this.http.get<PlayerProfile>(`${this.base}/${userId}`);
  }

  create(payload: CreatePlayerProfilePayload): Observable<PlayerProfile> {
    return this.http.post<PlayerProfile>(`${this.base}/me`, payload);
  }

  update(payload: Partial<CreatePlayerProfilePayload>): Observable<PlayerProfile> {
    return this.http.patch<PlayerProfile>(`${this.base}/me`, payload);
  }

  remove(): Observable<void> {
    return this.http.delete<void>(`${this.base}/me`);
  }
}
