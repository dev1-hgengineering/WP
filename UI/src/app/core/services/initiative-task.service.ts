import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InitiativeTask, InitiativeTaskPayload } from '../../shared/models/initiative-task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InitiativeTaskService {
  private base = `${environment.apiBaseUrl}/initiative-tasks`;

  constructor(private http: HttpClient) {}

  getAll(initiativeId?: number, developerId?: number, status?: string): Observable<InitiativeTask[]> {
    let params = new HttpParams();
    if (initiativeId) params = params.set('initiative_id', initiativeId);
    if (developerId)  params = params.set('developer_id', developerId);
    if (status)       params = params.set('status', status);
    return this.http.get<InitiativeTask[]>(`${this.base}/`, { params });
  }

  create(data: InitiativeTaskPayload): Observable<InitiativeTask> {
    return this.http.post<InitiativeTask>(`${this.base}/`, data);
  }

  update(id: number, data: InitiativeTaskPayload): Observable<InitiativeTask> {
    return this.http.put<InitiativeTask>(`${this.base}/${id}`, data);
  }

  patchStatus(id: number, status: string): Observable<InitiativeTask> {
    return this.http.patch<InitiativeTask>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
