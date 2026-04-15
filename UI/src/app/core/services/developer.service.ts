import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Developer, DeveloperPayload } from '../../shared/models/developer.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DeveloperService {
  private base = `${environment.apiBaseUrl}/developers`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Developer[]> {
    return this.http.get<Developer[]>(`${this.base}/`);
  }

  getById(id: number): Observable<Developer> {
    return this.http.get<Developer>(`${this.base}/${id}`);
  }

  create(data: DeveloperPayload): Observable<Developer> {
    return this.http.post<Developer>(`${this.base}/`, data);
  }

  update(id: number, data: DeveloperPayload): Observable<Developer> {
    return this.http.put<Developer>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
