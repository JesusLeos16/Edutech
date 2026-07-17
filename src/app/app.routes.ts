import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Test } from './pages/test/test';
import { Recomendaciones } from './pages/recomendaciones/recomendaciones';
import { Panel } from './pages/panel/panel';
import { Dashboard } from './pages/panel/dashboard/dashboard';
import { Cursos } from './pages/panel/cursos/cursos';
import { MisCursos } from './pages/panel/mis-cursos/mis-cursos';
import { authGuard } from '../guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'test', component: Test },
  { path: 'recomendaciones', component: Recomendaciones },
  {
    path: 'panel',
    component: Panel,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: Dashboard },
      { path: 'cursos', component: Cursos },
      { path: 'mis-cursos', component: MisCursos },
    ],
  },
  { path: '**', redirectTo: '' },
];
