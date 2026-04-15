import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Initiative, InitiativePayload } from '../../shared/models/initiative.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InitiativeService {
  private base = `${environment.apiBaseUrl}/initiatives`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Initiative[]> {
    return this.http.get<Initiative[]>(`${this.base}/`);
  }

  getById(id: number): Observable<Initiative> {
    return this.http.get<Initiative>(`${this.base}/${id}`);
  }

  create(data: InitiativePayload): Observable<Initiative> {
    return this.http.post<Initiative>(`${this.base}/`, data);
  }

  update(id: number, data: InitiativePayload): Observable<Initiative> {
    return this.http.put<Initiative>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  assignDeveloper(initiativeId: number, developerId: number): Observable<void> {
    return this.http.post<void>(`${this.base}/${initiativeId}/developers`, { developer_id: developerId });
  }

  removeDeveloper(initiativeId: number, developerId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${initiativeId}/developers/${developerId}`);
  }
}
