import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Services/authentication';
import { AppUser } from '../../models/user';
import { MyAccount } from '../my-account/my-account';

@Component({
  selector: 'app-log-in',
  standalone: true,
  imports: [FormsModule, RouterLink, MyAccount],
  templateUrl: './log-in.html',
  styleUrl: './log-in.css',
})
export class LogIn {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  user = signal<AppUser | null>(null);

  constructor() {
    this.auth.user$.subscribe((user) => {
      this.user.set(user);
    });
  }

  async onLogin() {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.auth.login(this.email(), this.password());
      this.router.navigate(['/']);
    } catch (err: any) {
      this.error.set(this.getErrorMessage(err.code));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      default:
        return 'Login failed. Please try again.';
    }
  }

  logout() {
    this.auth.logout();
  }
}
