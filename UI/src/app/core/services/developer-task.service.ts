import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DeveloperTask, DeveloperTaskPayload } from '../../shared/models/developer-task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeveloperTaskService {
  private base = `${environment.apiBaseUrl}/developer-tasks`;

  constructor(private http: HttpClient) {}

  getAll(developerId?: number, status?: string): Observable<DeveloperTask[]> {
    let params = new HttpParams();
    if (developerId) params = params.set('developer_id', developerId);
    if (status)      params = params.set('status', status);
    return this.http.get<DeveloperTask[]>(`${this.base}/`, { params });
  }

  create(data: DeveloperTaskPayload): Observable<DeveloperTask> {
    return this.http.post<DeveloperTask>(`${this.base}/`, data);
  }

  update(id: number, data: DeveloperTaskPayload): Observable<DeveloperTask> {
    return this.http.put<DeveloperTask>(`${this.base}/${id}`, data);
  }

  patchStatus(id: number, status: string): Observable<DeveloperTask> {
    return this.http.patch<DeveloperTask>(`${this.base}/${id}/status`, { status });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
