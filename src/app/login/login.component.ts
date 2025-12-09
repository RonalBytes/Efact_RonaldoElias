// src/app/login/login.component.ts
import { Component, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '20111193035';
  password = '61a77b6fda77c3a2d6b28930546c86d7f749ccf0bd4bad1e1192f13bb59f0f30';
  loading = false;
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef // Para actualizar la vista manualmente
  ) {}

  // Decodifica entidades HTML a caracteres normales
  private decodeHTMLEntities(text: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = text;
    return txt.value;
  }

  onSubmit() {
    this.errorMessage = '';
    if (!this.username || !this.password) {
      this.errorMessage = 'Completa usuario y contraseña';
      return;
    }

    this.loading = true;
    this.cdr.detectChanges(); // actualiza la vista inmediatamente

    this.auth.login(this.username, this.password).subscribe({
      next: (token) => {
        this.loading = false;
        this.cdr.detectChanges(); // refresca vista antes de navegar
        this.router.navigate(['/comprobante']);
      },
      error: (err) => {
        this.loading = false;
        // Decodifica entidades HTML para mostrar acentos correctamente
        this.errorMessage = this.decodeHTMLEntities(err.message || 'Error de autenticación');
        this.cdr.detectChanges(); // fuerza actualización de la vista
      }
    });
  }

  limpiar() {
    this.username = '';
    this.password = '';
    this.errorMessage = '';
    this.cdr.detectChanges(); // asegura que la vista se limpie al instante
  }
}
