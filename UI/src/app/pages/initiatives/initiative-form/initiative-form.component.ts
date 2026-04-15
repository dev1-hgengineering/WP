import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Initiative, InitiativePayload, InitiativeStatus } from '../../../shared/models/initiative.model';

@Component({
  selector: 'app-initiative-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
      <h3>{{ initiative ? 'Edit Initiative' : 'New Initiative' }}</h3>

      <div class="field">
        <label>Name <span class="req">*</span></label>
        <input formControlName="name" type="text" placeholder="e.g. Platform Modernisation" />
        <span class="error" *ngIf="f['name'].touched && f['name'].errors?.['required']">Required</span>
      </div>

      <div class="field">
        <label>Description</label>
        <textarea formControlName="description" rows="2" placeholder="What is this initiative about?"></textarea>
      </div>

      <div class="field-row">
        <div class="field">
          <label>Status</label>
          <select formControlName="status">
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
            <option value="cancelled">Cancelled</option>
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

      <div class="field-row" *ngIf="!form.value.is_recurring">
        <div class="field">
          <label>Start Date</label>
          <input formControlName="start_date" type="date" />
        </div>
        <div class="field">
          <label>End Date</label>
          <input formControlName="end_date" type="date" />
        </div>
      </div>

      <div class="field-row" *ngIf="form.value.is_recurring">
        <div class="field">
          <label>Start Date</label>
          <input formControlName="start_date" type="date" />
        </div>
        <div class="field">
          <label>Recurrence Pattern <span class="req">*</span></label>
          <input formControlName="recurrence_pattern" type="text" placeholder="e.g. weekly, daily, monthly" />
          <span class="error" *ngIf="f['recurrence_pattern'].touched && f['recurrence_pattern'].errors?.['required']">Required for recurring</span>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="form.invalid || saving">
          {{ saving ? 'Saving...' : (initiative ? 'Update' : 'Create') }}
        </button>
        <button type="button" class="btn-secondary" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>
  `,
  styles: [`
    .form-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: var(--shadow); }
    h3 { font-size: 1.1rem; margin-bottom: 1.25rem; color: var(--primary); }
    .field { display: flex; flex-direction: column; gap: 0.25rem; margin-bottom: 1rem; }
    .field label { font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
    .field input, .field select, .field textarea { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.5rem 0.75rem; font-size: 0.95rem; font-family: inherit; outline: none; background: white; transition: border-color 0.15s; }
    .field input:focus, .field select:focus, .field textarea:focus { border-color: var(--primary); }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .field-row { grid-template-columns: 1fr; } }
    .toggle-field { justify-content: flex-start; }
    .toggle { position: relative; display: inline-block; width: 44px; height: 24px; margin-top: 4px; }
    .toggle input { opacity: 0; width: 0; height: 0; }
    .slider { position: absolute; cursor: pointer; inset: 0; background: #cbd5e1; border-radius: 24px; transition: .2s; }
    .slider:before { content: ''; position: absolute; width: 18px; height: 18px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: .2s; }
    input:checked + .slider { background: var(--primary); }
    input:checked + .slider:before { transform: translateX(20px); }
    .req { color: var(--danger); }
    .error { font-size: 0.78rem; color: var(--danger); }
    .form-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
  `],
})
export class InitiativeFormComponent implements OnInit {
  @Input() initiative: Initiative | null = null;
  @Input() saving = false;
  @Output() saved = new EventEmitter<InitiativePayload>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.initiative?.name ?? '', Validators.required],
      description: [this.initiative?.description ?? ''],
      status: [this.initiative?.status ?? 'active'],
      is_recurring: [this.initiative?.is_recurring ?? false],
      recurrence_pattern: [this.initiative?.recurrence_pattern ?? ''],
      start_date: [this.initiative?.start_date ?? ''],
      end_date: [this.initiative?.end_date ?? ''],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.saved.emit({
      name: v.name,
      description: v.description || null,
      status: v.status as InitiativeStatus,
      is_recurring: v.is_recurring,
      recurrence_pattern: v.is_recurring ? (v.recurrence_pattern || null) : null,
      start_date: v.start_date || null,
      end_date: v.is_recurring ? null : (v.end_date || null),
    });
  }
}
