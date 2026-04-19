import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Tournament } from '../models/entities';
import { TournamentFormat, TournamentStatus } from '../models/enums';

export interface CreateTournamentPayload {
  name: string;
  game?: string;
  format: TournamentFormat;
  registrationDeadline: string;
  startsAt: string;
  endsAt?: string;
  maxTeams: number;
}

@Injectable({ providedIn: 'root' })
export class TournamentsService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/tournaments`;

  list(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.base);
  }

  get(id: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.base}/${id}`);
  }

  create(payload: CreateTournamentPayload): Observable<Tournament> {
    return this.http.post<Tournament>(this.base, payload);
  }

  update(id: string, payload: Partial<CreateTournamentPayload>): Observable<Tournament> {
    return this.http.patch<Tournament>(`${this.base}/${id}`, payload);
  }

  changeStatus(id: string, status: TournamentStatus): Observable<Tournament> {
    return this.http.patch<Tournament>(`${this.base}/${id}/status`, { status });
  }

  // Returns 501 in V1 — frontend catches and shows placeholder
  getBracket(id: string): Observable<unknown> {
    return this.http.get(`${this.base}/${id}/bracket`);
  }
}
