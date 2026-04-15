import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Initiative, InitiativePayload } from '../../shared/models/initiative.model';
import { InitiativeService } from '../../core/services/initiative.service';
import { InitiativeFormComponent } from './initiative-form/initiative-form.component';

const STATUS_CLASS: Record<string, string> = {
  active: 'badge-blue', completed: 'badge-green', on_hold: 'badge-grey', cancelled: 'badge-red',
};

@Component({
  selector: 'app-initiatives',
  standalone: true,
  imports: [CommonModule, RouterLink, InitiativeFormComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Initiatives</h1>
        <p class="subtitle">{{ initiatives.length }} initiative{{ initiatives.length !== 1 ? 's' : '' }}</p>
      </div>
      <button class="btn-primary" (click)="openForm()">+ New Initiative</button>
    </div>

    <div *ngIf="error" class="alert-error">{{ error }}</div>

    <app-initiative-form
      *ngIf="showForm"
      [initiative]="editing"
      [saving]="saving"
      (saved)="onSaved($event)"
      (cancelled)="closeForm()"
    />

    <div *ngIf="loading" class="loading">Loading...</div>
    <div *ngIf="!loading && initiatives.length === 0 && !showForm" class="empty-state">
      No initiatives yet. Create one to start tracking work.
    </div>

    <div class="grid" *ngIf="!loading && initiatives.length > 0">
      <div class="card" *ngFor="let i of initiatives">
        <div class="card-top">
          <div class="card-info">
            <div class="card-name">
              <a [routerLink]="['/initiatives', i.id]">{{ i.name }}</a>
              <span class="badge" [ngClass]="statusClass(i.status)">{{ i.status | titlecase }}</span>
              <span *ngIf="i.is_recurring" class="badge badge-purple">{{ i.recurrence_pattern }}</span>
            </div>
            <p class="card-desc" *ngIf="i.description">{{ i.description }}</p>
            <p class="card-dates" *ngIf="!i.is_recurring && (i.start_date || i.end_date)">
              {{ i.start_date || '?' }} → {{ i.end_date || 'ongoing' }}
            </p>
          </div>
          <div class="card-actions">
            <button class="btn-secondary btn-sm" (click)="startEdit(i)">Edit</button>
            <button class="btn-danger btn-sm" (click)="confirmDelete(i)">Delete</button>
          </div>
        </div>

        <div class="card-footer">
          <div class="dev-stack">
            <span class="dev-avatar" *ngFor="let d of i.developers.slice(0,5)" [title]="d.name">{{ initials(d.name) }}</span>
            <span *ngIf="i.developers.length > 5" class="dev-more">+{{ i.developers.length - 5 }}</span>
            <span *ngIf="i.developers.length === 0" class="no-devs">No developers</span>
          </div>
          <div class="task-pills">
            <span class="pill pending" *ngIf="i.task_counts.pending">{{ i.task_counts.pending }} pending</span>
            <span class="pill in-prog" *ngIf="i.task_counts.in_progress">{{ i.task_counts.in_progress }} in progress</span>
            <span class="pill done"    *ngIf="i.task_counts.completed">{{ i.task_counts.completed }} done</span>
            <span class="pill blocked" *ngIf="i.task_counts.blocked">{{ i.task_counts.blocked }} blocked</span>
            <span class="no-tasks" *ngIf="i.task_counts.total === 0">No tasks</span>
          </div>
          <a [routerLink]="['/initiatives', i.id]" class="view-link">View →</a>
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
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); display: flex; flex-direction: column; }
    .card-top { padding: 1.25rem 1.5rem; display: flex; gap: 1rem; justify-content: space-between; align-items: flex-start; }
    .card-info { flex: 1; min-width: 0; }
    .card-name { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
    .card-name a { font-size: 1.05rem; font-weight: 700; color: var(--primary); }
    .card-name a:hover { text-decoration: underline; }
    .card-desc { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem; }
    .card-dates { font-size: 0.8rem; color: var(--text-muted); }
    .card-actions { display: flex; gap: 0.4rem; flex-shrink: 0; }
    .card-footer { border-top: 1px solid var(--border); padding: 0.85rem 1.5rem; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; background: #f8fafc; border-radius: 0 0 var(--radius) var(--radius); }
    .dev-stack { display: flex; align-items: center; gap: 0; }
    .dev-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; font-size: 0.7rem; font-weight: 700; display: flex; align-items: center; justify-content: center; border: 2px solid white; margin-left: -6px; }
    .dev-avatar:first-child { margin-left: 0; }
    .dev-more { font-size: 0.78rem; color: var(--text-muted); margin-left: 4px; }
    .no-devs { font-size: 0.78rem; color: var(--text-muted); }
    .task-pills { display: flex; gap: 0.35rem; flex-wrap: wrap; flex: 1; }
    .pill { font-size: 0.72rem; border-radius: 20px; padding: 0.15rem 0.55rem; font-weight: 600; }
    .pill.pending  { background: #f1f5f9; color: #64748b; }
    .pill.in-prog  { background: #dbeafe; color: #1d4ed8; }
    .pill.done     { background: #dcfce7; color: #15803d; }
    .pill.blocked  { background: #fee2e2; color: #b91c1c; }
    .no-tasks { font-size: 0.78rem; color: var(--text-muted); }
    .view-link { font-size: 0.82rem; color: var(--primary); font-weight: 600; white-space: nowrap; margin-left: auto; }
    .view-link:hover { text-decoration: underline; }
    .badge { font-size: 0.72rem; border-radius: 20px; padding: 0.15rem 0.55rem; font-weight: 600; }
    .badge-blue   { background: #dbeafe; color: #1d4ed8; }
    .badge-green  { background: #dcfce7; color: #15803d; }
    .badge-red    { background: #fee2e2; color: #b91c1c; }
    .badge-grey   { background: #f1f5f9; color: #64748b; }
    .badge-purple { background: #ede9fe; color: #6d28d9; }
    .btn-sm { padding: 0.35rem 0.7rem; font-size: 0.78rem; }
  `],
})
export class InitiativesComponent implements OnInit {
  initiatives: Initiative[] = [];
  loading = true;
  saving = false;
  error = '';
  showForm = false;
  editing: Initiative | null = null;

  constructor(private svc: InitiativeService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.svc.getAll().subscribe({
      next: data => { this.initiatives = data; this.loading = false; },
      error: () => { this.error = 'Failed to load initiatives.'; this.loading = false; },
    });
  }

  statusClass(s: string): string { return STATUS_CLASS[s] ?? 'badge-grey'; }
  initials(name: string): string { return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2); }
  openForm(): void { this.editing = null; this.showForm = true; }
  startEdit(i: Initiative): void { this.editing = i; this.showForm = true; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  closeForm(): void { this.showForm = false; this.editing = null; }

  onSaved(payload: InitiativePayload): void {
    this.saving = true;
    const call = this.editing ? this.svc.update(this.editing.id, payload) : this.svc.create(payload);
    call.subscribe({
      next: () => { this.saving = false; this.closeForm(); this.load(); },
      error: () => { this.saving = false; this.error = 'Failed to save initiative.'; },
    });
  }

  confirmDelete(i: Initiative): void {
    if (!confirm(`Delete initiative "${i.name}"? All its tasks will also be removed.`)) return;
    this.svc.delete(i.id).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to delete initiative.'; },
    });
  }
}
