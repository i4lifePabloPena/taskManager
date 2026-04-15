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
  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
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
      .post<{ token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', response.token);
          this.authState.next(true);
        }),
      );
  }
  logout() {
    localStorage.removeItem('token');
    this.authState.next(false);
    this.router.navigate(['/login']);
  }
  isAuthenticated() {
    return this.authState.asObservable();
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
