import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../Services/authentication';
import { AppUser } from '../../models/user';

@Component({
  selector: 'app-create-account',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-account.html',
  styleUrl: './create-account.css',
})
export class CreateAccount {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = signal<AppUser | null>(null);

  email = signal('');
  password = signal('');
  displayName = signal('');
  loading = signal(false);
  error = signal<string | null>(null);

  async onRegister() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const cred = await this.auth.register(this.email(), this.password(), this.displayName());

      // Optional: create Firestore profile

      this.router.navigate(['/login']);
    } catch (err: any) {
      this.error.set(this.getErrorMessage(err.code));
    } finally {
      this.loading.set(false);
    }
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already in use.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return 'Account creation failed. Please try again.';
    }
  }
}
