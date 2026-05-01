import { Component, inject, signal } from '@angular/core';
import { TreeDescription } from '../../models/tree-description';
import { AuthService } from '../../Services/authentication';
import { TreeAPI } from '../../Services/tree-api';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-dashboard',
  imports: [RouterModule],
  templateUrl: './user-dashboard.html',
  styleUrl: './user-dashboard.css',
})
export class UserDashboard {
  createdTrees = signal<TreeDescription[]>([]);
  learningTrees = signal<TreeDescription[]>([]);

  authService = inject(AuthService);
  treeAPI = inject(TreeAPI);
  userId = signal<string>('');

  constructor() {
    this.authService.user$.pipe().subscribe((u) => {
      this.userId.set(u?.uid!);
    });
    this.treeAPI
      .getByAuther(this.userId())
      .pipe()
      .subscribe((t) => {
        this.createdTrees.set(t);
      });
  }
}
