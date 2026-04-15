import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RecurringTodo, RecurringTodoPayload,
  TimelineTodo, TimelineTodoPayload,
  DailyList, DailyTask,
} from '../../shared/models/todo.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TodoService {
  private base = `${environment.apiBaseUrl}/todos`;

  constructor(private http: HttpClient) {}

  // ── Recurring
  getRecurring(): Observable<RecurringTodo[]> {
    return this.http.get<RecurringTodo[]>(`${this.base}/recurring/`);
  }
  createRecurring(data: RecurringTodoPayload): Observable<RecurringTodo> {
    return this.http.post<RecurringTodo>(`${this.base}/recurring/`, data);
  }
  updateRecurring(id: number, data: RecurringTodoPayload): Observable<RecurringTodo> {
    return this.http.put<RecurringTodo>(`${this.base}/recurring/${id}`, data);
  }
  toggleRecurring(id: number): Observable<RecurringTodo> {
    return this.http.patch<RecurringTodo>(`${this.base}/recurring/${id}/toggle`, {});
  }
  deleteRecurring(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/recurring/${id}`);
  }

  // ── Timeline
  getTimeline(status?: string): Observable<TimelineTodo[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<TimelineTodo[]>(`${this.base}/timeline/`, { params });
  }
  createTimeline(data: TimelineTodoPayload): Observable<TimelineTodo> {
    return this.http.post<TimelineTodo>(`${this.base}/timeline/`, data);
  }
  updateTimeline(id: number, data: TimelineTodoPayload): Observable<TimelineTodo> {
    return this.http.put<TimelineTodo>(`${this.base}/timeline/${id}`, data);
  }
  patchTimelineStatus(id: number, status: string): Observable<TimelineTodo> {
    return this.http.patch<TimelineTodo>(`${this.base}/timeline/${id}/status`, { status });
  }
  deleteTimeline(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/timeline/${id}`);
  }

  // ── Daily
  getDailyByDate(date: string): Observable<DailyList | null> {
    return this.http.get<DailyList | null>(`${this.base}/daily/by-date`, { params: { date } });
  }
  createDailyList(date: string): Observable<DailyList> {
    return this.http.post<DailyList>(`${this.base}/daily/by-date`, {}, { params: { date } });
  }
  addDailyTask(listId: number, title: string, sortOrder = 0): Observable<DailyTask> {
    return this.http.post<DailyTask>(`${this.base}/daily/${listId}/tasks`, { title, sort_order: sortOrder });
  }
  toggleDailyTask(taskId: number): Observable<DailyTask> {
    return this.http.patch<DailyTask>(`${this.base}/daily/tasks/${taskId}/toggle`, {});
  }
  deleteDailyTask(taskId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/daily/tasks/${taskId}`);
  }
}
