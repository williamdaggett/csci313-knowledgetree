import { Component, input } from '@angular/core';
import { NodeContent } from '../../models/node-content';
import { NodeContentViewerComponent } from '../node-content-viewer/node-content-viewer';

@Component({
  selector: 'app-node-content-list',
  standalone: true,
  imports: [NodeContentViewerComponent],
  templateUrl: './node-content-list.html',
  styleUrl: './node-content-list.css',
})
export class NodeContentListComponent {
  content = input<NodeContent | null>(null);
}
