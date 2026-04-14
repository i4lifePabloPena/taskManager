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
  private userRole = new BehaviorSubject<string>('user');
  
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.loadRoleFromStorage();
  }
  
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }
  
  private loadRoleFromStorage(): void {
    const role = localStorage.getItem('userRole');
    if (role) {
      this.userRole.next(role);
    }
  }
  
  register(
    username: string,
    password: string,
    admin: boolean,
    name: string,
    email: string,
  ) {
    return this.http.post(`${this.apiUrl}/register`, {
      username,
      password,
      admin,
      name,
      email,
    });
  }
  
  login(username: string, password: string) {
    return this.http
      .post<{ token: string; admin: boolean }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          const role = response.admin ? 'admin' : 'user';
          localStorage.setItem('userRole', role);
          this.userRole.next(role);
          this.authState.next(true);
        }),
      );
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    this.userRole.next('user');
    this.authState.next(false);
    this.router.navigate(['/login']);
  }
  
  isAuthenticated() {
    return this.authState.asObservable();
  }
  
  getUserRole() {
    return this.userRole.asObservable();
  }
  
  isAdmin(): boolean {
    return this.userRole.value === 'admin';
  }
  
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
