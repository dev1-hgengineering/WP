import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Initiative, DeveloperSummary } from '../../../shared/models/initiative.model';
import { InitiativeTask, InitiativeTaskPayload } from '../../../shared/models/initiative-task.model';
import { Developer } from '../../../shared/models/developer.model';
import { InitiativeService } from '../../../core/services/initiative.service';
import { InitiativeTaskService } from '../../../core/services/initiative-task.service';
import { DeveloperService } from '../../../core/services/developer.service';
import { InitiativeTaskFormComponent } from '../initiative-task-form/initiative-task-form.component';

const STATUS_LABEL: Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed', blocked: 'Blocked' };
const STATUS_CLASS: Record<string, string> = { pending: 'badge-grey', in_progress: 'badge-blue', completed: 'badge-green', blocked: 'badge-red' };

@Component({
  selector: 'app-initiative-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, InitiativeTaskFormComponent],
  template: `
    <div *ngIf="loading" class="loading">Loading...</div>
    <div *ngIf="error" class="alert-error">{{ error }}</div>

    <ng-container *ngIf="initiative && !loading">
      <div class="breadcrumb"><a routerLink="/initiatives">Initiatives</a> / {{ initiative.name }}</div>

      <!-- Header -->
      <div class="page-header">
        <div>
          <h1>{{ initiative.name }}</h1>
          <div class="meta">
            <span class="badge" [ngClass]="initiativeStatusClass">{{ initiative.status | titlecase }}</span>
            <span *ngIf="initiative.is_recurring" class="badge badge-purple">
              Recurring · {{ initiative.recurrence_pattern }}
            </span>
            <span *ngIf="!initiative.is_recurring && initiative.end_date" class="date-range">
              {{ initiative.start_date }} → {{ initiative.end_date }}
            </span>
          </div>
          <p *ngIf="initiative.description" class="desc">{{ initiative.description }}</p>
        </div>
        <button class="btn-primary" (click)="showTaskForm = true; editingTask = null">+ Add Task</button>
      </div>

      <!-- Task form -->
      <app-initiative-task-form
        *ngIf="showTaskForm"
        [task]="editingTask"
        [initiativeId]="initiative.id"
        [developers]="initiative.developers"
        [saving]="savingTask"
        (saved)="onTaskSaved($event)"
        (cancelled)="showTaskForm = false; editingTask = null"
      />

      <!-- Members panel -->
      <div class="panel">
        <div class="panel-header">
          <h2>Developers ({{ initiative.developers.length }})</h2>
          <div class="add-dev" *ngIf="availableDevelopers.length > 0">
            <select [(ngModel)]="selectedDevId" [ngModelOptions]="{standalone: true}" class="dev-select">
              <option value="">Add developer...</option>
              <option *ngFor="let d of availableDevelopers" [value]="d.id">{{ d.name }}</option>
            </select>
            <button class="btn-primary btn-sm" (click)="addDeveloper()" [disabled]="!selectedDevId">Add</button>
          </div>
        </div>
        <div class="member-chips">
          <div class="chip" *ngFor="let d of initiative.developers">
            <span class="avatar">{{ initials(d.name) }}</span>
            <span>{{ d.name }}</span>
            <button class="chip-remove" (click)="removeDeveloper(d)" title="Remove">×</button>
          </div>
          <span *ngIf="initiative.developers.length === 0" class="empty-inline">No developers assigned yet.</span>
        </div>
      </div>

      <!-- Task counts -->
      <div class="counts-row">
        <div class="count-chip">Total <strong>{{ initiative.task_counts.total }}</strong></div>
        <div class="count-chip pending">Pending <strong>{{ initiative.task_counts.pending }}</strong></div>
        <div class="count-chip in-progress">In Progress <strong>{{ initiative.task_counts.in_progress }}</strong></div>
        <div class="count-chip completed">Completed <strong>{{ initiative.task_counts.completed }}</strong></div>
        <div class="count-chip blocked">Blocked <strong>{{ initiative.task_counts.blocked }}</strong></div>
      </div>

      <!-- Tasks table -->
      <div *ngIf="tasks.length === 0 && !showTaskForm" class="empty-state">No tasks yet. Click <strong>+ Add Task</strong> to get started.</div>

      <div class="table-wrapper" *ngIf="tasks.length > 0">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Developer</th>
              <th>Status</th>
              <th>Schedule</th>
              <th class="col-actions">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of tasks" [class.row-done]="t.status === 'completed'">
              <td class="col-title">{{ t.title }}<span *ngIf="t.description" class="sub-desc"> — {{ t.description }}</span></td>
              <td>{{ t.developer_name }}</td>
              <td>
                <select class="status-select" [value]="t.status" (change)="quickStatus(t, $any($event.target).value)">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </td>
              <td class="col-schedule">
                <span *ngIf="t.is_recurring" class="badge badge-purple">{{ t.recurrence_pattern }}</span>
                <span *ngIf="!t.is_recurring" class="due-date">{{ t.due_date }}</span>
              </td>
              <td class="col-actions-cell">
                <button class="btn-secondary btn-sm" (click)="editTask(t)">Edit</button>
                <button class="btn-danger btn-sm" (click)="deleteTask(t)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </ng-container>
  `,
  styles: [`
    .breadcrumb { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 1.25rem; }
    .breadcrumb a { color: var(--primary); } .breadcrumb a:hover { text-decoration: underline; }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 1.5rem; gap: 1rem; flex-wrap: wrap; }
    h1 { font-size: 1.75rem; font-weight: 700; }
    .meta { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.4rem; flex-wrap: wrap; }
    .desc { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem; }
    .date-range { font-size: 0.82rem; color: var(--text-muted); }
    .alert-error { background: #fee2e2; color: var(--danger); border: 1px solid #fca5a5; border-radius: var(--radius); padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.9rem; }
    .loading, .empty-state { text-align: center; color: var(--text-muted); padding: 3rem 1rem; }
    .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow); }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.75rem; }
    .panel-header h2 { font-size: 1rem; font-weight: 700; }
    .add-dev { display: flex; gap: 0.5rem; align-items: center; }
    .dev-select { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.35rem 0.6rem; font-size: 0.85rem; background: white; outline: none; }
    .member-chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .chip { display: flex; align-items: center; gap: 0.4rem; background: #e0e7ff; color: #3730a3; border-radius: 20px; padding: 0.3rem 0.75rem 0.3rem 0.5rem; font-size: 0.85rem; font-weight: 600; }
    .avatar { width: 22px; height: 22px; border-radius: 50%; background: #3730a3; color: white; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .chip-remove { background: none; border: none; cursor: pointer; color: #3730a3; font-size: 1rem; padding: 0; line-height: 1; opacity: 0.7; }
    .chip-remove:hover { opacity: 1; }
    .empty-inline { font-size: 0.85rem; color: var(--text-muted); }
    .counts-row { display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; }
    .count-chip { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.4rem 0.85rem; font-size: 0.82rem; color: var(--text-muted); }
    .count-chip strong { color: var(--text); margin-left: 0.3rem; }
    .count-chip.pending strong { color: #64748b; }
    .count-chip.in-progress strong { color: #1d4ed8; }
    .count-chip.completed strong { color: #15803d; }
    .count-chip.blocked strong { color: var(--danger); }
    .table-wrapper { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th { background: #f1f5f9; text-align: left; padding: 0.75rem 1rem; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid var(--border); }
    td { padding: 0.8rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    tr.row-done td { opacity: 0.55; }
    .col-title { font-weight: 600; }
    .sub-desc { font-weight: 400; color: var(--text-muted); font-size: 0.85rem; }
    .col-schedule { white-space: nowrap; }
    .due-date { font-size: 0.85rem; color: var(--text-muted); }
    .col-actions-cell { display: flex; gap: 0.5rem; white-space: nowrap; }
    .status-select { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.25rem 0.5rem; font-size: 0.82rem; background: white; cursor: pointer; }
    .badge { font-size: 0.75rem; border-radius: 20px; padding: 0.2rem 0.6rem; font-weight: 600; display: inline-block; }
    .badge-grey   { background: #f1f5f9; color: #64748b; }
    .badge-blue   { background: #dbeafe; color: #1d4ed8; }
    .badge-green  { background: #dcfce7; color: #15803d; }
    .badge-red    { background: #fee2e2; color: #b91c1c; }
    .badge-purple { background: #ede9fe; color: #6d28d9; }
    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
  `],
})
export class InitiativeDetailComponent implements OnInit {
  initiative: Initiative | null = null;
  tasks: InitiativeTask[] = [];
  allDevelopers: Developer[] = [];
  availableDevelopers: Developer[] = [];
  selectedDevId: number | '' = '';
  loading = true;
  error = '';
  showTaskForm = false;
  editingTask: InitiativeTask | null = null;
  savingTask = false;

