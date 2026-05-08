import { Component, inject, input, effect, signal, computed } from '@angular/core';
import { AuthService } from '../../Services/authentication';
import { TreeAPI } from '../../Services/tree-api';
import { DiagramDisplay } from '../diagram-display/diagram-display';
import { TreeDiagram } from '../../models/tree-diagram';
import { NodeContentListComponent } from '../node-content-list/node-content-list';
import { ContentService } from '../../Services/content';

@Component({
  selector: 'app-tree-display',
  imports: [DiagramDisplay, NodeContentListComponent],
  templateUrl: './tree-display.html',
  styleUrl: './tree-display.css',
})
export class TreeDisplay {
  authService = inject(AuthService);
  contentService = inject(ContentService);
  treeAPI = inject(TreeAPI);

  id = input.required<string>();

  content = signal<any>(null);

  contentId = signal<string>('');
  contentCompletable = signal<boolean>(false);
  nodeId = signal<string>('');
  nodeName = computed(() => {
    const id = this.nodeId();
    for (const n of this.treeAPI.nodeList()) {
      if (n.id === id) {
        return n.name;
      }
    }
    return '';
  });
  TreeDescription = signal<string>('');
  TreeName = signal<string>('');
  TreeDiagramId = signal<string>('');
  userId = signal<string>('');
  saved = signal<boolean>(true);

  progress = computed(() => {
    const nodes = this.treeAPI.nodeList();
    let x = nodes.length - 1;
    let y = 0;
    for (const n of nodes) {
      if (n.completed) {
        y += 1;
      }
    }
    return y + '/' + x + ' Nodes Completed';
  });

  constructor() {
    this.authService.user$.pipe().subscribe((u) => this.userId.set(u?.uid!));
    effect(() => {
      const value = this.id();
      if (value) {
        console.log(value);
        this.treeAPI
          .getProgressDescriptionById(value)
          .pipe()
          .subscribe((t) => {
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
          .getProgressDiagram(value)!
          .pipe()
          .subscribe((t) => {
            if (t) {
              this.treeAPI.nodeList.set(t.nodeList);
              this.contentId.set(t.contentId);
            }
          });
      }
    });
    effect(() => {
      const value = this.contentId();
      if (value) {
        console.log(value);
        this.contentService
          .getTreeContent(value)
          .pipe()
          .subscribe((content) => {
            console.log(content);
            this.contentService.contentCache.set(content);
          });
      }
    });
  }

  receiveId(id: string[]) {
    this.contentCompletable.set(id[1] !== 'COMPLETE' && id[0] !== 'LOCK');
    this.nodeId.set(id[2]);
    this.content.set(this.contentService.contentCache()[id[2]]);
  }

  completeNode() {
    if (!this.contentCompletable) return;
    this.treeAPI.nodeList.update((nodes) => {
      return nodes.map((n) => {
        if (n.id === this.nodeId()) {
          n.completed = true;
        }
        return n;
      });
    });
    this.contentCompletable.set(false);
    this.saved.set(false);
  }

  saveTree() {
    const diagram = {
      nodeList: this.treeAPI.nodeList(),
    } as Partial<TreeDiagram>;
    this.treeAPI.saveProgressDiagram(this.TreeDiagramId(), diagram);
    this.saved.set(true);
  }
}
