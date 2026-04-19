import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Team, TeamMember } from '@core/models/entities';
import { LolRole } from '@core/models/enums';

export interface CreateTeamPayload {
  name: string;
  tag: string;
}
export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export interface AddMemberPayload {
  userId: string;
  role: LolRole;
  isSubstitute?: boolean;
}
export interface UpdateMemberPayload {
  role?: LolRole;
  isSubstitute?: boolean;
}

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/teams`;

  list(): Observable<Team[]> {
    return this.http.get<Team[]>(this.baseUrl);
  }

  get(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateTeamPayload): Observable<Team> {
    return this.http.post<Team>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateTeamPayload): Observable<Team> {
    return this.http.patch<Team>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // ---- membres ----
  listMembers(teamId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.baseUrl}/${teamId}/members`);
  }

  addMember(teamId: string, payload: AddMemberPayload): Observable<TeamMember> {
    return this.http.post<TeamMember>(
      `${this.baseUrl}/${teamId}/members`,
      payload,
    );
  }

  updateMember(
    teamId: string,
    memberId: string,
    payload: UpdateMemberPayload,
  ): Observable<TeamMember> {
    return this.http.patch<TeamMember>(
      `${this.baseUrl}/${teamId}/members/${memberId}`,
      payload,
    );
  }

  removeMember(teamId: string, memberId: string): Observable<TeamMember> {
    return this.http.delete<TeamMember>(
      `${this.baseUrl}/${teamId}/members/${memberId}`,
    );
  }
}