  constructor(
    private route: ActivatedRoute,
    private initiativeSvc: InitiativeService,
    private taskSvc: InitiativeTaskService,
    private devSvc: DeveloperService,
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    forkJoin({
      initiative: this.initiativeSvc.getById(id),
      tasks: this.taskSvc.getAll(id),
      developers: this.devSvc.getAll(),
    }).subscribe({
      next: ({ initiative, tasks, developers }) => {
        this.initiative = initiative;
        this.tasks = tasks;
        this.allDevelopers = developers;
        this.refreshAvailable();
        this.loading = false;
      },
      error: () => { this.error = 'Failed to load initiative.'; this.loading = false; },
    });
  }

  refreshAvailable(): void {
    const assigned = new Set(this.initiative!.developers.map(d => d.id));
    this.availableDevelopers = this.allDevelopers.filter(d => !assigned.has(d.id));
  }

  get initiativeStatusClass(): string {
    const m: Record<string, string> = { active: 'badge-blue', completed: 'badge-green', on_hold: 'badge-grey', cancelled: 'badge-red' };
    return m[this.initiative?.status ?? ''] ?? 'badge-grey';
  }

  initials(name: string): string {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  addDeveloper(): void {
    if (!this.selectedDevId) return;
    this.initiativeSvc.assignDeveloper(this.initiative!.id, Number(this.selectedDevId)).subscribe({
      next: () => { this.selectedDevId = ''; this.load(); },
    });
  }

  removeDeveloper(dev: DeveloperSummary): void {
    if (!confirm(`Remove ${dev.name} from this initiative?`)) return;
    this.initiativeSvc.removeDeveloper(this.initiative!.id, dev.id).subscribe({ next: () => this.load() });
  }

  onTaskSaved(payload: InitiativeTaskPayload): void {
    this.savingTask = true;
    const call = this.editingTask
      ? this.taskSvc.update(this.editingTask.id, payload)
      : this.taskSvc.create(payload);
    call.subscribe({
      next: () => { this.savingTask = false; this.showTaskForm = false; this.editingTask = null; this.load(); },
      error: () => { this.savingTask = false; this.error = 'Failed to save task.'; },
    });
  }

  editTask(t: InitiativeTask): void {
    this.editingTask = t;
    this.showTaskForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  quickStatus(t: InitiativeTask, status: string): void {
    this.taskSvc.patchStatus(t.id, status).subscribe({
      next: updated => { t.status = (updated as any).status; this.load(); },
    });
  }

  deleteTask(t: InitiativeTask): void {
    if (!confirm(`Delete task "${t.title}"?`)) return;
    this.taskSvc.delete(t.id).subscribe({ next: () => this.load() });
  }
}
