// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ViewerComponent } from './viewer/viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'comprobante', component: ViewerComponent },
  { path: '**', redirectTo: 'login' }
];
