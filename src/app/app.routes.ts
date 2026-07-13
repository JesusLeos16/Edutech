import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Test } from './pages/test/test';
import { Recomendaciones } from './pages/recomendaciones/recomendaciones';

export const routes: Routes = [
  { path: '', component: Landing },
  { path: 'test', component: Test },
  { path: 'recomendaciones', component: Recomendaciones },
  { path: '**', redirectTo: '' },
];
