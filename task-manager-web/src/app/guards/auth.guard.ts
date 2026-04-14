import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}
  canActivate(): boolean {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        throw new Error('Invalid token format');
      }
      const tokenPayload = JSON.parse(atob(payload));
      const tokenExpired = tokenPayload.exp * 1000 < Date.now();
      if (tokenExpired) {
        this.authService.logout();
        return false;
      }
    } catch (error) {
      this.authService.logout();
      return false;
    }
    return true;
  }
}
