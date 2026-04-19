import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Tournament } from '@core/models/entities';
import { TournamentStatus } from '@core/models/enums';

export interface CreateTournamentPayload {
  name: string;
  game?: string;
  format: string;
  registrationDeadline: string;
  startsAt: string;
  endsAt?: string;
  maxTeams: number;
}
export type UpdateTournamentPayload = Partial<CreateTournamentPayload>;

@Injectable({ providedIn: 'root' })
export class TournamentsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/tournaments`;

  list(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.baseUrl);
  }

  get(id: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateTournamentPayload): Observable<Tournament> {
    return this.http.post<Tournament>(this.baseUrl, payload);
  }

  update(
    id: string,
    payload: UpdateTournamentPayload,
  ): Observable<Tournament> {
    return this.http.patch<Tournament>(`${this.baseUrl}/${id}`, payload);
  }

  changeStatus(id: string, status: TournamentStatus): Observable<Tournament> {
    return this.http.patch<Tournament>(`${this.baseUrl}/${id}/status`, {
      status,
    });
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
