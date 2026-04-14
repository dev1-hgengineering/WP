import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Achievement, AchievementPayload } from '../../shared/models/achievement.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AchievementService {
  private base = `${environment.apiBaseUrl}/achievements`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Achievement[]> {
    return this.http.get<Achievement[]>(`${this.base}/`);
  }

  create(data: AchievementPayload): Observable<Achievement> {
    return this.http.post<Achievement>(`${this.base}/`, data);
  }

  update(id: number, data: AchievementPayload): Observable<Achievement> {
    return this.http.put<Achievement>(`${this.base}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  downloadTxt(): void {
    this.http.get(`${this.base}/download`, { responseType: 'blob' }).subscribe(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'achievements.txt';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
