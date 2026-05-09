import { Component, signal, ViewEncapsulation, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './Services/authentication';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  isLoggedIn = signal(false);
  constructor() {
    this.authService.user$.subscribe((user) => {
      this.isLoggedIn.set(user !== null);
    });
  }

  authService = inject(AuthService);
  protected readonly title = signal('knowledge-tree-app');
}
