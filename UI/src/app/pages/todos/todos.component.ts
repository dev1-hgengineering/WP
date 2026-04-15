import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  RecurringTodo, RecurringTodoPayload,
  TimelineTodo, TimelineTodoPayload,
  DailyList,
} from '../../shared/models/todo.model';
import { TodoService } from '../../core/services/todo.service';

type Tab = 'recurring' | 'timeline' | 'daily';

const PRIORITY_CLASS: Record<string, string> = { low: 'pri-low', medium: 'pri-med', high: 'pri-high' };
const STATUS_CLASS:   Record<string, string> = { pending: 'badge-grey', in_progress: 'badge-blue', completed: 'badge-green' };
const STATUS_LABEL:   Record<string, string> = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' };

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <!-- Tabs -->
    <div class="page-header">
      <h1>My Todo Lists</h1>
    </div>
    <div class="tabs">
      <button [class.active]="tab === 'recurring'" (click)="setTab('recurring')">Recurring</button>
      <button [class.active]="tab === 'timeline'"  (click)="setTab('timeline')">Timeline</button>
      <button [class.active]="tab === 'daily'"     (click)="setTab('daily')">Daily</button>
    </div>

    <div *ngIf="error" class="alert-error">{{ error }}</div>

    <!-- ═══════════════ RECURRING TAB ═══════════════ -->
    <div *ngIf="tab === 'recurring'">
      <div class="section-header">
        <span class="section-count">{{ active.length }} active · {{ paused.length }} paused</span>
        <button class="btn-primary btn-sm" (click)="openRecurringForm()">+ Add</button>
      </div>

      <!-- Form -->
      <form *ngIf="showRecurringForm" [formGroup]="recurringForm" (ngSubmit)="saveRecurring()" class="inline-form">
        <div class="form-row">
          <input formControlName="title" type="text" placeholder="Task title *" class="grow" />
          <input formControlName="recurrence_pattern" type="text" placeholder="Pattern, e.g. daily, weekly *" />
          <button type="submit" class="btn-primary btn-sm" [disabled]="recurringForm.invalid || saving">
            {{ saving ? '...' : (editingRecurring ? 'Update' : 'Add') }}
          </button>
          <button type="button" class="btn-secondary btn-sm" (click)="cancelRecurringForm()">Cancel</button>
        </div>
        <div class="form-row">
          <input formControlName="description" type="text" placeholder="Description (optional)" class="grow" />
        </div>
      </form>

      <div *ngIf="!recurringTodos.length && !showRecurringForm" class="empty-state">No recurring todos yet.</div>

      <div class="todo-list" *ngIf="recurringTodos.length">
        <div *ngIf="active.length" class="group-label">Active</div>
        <div class="todo-row" *ngFor="let t of active">
          <span class="recur-badge">{{ t.recurrence_pattern }}</span>
          <span class="todo-title">{{ t.title }}</span>
          <span *ngIf="t.description" class="todo-desc">{{ t.description }}</span>
          <div class="todo-actions">
            <button class="btn-secondary btn-xs" (click)="startEditRecurring(t)">Edit</button>
            <button class="btn-secondary btn-xs" (click)="toggleRecurring(t)">Pause</button>
            <button class="btn-danger btn-xs" (click)="deleteRecurring(t)">Delete</button>
          </div>
        </div>

        <div *ngIf="paused.length" class="group-label paused">Paused</div>
        <div class="todo-row paused-row" *ngFor="let t of paused">
          <span class="recur-badge muted">{{ t.recurrence_pattern }}</span>
          <span class="todo-title muted">{{ t.title }}</span>
          <div class="todo-actions">
            <button class="btn-secondary btn-xs" (click)="startEditRecurring(t)">Edit</button>
            <button class="btn-primary btn-xs" (click)="toggleRecurring(t)">Resume</button>
            <button class="btn-danger btn-xs" (click)="deleteRecurring(t)">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════ TIMELINE TAB ═══════════════ -->
    <div *ngIf="tab === 'timeline'">
      <div class="section-header">
        <div class="filter-pills">
          <button [class.pill-active]="timelineFilter === ''"           (click)="setTimelineFilter('')">All</button>
          <button [class.pill-active]="timelineFilter === 'pending'"    (click)="setTimelineFilter('pending')">Pending</button>
          <button [class.pill-active]="timelineFilter === 'in_progress'"(click)="setTimelineFilter('in_progress')">In Progress</button>
          <button [class.pill-active]="timelineFilter === 'completed'"  (click)="setTimelineFilter('completed')">Done</button>
        </div>
        <button class="btn-primary btn-sm" (click)="openTimelineForm()">+ Add</button>
      </div>

      <!-- Form -->
      <form *ngIf="showTimelineForm" [formGroup]="timelineForm" (ngSubmit)="saveTimeline()" class="inline-form">
        <div class="form-row">
          <input formControlName="title" type="text" placeholder="Task title *" class="grow" />
          <input formControlName="due_date" type="date" />
          <select formControlName="priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select formControlName="status">
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <button type="submit" class="btn-primary btn-sm" [disabled]="timelineForm.invalid || saving">
            {{ saving ? '...' : (editingTimeline ? 'Update' : 'Add') }}
          </button>
          <button type="button" class="btn-secondary btn-sm" (click)="cancelTimelineForm()">Cancel</button>
        </div>
        <div class="form-row">
          <input formControlName="description" type="text" placeholder="Description (optional)" class="grow" />
        </div>
      </form>

      <div *ngIf="!filteredTimeline.length && !showTimelineForm" class="empty-state">No timeline todos.</div>

      <div class="table-wrapper" *ngIf="filteredTimeline.length">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Due</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filteredTimeline" [class.row-overdue]="isOverdue(t)" [class.row-done]="t.status === 'completed'">
              <td class="col-title">
                {{ t.title }}
                <span *ngIf="t.description" class="sub-desc"> — {{ t.description }}</span>
              </td>
              <td class="col-date" [class.overdue-text]="isOverdue(t)">
                {{ t.due_date }}
                <span *ngIf="isToday(t.due_date)" class="today-badge">Today</span>
                <span *ngIf="isOverdue(t)" class="overdue-badge">Overdue</span>
              </td>
              <td><span class="priority-dot" [ngClass]="priorityClass(t.priority)">{{ t.priority }}</span></td>
              <td>
                <select class="status-sel" [value]="t.status" (change)="quickTimelineStatus(t, $any($event.target).value)">
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </td>
              <td class="col-actions-cell">
                <button class="btn-secondary btn-xs" (click)="startEditTimeline(t)">Edit</button>
                <button class="btn-danger btn-xs" (click)="deleteTimeline(t)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ═══════════════ DAILY TAB ═══════════════ -->
    <div *ngIf="tab === 'daily'">
      <div class="daily-date-bar">
        <button class="btn-secondary btn-sm" (click)="shiftDay(-1)">‹ Prev</button>
        <input type="date" [(ngModel)]="selectedDate" (change)="loadDaily()" class="date-input" />
        <button class="btn-secondary btn-sm" (click)="shiftDay(1)">Next ›</button>
        <button class="btn-secondary btn-sm" (click)="goToday()">Today</button>
      </div>

      <div *ngIf="loadingDaily" class="loading">Loading...</div>

      <!-- No list for this date -->
      <div *ngIf="!loadingDaily && !dailyList" class="empty-day">
        <p>No list for <strong>{{ selectedDate }}</strong>.</p>
        <button class="btn-primary" (click)="createDaily()">Create List for This Day</button>
      </div>

      <!-- Daily list exists -->
      <div *ngIf="!loadingDaily && dailyList" class="daily-card">
        <div class="daily-header">
          <h2>{{ selectedDate }}</h2>
          <span class="daily-progress">{{ doneCount }}/{{ dailyList.tasks.length }} done</span>
        </div>

        <div class="task-list-daily">
          <label class="task-check-row" *ngFor="let t of dailyList.tasks" [class.done]="t.is_done">
            <input type="checkbox" [checked]="t.is_done" (change)="toggleDailyTask(t)" />
            <span class="check-title">{{ t.title }}</span>
            <button class="del-btn" (click)="deleteDailyTask(t)">×</button>
          </label>
          <div *ngIf="!dailyList.tasks.length" class="no-tasks-daily">No tasks yet — add one below.</div>
        </div>

        <form class="add-task-bar" (ngSubmit)="addDailyTask()" #dailyTaskForm="ngForm">
          <input
            [(ngModel)]="newTaskTitle"
            name="newTask"
            type="text"
            placeholder="Add a task and press Enter..."
            class="task-input"
            required
          />
          <button type="submit" class="btn-primary btn-sm" [disabled]="!newTaskTitle.trim()">Add</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; font-weight: 700; }

    /* Tabs */
    .tabs { display: flex; gap: 0; margin-bottom: 1.5rem; border-bottom: 2px solid var(--border); }
    .tabs button { background: none; border: none; border-radius: 0; padding: 0.6rem 1.5rem; font-size: 0.95rem; font-weight: 600; color: var(--text-muted); cursor: pointer; border-bottom: 3px solid transparent; margin-bottom: -2px; transition: color 0.15s, border-color 0.15s; }
    .tabs button.active { color: var(--primary); border-bottom-color: var(--primary); }
    .tabs button:hover:not(.active) { color: var(--text); }

    /* Section header */
    .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem; }
    .section-count { font-size: 0.85rem; color: var(--text-muted); }

    /* Inline form */
    .inline-form { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem; margin-bottom: 1.25rem; box-shadow: var(--shadow); }
    .form-row { display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .form-row:last-child { margin-bottom: 0; }
    .form-row input, .form-row select { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.4rem 0.6rem; font-size: 0.88rem; font-family: inherit; outline: none; background: white; }
    .form-row input:focus, .form-row select:focus { border-color: var(--primary); }
    .form-row .grow { flex: 1; min-width: 160px; }

    /* Todo list (recurring) */
    .todo-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .group-label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; margin: 0.75rem 0 0.25rem; }
    .group-label.paused { color: #94a3b8; }
    .todo-row { display: flex; align-items: center; gap: 0.75rem; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 0.6rem 1rem; flex-wrap: wrap; }
    .paused-row { opacity: 0.6; }
    .recur-badge { font-size: 0.72rem; background: #ede9fe; color: #6d28d9; border-radius: 20px; padding: 0.15rem 0.55rem; font-weight: 600; white-space: nowrap; }
    .recur-badge.muted { background: #f1f5f9; color: #94a3b8; }
    .todo-title { flex: 1; font-weight: 600; font-size: 0.9rem; }
    .todo-title.muted { color: var(--text-muted); }
    .todo-desc { font-size: 0.82rem; color: var(--text-muted); }
    .todo-actions { display: flex; gap: 0.35rem; margin-left: auto; }

    /* Filter pills */
    .filter-pills { display: flex; gap: 0.35rem; }
    .filter-pills button { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 0.25rem 0.75rem; font-size: 0.8rem; cursor: pointer; color: var(--text-muted); transition: all 0.15s; }
    .filter-pills button.pill-active { background: var(--primary); color: white; border-color: var(--primary); }

    /* Timeline table */
    .table-wrapper { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
    th { background: #f1f5f9; text-align: left; padding: 0.65rem 1rem; font-size: 0.78rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .4px; border-bottom: 1px solid var(--border); }
    td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: #f8fafc; }
    tr.row-overdue td { background: #fff7f7; }
    tr.row-done { opacity: 0.5; }
    .col-title { font-weight: 600; }
    .sub-desc { font-weight: 400; color: var(--text-muted); font-size: 0.83rem; }
    .col-date { white-space: nowrap; font-size: 0.85rem; }
    .overdue-text { color: var(--danger); font-weight: 600; }
    .today-badge { font-size: 0.7rem; background: #fef3c7; color: #92400e; border-radius: 20px; padding: 0.1rem 0.45rem; font-weight: 700; margin-left: 0.3rem; }
    .overdue-badge { font-size: 0.7rem; background: #fee2e2; color: #b91c1c; border-radius: 20px; padding: 0.1rem 0.45rem; font-weight: 700; margin-left: 0.3rem; }
    .priority-dot { font-size: 0.78rem; border-radius: 20px; padding: 0.15rem 0.55rem; font-weight: 600; }
    .pri-low  { background: #f1f5f9; color: #64748b; }
    .pri-med  { background: #fef3c7; color: #92400e; }
    .pri-high { background: #fee2e2; color: #b91c1c; }
    .status-sel { border: 1px solid var(--border); border-radius: calc(var(--radius) - 2px); padding: 0.2rem 0.4rem; font-size: 0.78rem; background: white; cursor: pointer; }
    .col-actions-cell { display: flex; gap: 0.35rem; white-space: nowrap; }

    /* Daily */
    .daily-date-bar { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
    .date-input { border: 1px solid var(--border); border-radius: var(--radius); padding: 0.4rem 0.6rem; font-size: 0.9rem; font-family: inherit; outline: none; }
    .date-input:focus { border-color: var(--primary); }
    .empty-day { text-align: center; padding: 3rem 1rem; }
    .empty-day p { color: var(--text-muted); margin-bottom: 1rem; }
    .daily-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); overflow: hidden; }
    .daily-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid var(--border); background: #f8fafc; }
    .daily-header h2 { font-size: 1.1rem; font-weight: 700; }
    .daily-progress { font-size: 0.85rem; color: var(--text-muted); font-weight: 600; }
    .task-list-daily { padding: 0.5rem 0; }
    .task-check-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1.5rem; cursor: pointer; transition: background 0.1s; }
    .task-check-row:hover { background: #f8fafc; }
    .task-check-row input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary); flex-shrink: 0; }
    .check-title { flex: 1; font-size: 0.92rem; }
    .task-check-row.done .check-title { text-decoration: line-through; color: var(--text-muted); }
    .del-btn { background: none; border: none; cursor: pointer; color: #cbd5e1; font-size: 1.1rem; line-height: 1; padding: 0; margin-left: auto; }
    .del-btn:hover { color: var(--danger); }
    .no-tasks-daily { padding: 1.5rem 1.5rem; font-size: 0.85rem; color: var(--text-muted); }
    .add-task-bar { display: flex; gap: 0.5rem; padding: 0.85rem 1.5rem; border-top: 1px solid var(--border); background: #f8fafc; }
    .task-input { flex: 1; border: 1px solid var(--border); border-radius: var(--radius); padding: 0.45rem 0.75rem; font-size: 0.9rem; font-family: inherit; outline: none; }
    .task-input:focus { border-color: var(--primary); }

    /* Shared */
    .alert-error { background: #fee2e2; color: var(--danger); border: 1px solid #fca5a5; border-radius: var(--radius); padding: 0.75rem 1rem; margin-bottom: 1rem; font-size: 0.9rem; }
    .loading, .empty-state { text-align: center; color: var(--text-muted); padding: 3rem 1rem; }
    .btn-sm  { padding: 0.35rem 0.75rem; font-size: 0.8rem; }
    .btn-xs  { padding: 0.25rem 0.6rem; font-size: 0.75rem; }
  `],
})
export class TodosComponent implements OnInit {
  tab: Tab = 'recurring';
  error = '';
  saving = false;

  // Recurring
  recurringTodos: RecurringTodo[] = [];
  showRecurringForm = false;
  editingRecurring: RecurringTodo | null = null;
  recurringForm!: FormGroup;

  // Timeline
  timelineTodos: TimelineTodo[] = [];
  timelineFilter = '';
  showTimelineForm = false;
  editingTimeline: TimelineTodo | null = null;
  timelineForm!: FormGroup;

  // Daily
  selectedDate = '';
  dailyList: DailyList | null = null;
  loadingDaily = false;
  newTaskTitle = '';

  constructor(private svc: TodoService, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.selectedDate = this.toDateStr(new Date());
    this.buildForms();
    this.loadRecurring();
  }

  private toDateStr(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  private buildForms(): void {
    this.recurringForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      recurrence_pattern: ['', Validators.required],
      is_active: [true],
    });
    this.timelineForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      due_date: ['', Validators.required],
      priority: ['medium'],
      status: ['pending'],
    });
  }

  setTab(t: Tab): void {
    this.tab = t;
    this.error = '';
    if (t === 'recurring' && !this.recurringTodos.length) this.loadRecurring();
    if (t === 'timeline'  && !this.timelineTodos.length)  this.loadTimeline();
    if (t === 'daily') this.loadDaily();
  }

  // ── Recurring ──────────────────────────────

  get active() { return this.recurringTodos.filter(t => t.is_active); }
  get paused() { return this.recurringTodos.filter(t => !t.is_active); }

  loadRecurring(): void {
    this.svc.getRecurring().subscribe({ next: d => this.recurringTodos = d, error: () => this.error = 'Failed to load.' });
  }

  openRecurringForm(): void {
    this.editingRecurring = null;
    this.recurringForm.reset({ is_active: true });
    this.showRecurringForm = true;
  }

  startEditRecurring(t: RecurringTodo): void {
    this.editingRecurring = t;
    this.recurringForm.patchValue(t);
    this.showRecurringForm = true;
  }

  cancelRecurringForm(): void { this.showRecurringForm = false; this.editingRecurring = null; }

  saveRecurring(): void {
    if (this.recurringForm.invalid) return;
    this.saving = true;
    const v = this.recurringForm.value;
    const payload: RecurringTodoPayload = { title: v.title, description: v.description || null, recurrence_pattern: v.recurrence_pattern, is_active: v.is_active };
    const call = this.editingRecurring
      ? this.svc.updateRecurring(this.editingRecurring.id, payload)
      : this.svc.createRecurring(payload);
    call.subscribe({ next: () => { this.saving = false; this.cancelRecurringForm(); this.loadRecurring(); }, error: () => { this.saving = false; this.error = 'Failed to save.'; } });
  }

  toggleRecurring(t: RecurringTodo): void {
    this.svc.toggleRecurring(t.id).subscribe({ next: () => this.loadRecurring() });
  }

  deleteRecurring(t: RecurringTodo): void {
    if (!confirm(`Delete "${t.title}"?`)) return;
    this.svc.deleteRecurring(t.id).subscribe({ next: () => this.loadRecurring() });
  }

  // ── Timeline ──────────────────────────────

  get filteredTimeline(): TimelineTodo[] {
    if (!this.timelineFilter) return this.timelineTodos;
    return this.timelineTodos.filter(t => t.status === this.timelineFilter);
  }

  loadTimeline(): void {
    this.svc.getTimeline().subscribe({ next: d => this.timelineTodos = d, error: () => this.error = 'Failed to load.' });
  }

  setTimelineFilter(f: string): void { this.timelineFilter = f; }

  openTimelineForm(): void {
    this.editingTimeline = null;
    this.timelineForm.reset({ priority: 'medium', status: 'pending' });
    this.showTimelineForm = true;
  }

  startEditTimeline(t: TimelineTodo): void {
    this.editingTimeline = t;
    this.timelineForm.patchValue(t);
    this.showTimelineForm = true;
  }

  cancelTimelineForm(): void { this.showTimelineForm = false; this.editingTimeline = null; }

  saveTimeline(): void {
    if (this.timelineForm.invalid) return;
    this.saving = true;
    const v = this.timelineForm.value;
    const payload: TimelineTodoPayload = { title: v.title, description: v.description || null, due_date: v.due_date, priority: v.priority, status: v.status };
    const call = this.editingTimeline
      ? this.svc.updateTimeline(this.editingTimeline.id, payload)
      : this.svc.createTimeline(payload);
    call.subscribe({ next: () => { this.saving = false; this.cancelTimelineForm(); this.loadTimeline(); }, error: () => { this.saving = false; this.error = 'Failed to save.'; } });
  }

  quickTimelineStatus(t: TimelineTodo, status: string): void {
    this.svc.patchTimelineStatus(t.id, status).subscribe({ next: () => this.loadTimeline() });
  }

  deleteTimeline(t: TimelineTodo): void {
    if (!confirm(`Delete "${t.title}"?`)) return;
    this.svc.deleteTimeline(t.id).subscribe({ next: () => this.loadTimeline() });
  }

  isOverdue(t: TimelineTodo): boolean {
    return t.status !== 'completed' && t.due_date < this.toDateStr(new Date());
  }

  isToday(d: string): boolean { return d === this.toDateStr(new Date()); }
  priorityClass(p: string): string { return PRIORITY_CLASS[p] ?? 'pri-med'; }

  // ── Daily ──────────────────────────────

  get doneCount(): number { return this.dailyList?.tasks.filter(t => t.is_done).length ?? 0; }

  loadDaily(): void {
    this.loadingDaily = true;
    this.dailyList = null;
    this.svc.getDailyByDate(this.selectedDate).subscribe({
      next: list => { this.dailyList = list; this.loadingDaily = false; },
      error: () => { this.loadingDaily = false; },
    });
  }

  createDaily(): void {
    this.svc.createDailyList(this.selectedDate).subscribe({ next: list => { this.dailyList = list; } });
  }

  addDailyTask(): void {
    if (!this.newTaskTitle.trim() || !this.dailyList) return;
    const order = this.dailyList.tasks.length;
    this.svc.addDailyTask(this.dailyList.id, this.newTaskTitle.trim(), order).subscribe({
      next: task => { this.dailyList!.tasks.push(task); this.newTaskTitle = ''; },
    });
  }

  toggleDailyTask(t: any): void {
    this.svc.toggleDailyTask(t.id).subscribe({ next: updated => { t.is_done = (updated as any).is_done; } });
  }

  deleteDailyTask(t: any): void {
    this.svc.deleteDailyTask(t.id).subscribe({
      next: () => { this.dailyList!.tasks = this.dailyList!.tasks.filter(x => x.id !== t.id); },
    });
  }

  shiftDay(delta: number): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + delta);
    this.selectedDate = this.toDateStr(d);
    this.loadDaily();
  }

  goToday(): void {
    this.selectedDate = this.toDateStr(new Date());
    this.loadDaily();
  }
}
