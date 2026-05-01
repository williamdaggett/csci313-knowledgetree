import { Component, computed, inject, input, NgModule, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeDescription } from '../../models/tree-description';
import { TreeAPI } from '../../Services/tree-api';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from '../../Services/authentication';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tree-creator',
  imports: [FormsModule],
  templateUrl: './tree-creator.html',
  styleUrl: './tree-creator.css',
})
export class TreeCreator {
  treeAPI = inject(TreeAPI);
  authService = inject(AuthService);
  router = inject(Router);

  TreeMetaDataId = signal<string | null>(null);
  TreeOriginalName = signal<string | null>(null);
  TreeName = signal<string>('');
  TreeOriginalDescription = signal<string | null>(null);
  TreeDescription = signal<string>('');

  loading = signal<boolean>(false);

  isSaved = signal<boolean>(true);

  userId = signal<string>('');

  save = computed<boolean>(() => {
    return (
      this.TreeName() === this.TreeOriginalName() &&
      this.TreeDescription() === this.TreeOriginalDescription()
    );
  });

  constructor() {
    this.authService.user$.pipe().subscribe((u) => this.userId.set(u?.uid!));
  }

  async SaveTree() {
    this.loading.set(true);
    if (this.TreeName() === '') {
      this.loading.set(false);
      //add error message
      return;
    }

    const CreatedDiagram = {
      /*implementdiagram*/
    };
    //add diagram and then use its id in tree creation
    const CreatedTree = {
      tree_id: 'Example',
      name: this.TreeName(),
      description: this.TreeDescription(),
      date_created: Timestamp.fromDate(new Date()),
      authorId: this.userId(),
    } as any as Omit<TreeDescription, 'id'>;
    const id = await this.treeAPI.create(CreatedTree);
    this.router.navigate(['edit-tree', id]);
  }
}
