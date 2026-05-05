import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TreeAPI } from '../../Services/tree-api';

//handle tree edit operations in diagram edit
@Component({
  selector: 'app-node-pop-up',
  imports: [],
  templateUrl: './node-pop-up.html',
  styleUrl: './node-pop-up.css',
})
export class NodePopUp {
  treeAPI = inject(TreeAPI);
  data = inject(MAT_DIALOG_DATA) as any;

  addChild() {
    this.treeAPI.createNode('Default', this.data.id, 'circle', 'black');
    console.log(this.treeAPI.nodeList());
  }

  deleteNode() {
    this.treeAPI.deleteNode(this.data.id);
  }
}
