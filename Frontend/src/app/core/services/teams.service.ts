import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { Team, TeamMember } from '../models/entities';
import { LolRole } from '../models/enums';

export interface CreateTeamPayload {
  name: string;
  tag: string;
}

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
  private readonly base = `${environment.apiBaseUrl}/teams`;

  list(): Observable<Team[]> {
    return this.http.get<Team[]>(this.base);
  }

  get(id: string): Observable<Team> {
    return this.http.get<Team>(`${this.base}/${id}`);
  }

  create(payload: CreateTeamPayload): Observable<Team> {
    return this.http.post<Team>(this.base, payload);
  }

  update(id: string, payload: Partial<CreateTeamPayload>): Observable<Team> {
    return this.http.patch<Team>(`${this.base}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  listMembers(teamId: string): Observable<TeamMember[]> {
    return this.http.get<TeamMember[]>(`${this.base}/${teamId}/members`);
  }

  addMember(teamId: string, payload: AddMemberPayload): Observable<TeamMember> {
    return this.http.post<TeamMember>(`${this.base}/${teamId}/members`, payload);
  }

  updateMember(teamId: string, memberId: string, payload: UpdateMemberPayload): Observable<TeamMember> {
    return this.http.patch<TeamMember>(`${this.base}/${teamId}/members/${memberId}`, payload);
  }

  removeMember(teamId: string, memberId: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${teamId}/members/${memberId}`);
  }
}
