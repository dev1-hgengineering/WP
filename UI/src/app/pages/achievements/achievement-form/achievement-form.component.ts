import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Achievement, AchievementPayload } from '../../../shared/models/achievement.model';

@Component({
  selector: 'app-achievement-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
      <h3>{{ achievement ? 'Edit Achievement' : 'Add Achievement' }}</h3>

      <div class="field">
        <label>Title <span class="required">*</span></label>
        <input formControlName="title" type="text" placeholder="What did you accomplish?" />
        <span class="error" *ngIf="f['title'].touched && f['title'].errors?.['required']">Title is required</span>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Date <span class="required">*</span></label>
          <input formControlName="date" type="date" />
          <span class="error" *ngIf="f['date'].touched && f['date'].errors?.['required']">Date is required</span>
        </div>
        <div class="field">
          <label>Team Name <span class="required">*</span></label>
          <input formControlName="team_name" type="text" placeholder="e.g. Platform" />
          <span class="error" *ngIf="f['team_name'].touched && f['team_name'].errors?.['required']">Team is required</span>
        </div>
        <div class="field">
          <label>Project Name <span class="required">*</span></label>
          <input formControlName="project_name" type="text" placeholder="e.g. Project Alpha" />
          <span class="error" *ngIf="f['project_name'].touched && f['project_name'].errors?.['required']">Project is required</span>
        </div>
      </div>

      <div class="field">
        <label>Description</label>
        <textarea formControlName="description" rows="4" placeholder="Describe the achievement in more detail..."></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="form.invalid || saving">
          {{ saving ? 'Saving...' : (achievement ? 'Update' : 'Add') }}
        </button>
        <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .form-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
    }
    h3 { font-size: 1.1rem; margin-bottom: 1.25rem; color: var(--primary); }
    .field { display: flex; flex-direction: column; gap: 0.25rem; }
    .field label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .field input, .field textarea {
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 0.5rem 0.75rem;
      font-size: 0.95rem;
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s;
    }
    .field input:focus, .field textarea:focus { border-color: var(--primary); }
    .field textarea { resize: vertical; }
    .field-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    @media (max-width: 640px) { .field-row { grid-template-columns: 1fr; } }
    .required { color: var(--danger); }
    .error { font-size: 0.78rem; color: var(--danger); }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .form-card > .field, .form-card > .field-row { margin-bottom: 1rem; }
  `],
})
export class AchievementFormComponent implements OnInit {
  @Input() achievement: Achievement | null = null;
  @Input() saving = false;
  @Output() saved = new EventEmitter<AchievementPayload>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: [this.achievement?.title ?? '', Validators.required],
      date: [this.achievement?.date ?? '', Validators.required],
      team_name: [this.achievement?.team_name ?? '', Validators.required],
      project_name: [this.achievement?.project_name ?? '', Validators.required],
      description: [this.achievement?.description ?? ''],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;
    this.saved.emit({
      ...value,
      description: value.description || null,
    });
  }
}
