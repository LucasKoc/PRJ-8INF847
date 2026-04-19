import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { PlayerProfile } from '@core/models/entities';
import { LolRole } from '@core/models/enums';

export interface CreatePlayerProfilePayload {
  summonerName: string;
  tagLine: string;
  region: string;
  rank?: string;
  mainRole?: LolRole;
  bio?: string;
}

export type UpdatePlayerProfilePayload = Partial<CreatePlayerProfilePayload>;

@Injectable({ providedIn: 'root' })
export class ProfilesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/player-profiles`;

  list(): Observable<PlayerProfile[]> {
    return this.http.get<PlayerProfile[]>(this.baseUrl);
  }

  me(): Observable<PlayerProfile> {
    return this.http.get<PlayerProfile>(`${this.baseUrl}/me`);
  }

  byUser(userId: string): Observable<PlayerProfile> {
    return this.http.get<PlayerProfile>(`${this.baseUrl}/by-user/${userId}`);
  }

  create(payload: CreatePlayerProfilePayload): Observable<PlayerProfile> {
    return this.http.post<PlayerProfile>(this.baseUrl, payload);
  }

  update(payload: UpdatePlayerProfilePayload): Observable<PlayerProfile> {
    return this.http.patch<PlayerProfile>(`${this.baseUrl}/me`, payload);
  }

  remove(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/me`);
  }
}
