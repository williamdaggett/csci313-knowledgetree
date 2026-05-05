import {
  Component,
  computed,
  inject,
  input,
  NgModule,
  signal,
  SimpleChanges,
  effect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TreeDescription } from '../../models/tree-description';
import { TreeAPI } from '../../Services/tree-api';
import { Timestamp } from 'firebase/firestore';
import { AuthService } from '../../Services/authentication';
import { REQUIRED } from '@angular/forms/signals';
import { DiagramEdit } from '../diagram-edit/diagram-edit';
import { TreeDiagram } from '../../models/tree-diagram';

@Component({
  selector: 'app-tree-creator',
  imports: [FormsModule, DiagramEdit],
  templateUrl: './tree-editor.html',
  styleUrl: './tree-editor.css',
})
export class TreeEditor {
  id = input.required<string>(); //might need new edit component tbh it would probably be easier

  treeAPI = inject(TreeAPI);
  authService = inject(AuthService);

  TreeOriginalName = signal<string | null>(null);
  TreeName = signal<string>('');
  TreeOriginalDescription = signal<string | null>(null);
  TreeDescription = signal<string>('');

  TreeDiagramId = signal<string>('');

  loading = signal<boolean>(false);

  isSaved = signal<boolean>(true);

  userId = signal<string>('');

  save = computed<boolean>(() => {
    return (
      this.TreeName() === this.TreeOriginalName() &&
      this.TreeDescription() === this.TreeOriginalDescription()
    );
  });

  /*ngOnChanges(changes: SimpleChanges) {
    if (changes['treeInput'] && this.id())
      this.treeAPI
        .getById(this.id()!)
        .pipe()
        .subscribe((t) => {
          console.log(this.id());
          if (t) {
            console.log(t.name);
            this.TreeDiagramId.set(t.tree_id);
            this.TreeOriginalName.set(t.name);
            this.TreeOriginalDescription.set(t.description);
            this.TreeName.set(t.name);
            this.TreeDescription.set(t.description);
          }
        });
  }*/

  constructor() {
    this.authService.user$.pipe().subscribe((u) => this.userId.set(u?.uid!));
    effect(() => {
      const value = this.id();
      if (value) {
        console.log(value);
        this.treeAPI
          .getById(value)
          .pipe()
          .subscribe((t) => {
            this.TreeOriginalDescription.set(t.description);
            this.TreeOriginalName.set(t.name);
            this.TreeDescription.set(t.description);
            this.TreeName.set(t.name);
            this.TreeDiagramId.set(t.tree_id);
          });
      }
    });
    effect(() => {
      const value = this.TreeDiagramId();
      if (value) {
        this.treeAPI
          .getDiagram(value)!
          .pipe()
          .subscribe((t) => {
            if (t) {
              this.treeAPI.nodeList.set(t.nodeList);
            }
          });
      }
    });
  }

  saveDiagram() {
    const treeDiagram = {
      nodeList: this.treeAPI.nodeList(),
    } as Partial<TreeDiagram>;
    this.treeAPI.saveDiagram(this.TreeDiagramId(), treeDiagram);
  }

  async SaveTree() {
    this.loading.set(true);
    if (this.TreeName() === '') {
      this.loading.set(false);
      //add error message
      return;
    }

    const EditTree = {
      name: this.TreeName(),
      description: this.TreeDescription(),
    } as Partial<TreeDescription>;
    this.treeAPI.update(this.id()!, EditTree);
    this.loading.set(false);
  }
}
