// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

interface TokenResponse {
  access_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'efact_token';
  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<string> {
    const headers = new HttpHeaders({
      'Authorization': environment.clientBasicAuth,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('username', username)
      .set('password', password)
      .toString();

    return this.http.post<TokenResponse>(environment.authUrl, body, { headers })
      .pipe(
        map(res => {
          if (!res || !res.access_token) throw new Error('Token no recibido');
          localStorage.setItem(this.tokenKey, res.access_token);
          return res.access_token;
        }),
        catchError(err => {
          let message = 'Usuario o contraseña incorrectos';
          if (err?.error?.error_description) message = err.error.error_description;
          // Lanzar un Error real para que Angular lo detecte inmediatamente
          return throwError(() => new Error(message));
        })
      );
  }

  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  logout(): void { localStorage.removeItem(this.tokenKey); }
}
