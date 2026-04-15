import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <h1>Office Work Tracker</h1>
      <p>Track professional achievements, manage initiatives, monitor developer tasks — all in one place.</p>
    </section>

    <div class="card-grid">
      <a routerLink="/achievements" class="nav-card">
        <div class="card-icon">🏆</div>
        <h2>Achievements</h2>
        <p>Record and export your professional achievements by project and team.</p>
      </a>
      <a routerLink="/initiatives" class="nav-card">
        <div class="card-icon">🚀</div>
        <h2>Initiatives</h2>
        <p>Create initiatives, assign developers, and track tasks with due dates or recurring schedules.</p>
      </a>
      <a routerLink="/developers" class="nav-card">
        <div class="card-icon">👩‍💻</div>
        <h2>Developers</h2>
        <p>Manage developers and track their independent tasks separately from initiative work.</p>
      </a>
    </div>
  `,
  styles: [`
    .hero { text-align: center; padding: 3rem 1rem 2.5rem; }
    .hero h1 { font-size: 2rem; font-weight: 700; color: var(--primary); margin-bottom: 0.75rem; }
    .hero p { font-size: 1.05rem; color: var(--text-muted); max-width: 540px; margin: 0 auto; }
    .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.5rem; margin-top: 1rem; }
    .nav-card { display: flex; flex-direction: column; align-items: center; text-align: center; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 2rem 1.5rem; box-shadow: var(--shadow); transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
    .nav-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.12); transform: translateY(-2px); }
    .card-icon { font-size: 2.5rem; margin-bottom: 1rem; }
    .nav-card h2 { font-size: 1.15rem; margin-bottom: 0.5rem; color: var(--primary); }
    .nav-card p { font-size: 0.88rem; color: var(--text-muted); }
  `],
})
export class HomeComponent {}
