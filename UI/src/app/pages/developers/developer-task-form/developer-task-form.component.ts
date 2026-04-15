import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DeveloperTask, DeveloperTaskPayload, TaskStatus } from '../../../shared/models/developer-task.model';

@Component({
  selector: 'app-developer-task-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="task-form">
      <div class="field-row">
        <div class="field grow">
          <input formControlName="title" type="text" placeholder="Task title *" />
          <span class="error" *ngIf="f['title'].touched && f['title'].errors?.['required']">Required</span>
        </div>
        <div class="field">
          <select formControlName="status">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
        <div class="field toggle-field">
          <label class="toggle-label">Recurring</label>
          <label class="toggle">
            <input type="checkbox" formControlName="is_recurring" />
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="field-row">
        <div class="field" *ngIf="!form.value.is_recurring">
          <input formControlName="due_date" type="date" placeholder="Due date *" />
          <span class="error" *ngIf="f['due_date'].touched && f['due_date'].errors?.['required']">Required</span>
        </div>
        <div class="field" *ngIf="form.value.is_recurring">
          <input formControlName="recurrence_pattern" type="text" placeholder="Pattern, e.g. daily *" />
          <span class="error" *ngIf="f['recurrence_pattern'].touched && f['recurrence_pattern'].errors?.['required']">Required</span>
        </div>
        <div class="field grow">
          <input formControlName="description" type="text" placeholder="Description (optional)" />
        </div>
        <div class="field-actions">
          <button type="submit" class="btn-primary btn-sm" [disabled]="form.invalid || saving">{{ saving ? '...' : (task ? 'Update' : 'Add') }}</button>
          <button type="button" class="btn-secondary btn-sm" (click)="cancelled.emit()">Cancel</button>
        </div>
      </div>
    </form>
  `,
  styles: [`
    .task-form { background: #f8fafc; border: 1px dashed var(--border); border-radius: var(--radius); padding: 0.85rem 1rem; margin-bottom: 0.75rem; }
    .field-row { display: flex; gap: 0.5rem; align-items: flex-start; flex-wrap: wrap; margin-bottom: 0.4rem; }
    .field { display: flex; flex-direction: column; gap: 0.2rem; }
    .field.grow { flex: 1; min-width: 140px; }
    .field input, .field select { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.4rem 0.6rem; font-size: 0.85rem; font-family: inherit; outline: none; background: white; }
    .field input:focus, .field select:focus { border-color: var(--primary); }
    .toggle-field { flex-direction: row; align-items: center; gap: 0.4rem; padding-top: 0.3rem; }
    .toggle-label { font-size: 0.8rem; color: var(--text-muted); white-space: nowrap; }
    .toggle { position: relative; display: inline-block; width: 38px; height: 20px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 20px; transition: .2s; }
    .slider:before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .2s; }
    input:checked + .slider { background: var(--primary); }
    input:checked + .slider:before { transform: translateX(18px); }
    .field-actions { display: flex; gap: 0.4rem; align-items: center; padding-top: 0.3rem; }
    .error { font-size: 0.75rem; color: var(--danger); }
    .btn-sm { padding: 0.35rem 0.7rem; font-size: 0.8rem; }
  `],
})
export class DeveloperTaskFormComponent implements OnInit {
  @Input() task: DeveloperTask | null = null;
  @Input() developerId!: number;
  @Input() saving = false;
  @Output() saved = new EventEmitter<DeveloperTaskPayload>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
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
      developer_id: this.developerId,
      title: v.title,
      description: v.description || null,
      status: v.status as TaskStatus,
      is_recurring: v.is_recurring,
      recurrence_pattern: v.is_recurring ? (v.recurrence_pattern || null) : null,
      due_date: v.is_recurring ? null : (v.due_date || null),
    });
  }
}
