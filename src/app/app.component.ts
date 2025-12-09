// src/app/app.component.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-shell">
      <header><h1></h1></header>
      <main><router-outlet></router-outlet></main>
    </div>`,
  styles: [`
    .app-shell { max-width: 900px; margin: 24px auto; font-family: Arial, sans-serif; padding: 16px; }
    header h1 { text-align:center; margin:0 0 16px 0; font-size:20px; }
  `]
})
export class AppComponent {}
