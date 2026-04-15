import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InitiativeTask, InitiativeTaskPayload, TaskStatus } from '../../../shared/models/initiative-task.model';
import { DeveloperSummary } from '../../../shared/models/initiative.model';

@Component({
  selector: 'app-initiative-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
      <h3>{{ task ? 'Edit Task' : 'Add Task' }}</h3>

      <div class="field-row">
        <div class="field">
          <label>Assigned Developer <span class="req">*</span></label>
          <select formControlName="developer_id">
            <option value="" disabled>Select developer</option>
            <option *ngFor="let d of developers" [value]="d.id">{{ d.name }}</option>
          </select>
          <span class="error" *ngIf="f['developer_id'].touched && f['developer_id'].errors?.['required']">Required</span>
        </div>
        <div class="field">
          <label>Status</label>
          <select formControlName="status">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div class="field toggle-field">
          <label>Recurring?</label>
          <label class="toggle">
            <input type="checkbox" formControlName="is_recurring" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="field">
        <label>Title <span class="req">*</span></label>
        <input formControlName="title" type="text" placeholder="Task description" />
        <span class="error" *ngIf="f['title'].touched && f['title'].errors?.['required']">Required</span>
      </div>

      <div class="field-row">
        <div class="field" *ngIf="!form.value.is_recurring">
          <label>Due Date <span class="req">*</span></label>
          <input formControlName="due_date" type="date" />
          <span class="error" *ngIf="f['due_date'].touched && f['due_date'].errors?.['required']">Required for one-off tasks</span>
        </div>
        <div class="field" *ngIf="form.value.is_recurring">
          <label>Recurrence Pattern <span class="req">*</span></label>
          <input formControlName="recurrence_pattern" type="text" placeholder="e.g. daily, weekly" />
          <span class="error" *ngIf="f['recurrence_pattern'].touched && f['recurrence_pattern'].errors?.['required']">Required for recurring tasks</span>
        </div>
        <div class="field">
          <label>Description</label>
          <input formControlName="description" type="text" placeholder="Optional details" />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="form.invalid || saving">
          {{ saving ? 'Saving...' : (task ? 'Update' : 'Add Task') }}
        </button>
        <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow); }
    h3 { font-size: 1.05rem; margin-bottom: 1rem; color: var(--primary); }
    .field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
    .field label { font-size: 0.82rem; font-weight: 600; color: var(--text-muted); }
    .field input, .field select { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.45rem 0.7rem; font-size: 0.9rem; font-family: inherit; outline: none; background: white; transition: border-color 0.15s; }
    .field input:focus, .field select:focus { border-color: var(--primary); }
    .field-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
    @media (max-width: 640px) { .field-row { grid-template-columns: 1fr; } }
    .toggle-field { justify-content: flex-start; }
    .toggle { position: relative; display: inline-block; width: 44px; height: 24px; margin-top: 4px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 24px; transition: .2s; }
    .slider:before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .2s; }
    input:checked + .slider { background: var(--primary); }
    input:checked + .slider:before { transform: translateX(20px); }
    .req { color: var(--danger); }
    .error { font-size: 0.78rem; color: var(--danger); }
    .form-actions { display: flex; gap: 0.75rem; }
  `],
})
export class InitiativeTaskFormComponent implements OnInit {
  @Input() task: InitiativeTask | null = null;
  @Input() initiativeId!: number;
  @Input() developers: DeveloperSummary[] = [];
  @Input() saving = false;
  @Output() saved = new EventEmitter<InitiativeTaskPayload>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      developer_id: [this.task?.developer_id ?? '', Validators.required],
      title: [this.task?.title ?? '', Validators.required],
      description: [this.task?.description ?? ''],
      status: [this.task?.status ?? 'pending'],
      is_recurring: [this.task?.is_recurring ?? false],
      recurrence_pattern: [this.task?.recurrence_pattern ?? ''],
      due_date: [this.task?.due_date ?? ''],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.saved.emit({
      initiative_id: this.initiativeId,
      developer_id: Number(v.developer_id),
      title: v.title,
      description: v.description || null,
      status: v.status as TaskStatus,
      is_recurring: v.is_recurring,
      recurrence_pattern: v.is_recurring ? (v.recurrence_pattern || null) : null,
      due_date: v.is_recurring ? null : (v.due_date || null),
    });
  }
}
