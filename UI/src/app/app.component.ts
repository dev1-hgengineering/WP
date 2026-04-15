import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="nav-header">
      <div class="nav-inner">
        <a routerLink="/" class="nav-brand">Office Work Tracker</a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <a routerLink="/achievements" routerLinkActive="active">Achievements</a>
          <a routerLink="/initiatives" routerLinkActive="active">Initiatives</a>
          <a routerLink="/developers" routerLinkActive="active">Developers</a>
          <a routerLink="/todos" routerLinkActive="active">Todos</a>
        </nav>
      </div>
    </header>
    <main class="page-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .nav-header { background: var(--primary); color: white; padding: 0 2rem; box-shadow: 0 2px 6px rgba(0,0,0,.15); }
    .nav-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 2rem; height: 56px; }
    .nav-brand { font-size: 1.1rem; font-weight: 700; letter-spacing: .5px; color: white; flex-shrink: 0; }
    nav { display: flex; gap: 1.5rem; }
    nav a { color: rgba(255,255,255,.8); font-size: 0.9rem; padding: 0.25rem 0; border-bottom: 2px solid transparent; transition: color 0.15s, border-color 0.15s; }
    nav a:hover, nav a.active { color: white; border-bottom-color: white; }
    .page-content { max-width: 1100px; margin: 2rem auto; padding: 0 1.5rem; }
  `],
})
export class AppComponent {}
