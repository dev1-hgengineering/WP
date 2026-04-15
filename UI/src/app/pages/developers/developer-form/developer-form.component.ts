import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Developer, DeveloperPayload } from '../../../shared/models/developer.model';

@Component({
  selector: 'app-developer-form',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="submit()" class="form-card">
      <h3>{{ developer ? 'Edit Developer' : 'Add Developer' }}</h3>

      <div class="field-row">
        <div class="field">
          <label>Name <span class="required">*</span></label>
          <input formControlName="name" type="text" placeholder="Full name" />
          <span class="error" *ngIf="f['name'].touched && f['name'].errors?.['required']">Name is required</span>
        </div>
        <div class="field">
          <label>Email</label>
          <input formControlName="email" type="email" placeholder="email@example.com" />
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-primary" [disabled]="form.invalid || saving">
          {{ saving ? 'Saving...' : (developer ? 'Update' : 'Add') }}
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
    .field input { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.5rem 0.75rem; font-size: 0.95rem; font-family: inherit; outline: none; transition: border-color 0.15s; }
    .field input:focus { border-color: var(--primary); }
    .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .field-row { grid-template-columns: 1fr; } }
    .required { color: var(--danger); }
    .error { font-size: 0.78rem; color: var(--danger); }
    .form-actions { display: flex; gap: 0.75rem; }
  `],
})
export class DeveloperFormComponent implements OnInit {
  @Input() developer: Developer | null = null;
  @Input() saving = false;
  @Output() saved = new EventEmitter<DeveloperPayload>();
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [this.developer?.name ?? '', Validators.required],
      email: [this.developer?.email ?? ''],
    });
  }

  get f() { return this.form.controls; }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    this.saved.emit({ name: v.name, email: v.email || null });
  }
}
