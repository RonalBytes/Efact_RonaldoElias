// src/app/viewer/viewer.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DocumentService } from '../services/document.service';
import { AuthService } from '../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent {
  ticket = '571cc3a3-5b1f-4855-af26-0de6e7c5475f';

  xmlContent: string | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  loading = false;
  error: string | null = null;

  private subs: Subscription[] = [];

  constructor(
  private docService: DocumentService,
  private auth: AuthService,
  private sanitizer: DomSanitizer,
  private cd: ChangeDetectorRef
) {}


  private getFilenameFromContentDisposition(headerValue: string | null): string | null {
    if (!headerValue) return null;

    const match =
      /filename\*=UTF-8''(.+)$/.exec(headerValue) ||
      /filename="?([^"]+)"?/.exec(headerValue);

    if (match && match[1]) {
      try { return decodeURIComponent(match[1]); }
      catch { return match[1]; }
    }
    return null;
  }

  verXML() {
    this.reset();
    this.loading = true;

    const sub = this.docService.getXMLResponse(this.ticket).subscribe({
      next: (resp) => {
        const originalBlob = resp.body as Blob;
        const xmlBlob = new Blob([originalBlob], { type: 'text/xml' });

        const url = URL.createObjectURL(xmlBlob);
        window.open(url, '_blank');

        setTimeout(() => URL.revokeObjectURL(url), 60000);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Error obteniendo XML';
      }
    });

    this.subs.push(sub);
  }

  verPDF() {
    this.reset();
    this.loading = true;

    const sub = this.docService.getPDFResponse(this.ticket).subscribe({
      next: (resp) => {
        const blob = resp.body as Blob;
        const xframe =
          resp.headers.get('x-frame-options') ||
          resp.headers.get('X-Frame-Options');

        const url = URL.createObjectURL(blob);

        // Si servidor no permite iframe → abrir nueva pestaña
        if (xframe && xframe.toLowerCase().includes('deny')) {
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 60000);
          this.loading = false;
          return;
        }

        // Si permite iframe → mostrar dentro de la app
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Error obteniendo PDF';
      }
    });

    this.subs.push(sub);
  }

  descargarCDR() {
    this.reset();
    this.loading = true;

    const sub = this.docService.getCDRResponse(this.ticket).subscribe({
      next: (resp) => {
        const originalBlob = resp.body as Blob;
        const zipBlob = new Blob([originalBlob], { type: 'application/zip' });

        const cd = resp.headers.get('content-disposition');
        const filename =
          this.getFilenameFromContentDisposition(cd) ??
          `${this.ticket}.zip`;

        const url = URL.createObjectURL(zipBlob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 60000);

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Error descargando CDR';
      }
    });

    this.subs.push(sub);
  }

  /**
   * BOTÓN DOCUMENTO → SIEMPRE mostrar PDF en iframe
   * NO abrir pestañas nuevas
   * NO usar verPDF()
   */
  mostrarDocumento() {
  this.reset();
  this.loading = true;

  const sub = this.docService.getPDFResponse(this.ticket).subscribe({
    next: (resp) => {
      const blob = resp.body as Blob;

      const url = URL.createObjectURL(blob);

      // Asignamos al iframe
      this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);

      // Forzamos actualización de Angular
      this.cd.detectChanges();

      this.loading = false;

      // Revocamos URL más adelante
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    },
    error: () => {
      this.loading = false;
      this.error = 'Error mostrando documento PDF';
      this.cd.detectChanges(); // también en error
    }
  });

  this.subs.push(sub);
}



  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  private reset() {
    this.xmlContent = null;
    this.pdfUrl = null;
    this.error = null;
  }
}
