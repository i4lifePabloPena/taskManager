import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api';
  private authState = new BehaviorSubject<boolean>(this.hasToken());
  private userRole = new BehaviorSubject<string>(this.getUserRole());
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
  private getUserRole(): string {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      return decoded.role || '';
    } catch (error) {
      return '';
    }
  }
  register(username: string, password: string, name: string, email: string) {
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      password,
      name,
      email,
    });
  }
  login(username: string, password: string) {
    return this.http
      .post<{ token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.authState.next(true);
          this.userRole.next(this.getUserRole());
        }),
      );
  }
  logout() {
    localStorage.removeItem('token');
    this.authState.next(false);
    this.userRole.next('');
    this.router.navigate(['/start']);
  }
  isAuthenticated() {
    return this.authState.asObservable();
  }
  isAdmin() {
    return this.userRole.asObservable();
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
