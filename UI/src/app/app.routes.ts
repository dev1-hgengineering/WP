import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AchievementsComponent } from './pages/achievements/achievements.component';
import { InitiativesComponent } from './pages/initiatives/initiatives.component';
import { InitiativeDetailComponent } from './pages/initiatives/initiative-detail/initiative-detail.component';
import { DevelopersComponent } from './pages/developers/developers.component';
import { TodosComponent } from './pages/todos/todos.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'achievements', component: AchievementsComponent },
  { path: 'initiatives', component: InitiativesComponent },
  { path: 'initiatives/:id', component: InitiativeDetailComponent },
  { path: 'developers', component: DevelopersComponent },
  { path: 'todos', component: TodosComponent },
  { path: '**', redirectTo: '' },
];
