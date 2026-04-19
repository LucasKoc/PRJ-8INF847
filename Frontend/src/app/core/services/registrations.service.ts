import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TournamentRegistration } from '../models/entities';
import { RegistrationStatus } from '../models/enums';

export interface ReviewPayload {
  status: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED;
  reviewNote?: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  list(tournamentId: string): Observable<TournamentRegistration[]> {
    return this.http.get<TournamentRegistration[]>(
      `${this.base}/tournaments/${tournamentId}/registrations`,
    );
  }

  register(tournamentId: string, teamId: string): Observable<TournamentRegistration> {
    return this.http.post<TournamentRegistration>(
      `${this.base}/tournaments/${tournamentId}/registrations/${teamId}`,
      {},
    );
  }

  review(registrationId: string, payload: ReviewPayload): Observable<TournamentRegistration> {
    return this.http.patch<TournamentRegistration>(
      `${this.base}/registrations/${registrationId}/review`,
      payload,
    );
  }

  cancel(registrationId: string): Observable<TournamentRegistration> {
    return this.http.patch<TournamentRegistration>(
      `${this.base}/registrations/${registrationId}/cancel`,
      {},
    );
  }
}
