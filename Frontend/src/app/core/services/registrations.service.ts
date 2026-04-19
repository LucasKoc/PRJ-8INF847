import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { TournamentRegistration } from '@core/models/entities';
import { RegistrationStatus } from '@core/models/enums';

export interface ReviewPayload {
  status: RegistrationStatus.APPROVED | RegistrationStatus.REJECTED;
  reviewNote?: string;
}

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiBaseUrl;

  list(tournamentId: string): Observable<TournamentRegistration[]> {
    return this.http.get<TournamentRegistration[]>(
      `${this.api}/tournaments/${tournamentId}/registrations`,
    );
  }

  register(
    tournamentId: string,
    teamId: string,
  ): Observable<TournamentRegistration> {
    return this.http.post<TournamentRegistration>(
      `${this.api}/tournaments/${tournamentId}/registrations`,
      { teamId },
    );
  }

  review(
    registrationId: string,
    payload: ReviewPayload,
  ): Observable<TournamentRegistration> {
    return this.http.patch<TournamentRegistration>(
      `${this.api}/registrations/${registrationId}/review`,
      payload,
    );
  }

  cancel(registrationId: string): Observable<TournamentRegistration> {
    return this.http.delete<TournamentRegistration>(
      `${this.api}/registrations/${registrationId}`,
    );
  }
}
