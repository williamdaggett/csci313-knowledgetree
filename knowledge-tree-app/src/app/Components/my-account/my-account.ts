import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../Services/authentication';
import { AppUser } from '../../models/user';

@Component({
  selector: 'app-my-account',
  imports: [],
  templateUrl: './my-account.html',
  styleUrl: './my-account.css',
})
export class MyAccount {
  private authService = inject(AuthService);

  user = signal<AppUser | null>(null);

  constructor() {
    this.authService.user$.subscribe((user) => {
      this.user.set(user);
    });
  }
}
