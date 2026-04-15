import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Developer, DeveloperPayload } from '../../shared/models/developer.model';
import { DeveloperTask, DeveloperTaskPayload } from '../../shared/models/developer-task.model';
import { DeveloperService } from '../../core/services/developer.service';
import { DeveloperTaskService } from '../../core/services/developer-task.service';
import { DeveloperFormComponent } from './developer-form/developer-form.component';
import { DeveloperTaskFormComponent } from './developer-task-form/developer-task-form.component';

const STATUS_CLASS: Record<string, string> = {
  pending: 'badge-grey', in_progress: 'badge-blue', completed: 'badge-green', blocked: 'badge-red',
};

@Component({
  selector: 'app-developers',
  standalone: true,
  imports: [CommonModule, DeveloperFormComponent, DeveloperTaskFormComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Developers</h1>
        <p class="subtitle">{{ developers.length }} developer{{ developers.length !== 1 ? 's' : '' }} tracked</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ Add Developer</button>
    </div>

    <div *ngIf="error" class="alert-error">{{ error }}</div>

    <app-developer-form
      *ngIf="showDevForm"
      [developer]="editingDev"
      [saving]="savingDev"
      (saved)="onDevSaved($event)"
      (cancelled)="showDevForm = false; editingDev = null"
    />

    <div *ngIf="loading" class="loading">Loading...</div>
    <div *ngIf="!loading && developers.length === 0 && !showDevForm" class="empty-state">
      No developers tracked yet.
    </div>

    <div class="dev-list" *ngIf="!loading && developers.length > 0">
      <div class="dev-card" *ngFor="let dev of developers">

        <!-- Developer header -->
        <div class="dev-header">
          <div class="dev-avatar">{{ initials(dev.name) }}</div>
          <div class="dev-info">
            <h2>{{ dev.name }}</h2>
            <span *ngIf="dev.email" class="dev-email">{{ dev.email }}</span>
          </div>
          <div class="dev-actions">
            <button class="btn-secondary btn-sm" (click)="startEditDev(dev)">Edit</button>
            <button class="btn-danger btn-sm" (click)="confirmDeleteDev(dev)">Delete</button>
          </div>
        </div>

        <!-- Independent tasks section -->
        <div class="tasks-section">
          <div class="tasks-header">
            <h3>Independent Tasks</h3>
            <button class="btn-primary btn-xs" (click)="toggleAddTask(dev.id)">+ Add</button>
          </div>

          <app-developer-task-form
            *ngIf="addingTaskFor === dev.id"
            [developerId]="dev.id"
            [saving]="savingTask[dev.id]"
            (saved)="onTaskSaved(dev.id, $event)"
            (cancelled)="addingTaskFor = null"
          />

          <app-developer-task-form
            *ngIf="editingTask[dev.id]"
            [task]="editingTask[dev.id]"
            [developerId]="dev.id"
            [saving]="savingTask[dev.id]"
            (saved)="onTaskUpdated(dev.id, $event)"
            (cancelled)="editingTask[dev.id] = null"
          />

          <div *ngIf="!taskMap[dev.id]?.length && addingTaskFor !== dev.id" class="no-tasks">
            No independent tasks yet.
          </div>

          <div class="task-list" *ngIf="taskMap[dev.id]?.length">
            <div class="task-row" *ngFor="let t of taskMap[dev.id]" [class.done]="t.status === 'completed'">
              <div class="task-main">
                <span class="task-title">{{ t.title }}</span>
                <span *ngIf="t.description" class="task-desc">{{ t.description }}</span>
              </div>
              <div class="task-meta">
                <span *ngIf="t.is_recurring" class="badge badge-purple">{{ t.recurrence_pattern }}</span>
                <span *ngIf="!t.is_recurring && t.due_date" class="due">{{ t.due_date }}</span>
              </div>
              <select class="status-sel" [value]="t.status" (change)="quickStatus(dev.id, t, $any($event.target).value)">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
              <div class="task-actions">
                <button class="btn-secondary btn-xs" (click)="startEditTask(dev.id, t)">Edit</button>
                <button class="btn-danger btn-xs" (click)="confirmDeleteTask(dev.id, t)">Delete</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    h1 { font-size: 1.75rem; font-weight: 700; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem; }
    .alert-error { background: #fee2e2; color: var(--danger); border: 1px solid #fca5a5; border-radius: var(--radius); padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.9rem; }
    .loading, .empty-state { text-align: center; color: var(--text-muted); padding: 3rem 1rem; }
    .dev-list { display: flex; flex-direction: column; gap: 1.25rem; }
    .dev-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
    .dev-header { display: flex; align-items: center; gap: 1rem; padding: 1.1rem 1.5rem; flex-wrap: wrap; }
    .dev-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--primary); color: white; font-weight: 700; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .dev-info { flex: 1; }
    .dev-info h2 { font-size: 1.05rem; font-weight: 700; }
    .dev-email { font-size: 0.82rem; color: var(--text-muted); }
    .dev-actions { display: flex; gap: 0.5rem; }
    .tasks-section { border-top: 1px solid var(--border); padding: 1rem 1.5rem; background: #fafafa; }
    .tasks-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
    .tasks-header h3 { font-size: 0.85rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .4px; }
    .no-tasks { font-size: 0.85rem; color: var(--text-muted); }
    .task-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .task-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0.75rem; background: white; border: 1px solid var(--border); border-radius: calc(var(--radius) - 2px); flex-wrap: wrap; }
    .task-row.done { opacity: 0.55; }
    .task-main { flex: 1; min-width: 120px; }
    .task-title { font-size: 0.88rem; font-weight: 600; }
    .task-desc { font-size: 0.8rem; color: var(--text-muted); margin-left: 0.4rem; }
    .task-meta { display: flex; align-items: center; gap: 0.4rem; }
    .due { font-size: 0.78rem; color: var(--text-muted); }
    .status-sel { border: 1px solid var(--border); border-radius: calc(var(--radius) - 2px); padding: 0.2rem 0.4rem; font-size: 0.78rem; background: white; cursor: pointer; }
    .task-actions { display: flex; gap: 0.35rem; }
    .badge { font-size: 0.72rem; border-radius: 20px; padding: 0.15rem 0.5rem; font-weight: 600; }
    .badge-grey   { background: #f1f5f9; color: #64748b; }
    .badge-blue   { background: #dbeafe; color: #1d4ed8; }
    .badge-green  { background: #dcfce7; color: #15803d; }
    .badge-red    { background: #fee2e2; color: #b91c1c; }
    .badge-purple { background: #ede9fe; color: #6d28d9; }
    .btn-sm  { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .btn-xs  { padding: 0.25rem 0.6rem; font-size: 0.75rem; }
  `],
})
export class DevelopersComponent implements OnInit {
  developers: Developer[] = [];
  taskMap: Record<number, DeveloperTask[]> = {};
  loading = true;
  error = '';
  showDevForm = false;
  editingDev: Developer | null = null;
  savingDev = false;
  addingTaskFor: number | null = null;
  editingTask: Record<number, DeveloperTask | null> = {};
  savingTask: Record<number, boolean> = {};

  constructor(
    private devSvc: DeveloperService,
    private taskSvc: DeveloperTaskService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    forkJoin({ developers: this.devSvc.getAll(), tasks: this.taskSvc.getAll() }).subscribe({
      next: ({ developers, tasks }) => {
        this.developers = developers;
        this.taskMap = {};
        for (const d of developers) {
          this.taskMap[d.id] = tasks.filter(t => t.developer_id === d.id);
          this.editingTask[d.id] = null;
          this.savingTask[d.id] = false;
        }
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load.'; this.loading = false; },
    });
  }

  initials(name: string): string { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }

  openForm(): void { this.editingDev = null; this.showDevForm = true; }
  startEditDev(d: Developer): void { this.editingDev = d; this.showDevForm = true; window.scrollTo({ top: 0, behavior: 'smooth' }); }

  onDevSaved(payload: DeveloperPayload): void {
    this.savingDev = true;
    const call = this.editingDev ? this.devSvc.update(this.editingDev.id, payload) : this.devSvc.create(payload);
    call.subscribe({
      next: () => { this.savingDev = false; this.showDevForm = false; this.editingDev = null; this.load(); },
      error: () => { this.savingDev = false; this.error = 'Failed to save developer.'; },
    });
  }

  confirmDeleteDev(d: Developer): void {
    if (!confirm(`Delete "${d.name}"? Their independent tasks will also be removed.`)) return;
    this.devSvc.delete(d.id).subscribe({ next: () => this.load(), error: () => { this.error = 'Failed to delete.'; } });
  }

  toggleAddTask(devId: number): void {
    this.addingTaskFor = this.addingTaskFor === devId ? null : devId;
  }

  onTaskSaved(devId: number, payload: DeveloperTaskPayload): void {
    this.savingTask[devId] = true;
    this.taskSvc.create(payload).subscribe({
      next: () => { this.savingTask[devId] = false; this.addingTaskFor = null; this.load(); },
      error: () => { this.savingTask[devId] = false; this.error = 'Failed to save task.'; },
    });
  }

  startEditTask(devId: number, t: DeveloperTask): void {
    this.editingTask[devId] = t;
    this.addingTaskFor = null;
  }

  onTaskUpdated(devId: number, payload: DeveloperTaskPayload): void {
    const task = this.editingTask[devId];
    if (!task) return;
    this.savingTask[devId] = true;
    this.taskSvc.update(task.id, payload).subscribe({
      next: () => { this.savingTask[devId] = false; this.editingTask[devId] = null; this.load(); },
      error: () => { this.savingTask[devId] = false; this.error = 'Failed to update task.'; },
    });
  }

  quickStatus(devId: number, t: DeveloperTask, status: string): void {
    this.taskSvc.patchStatus(t.id, status).subscribe({ next: () => this.load() });
  }

  confirmDeleteTask(devId: number, t: DeveloperTask): void {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    this.taskSvc.delete(t.id).subscribe({ next: () => this.load() });
  }
}
