import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Achievement, AchievementPayload } from '../../shared/models/achievement.model';
import { AchievementService } from '../../core/services/achievement.service';
import { AchievementFormComponent } from './achievement-form/achievement-form.component';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule, AchievementFormComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Achievements</h1>
        <p class="subtitle">{{ achievements.length }} achievement{{ achievements.length !== 1 ? 's' : '' }} recorded</p>
      </div>
      <div class="header-actions">
        <button class="btn-success" (click)="downloadTxt()">Download .txt</button>
        <button class="btn-primary" (click)="openForm()">+ Add Achievement</button>
      </div>
    </div>

    <div *ngIf="error" class="alert-error">{{ error }}</div>

    <app-achievement-form
      *ngIf="showForm"
      [achievement]="editingAchievement"
      [saving]="saving"
      (saved)="onSaved($event)"
      (cancelled)="closeForm()"
    />

    <div *ngIf="loading" class="loading">Loading...</div>

    <div *ngIf="!loading && achievements.length === 0 && !showForm" class="empty-state">
      <p>No achievements yet. Click <strong>+ Add Achievement</strong> to get started.</p>
    </div>

    <div *ngIf="!loading && achievements.length > 0" class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Team</th>
            <th>Project</th>
            <th>Description</th>
            <th class="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let a of achievements">
            <td class="col-title">{{ a.title }}</td>
            <td class="col-date">{{ a.date }}</td>
            <td>{{ a.team_name }}</td>
            <td>{{ a.project_name }}</td>
            <td class="col-desc">{{ a.description || '—' }}</td>
            <td class="col-actions">
              <button class="btn-secondary btn-sm" (click)="startEdit(a)">Edit</button>
              <button class="btn-danger btn-sm" (click)="confirmDelete(a)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }
    h1 { font-size: 1.75rem; font-weight: 700; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.25rem; }
    .header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .alert-error {
      background: #fee2e2;
      color: var(--danger);
      border: 1px solid #fca5a5;
      border-radius: var(--radius);
      padding: 0.75rem 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .loading, .empty-state {
      text-align: center;
      color: var(--text-muted);
      padding: 3rem 1rem;
    }

    .table-wrapper {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }
    th {
      background: #f1f5f9;
      text-align: left;
      padding: 0.75rem 1rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: .4px;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 0.85rem 1rem;
      border-bottom: 1px solid var(--border);
      vertical-align: top;
    }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }

    .col-title { font-weight: 600; max-width: 220px; }
    .col-date { white-space: nowrap; color: var(--text-muted); }
    .col-desc { max-width: 260px; color: var(--text-muted); font-size: 0.85rem; }
    .col-actions { white-space: nowrap; }
    .col-actions { display: flex; gap: 0.5rem; }

    .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
  `],
})
export class AchievementsComponent implements OnInit {
  achievements: Achievement[] = [];
  loading = true;
  saving = false;
  error = '';
  showForm = false;
  editingAchievement: Achievement | null = null;

  constructor(private svc: AchievementService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = '';
    this.svc.getAll().subscribe({
      next: data => { this.achievements = data; this.loading = false; },
      error: () => { this.error = 'Failed to load achievements.'; this.loading = false; },
    });
  }

  openForm(): void {
    this.editingAchievement = null;
    this.showForm = true;
  }

  startEdit(a: Achievement): void {
    this.editingAchievement = a;
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closeForm(): void {
    this.showForm = false;
    this.editingAchievement = null;
  }

  onSaved(payload: AchievementPayload): void {
    this.saving = true;
    this.error = '';
    const call = this.editingAchievement
      ? this.svc.update(this.editingAchievement.id, payload)
      : this.svc.create(payload);

    call.subscribe({
      next: () => { this.saving = false; this.closeForm(); this.load(); },
      error: () => { this.saving = false; this.error = 'Failed to save achievement.'; },
    });
  }

  confirmDelete(a: Achievement): void {
    if (!confirm(`Delete "${a.title}"?`)) return;
    this.svc.delete(a.id).subscribe({
      next: () => this.load(),
      error: () => { this.error = 'Failed to delete achievement.'; },
    });
  }

  downloadTxt(): void {
    this.svc.downloadTxt();
  }
}
