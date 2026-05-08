import { Component, inject, signal, effect } from '@angular/core';
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
  authorNames = signal<string[]>([]);

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
    this.treeAPI
      .getProgressTreesByUser(this.userId())
      .pipe()
      .subscribe((t) => {
        this.learningTrees.set(t);
      });
    effect(async () => {
      const trees = this.learningTrees();
      let nameList = [];
      for (const t of trees) {
        let author = await this.authService.getUserProfile(t.authorId);
        if (author) {
          nameList.push(author.name);
        } else {
          nameList.push('Unknown');
        }
      }
      this.authorNames.set(nameList);
    });
  }
}
