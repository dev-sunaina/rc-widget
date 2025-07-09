import { Routes } from '@angular/router';
import { WebphoneComponent } from './components/webphone/webphone.component';

export const routes: Routes = [
  { path: '', redirectTo: '/webphone', pathMatch: 'full' },
  { path: 'webphone', component: WebphoneComponent },
  { path: '**', redirectTo: '/webphone' }
];
