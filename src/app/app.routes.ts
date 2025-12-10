import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
    { path: 'register', component: RegisterComponent, data: { animation: 'RegisterPage' } },
    { path: 'forgot-password', component: ForgotPasswordComponent, data: { animation: 'ForgotPage' } },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard], data: { animation: 'DashboardPage' } },
    { path: '**', redirectTo: '/login' }
];
