// src/app/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  private baseUrl = '/api-efact-ose/v1'; // proxy configurado

  constructor(private http: HttpClient, private auth: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.auth.getToken();
    return new HttpHeaders({ Authorization: `Bearer ${token ?? ''}` });
  }

  // Retornamos HttpResponse<Blob> para poder leer headers (filename, x-frame-options, etc.)
  getXMLResponse(ticket: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/xml/${ticket}`, {
      headers: this.getHeaders(),
      observe: 'response',
      responseType: 'blob'
    });
  }

  getPDFResponse(ticket: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/pdf/${ticket}`, {
      headers: this.getHeaders(),
      observe: 'response',
      responseType: 'blob'
    });
  }

  getCDRResponse(ticket: string): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.baseUrl}/cdr/${ticket}`, {
      headers: this.getHeaders(),
      observe: 'response',
      responseType: 'blob'
    });
  }
}
