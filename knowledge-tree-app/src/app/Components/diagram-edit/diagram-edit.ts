import { Component, ViewEncapsulation, ViewChild, inject, effect, signal } from '@angular/core';
import {
  DiagramComponent,
  Diagram,
  NodeModel,
  SnapSettingsModel,
  LayoutModel,
  DataSourceModel,
  DataBinding,
  DiagramModule,
  RadialTreeService,
  DataBindingService,
  RadialTree,
  ConnectorModel,
  DecoratorModel,
  IClickEventArgs,
} from '@syncfusion/ej2-angular-diagrams';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { TreeAPI } from '../../Services/tree-api';
import { TreeNode } from '../../models/tree-diagram';
import { MatDialog } from '@angular/material/dialog';
import { NodePopUp } from '../node-pop-up/node-pop-up';
import { FormsModule } from '@angular/forms';

Diagram.Inject(DataBinding, RadialTree);

@Component({
  imports: [DiagramModule, FormsModule],

  providers: [RadialTreeService, DataBindingService],
  standalone: true,
  selector: 'app-diagram-edit',
  templateUrl: './diagram-edit.html',
  encapsulation: ViewEncapsulation.None,
})
export class DiagramEdit {
  @ViewChild('diagram')
  public diagram?: DiagramComponent;
  public snapSettings?: SnapSettingsModel;
  public items?: DataManager;
  public layout?: LayoutModel;
  public dataSourceSettings?: DataSourceModel;

  treeAPI = inject(TreeAPI);
  dialog = inject(MatDialog);

  // Form signals for creating nodes
  nodeName = signal<string>('');
  selectedParentId = signal<string>('1');
  nodeColor = signal<string>('#0d6efd'); // Bootstrap primary blue
  nodeShape = signal<string>('Circle');

  //Initializes data source
  public data: object[] = [
    {
      id: '1',
      name: 'init',
    },
  ];

  constructor() {
    effect(() => {
      const nodes = this.treeAPI.nodeList() as any[];
      if (nodes && nodes.length > 0 && this.diagram) {
        // Convert TreeNode format to Syncfusion format
        const syncfusionNodes = nodes.map((node) => ({
          id: node.id,
          name: node.name,
          parentId: node.parent, // Map 'parent' to 'parentId' for Syncfusion
          color: node.color,
          shape: node.shape,
          contentId: node.contentId,
        }));

        this.items = new DataManager(syncfusionNodes as JSON[], new Query().take(500));
        
        // Refresh diagram data
        this.diagram.dataSourceSettings = {
          id: 'id',
          parentId: 'parentId',
          dataSource: this.items,
        };
      }
    });
  }

  //Sets the default properties for nodes
  public getNodeDefaults(node: NodeModel): NodeModel {
    node.height = 50;
    node.width = 50;
    
    // Apply color from data
    if (node.data && (node.data as any).color) {
      node.style = { fill: (node.data as any).color };
    }
    
    // Apply shape
    if (node.data && (node.data as any).shape) {
      const shape = (node.data as any).shape.toLowerCase();
      if (shape === 'circle' || shape === 'ellipse') {
        node.shape = { type: 'Circle' };
      } else if (shape === 'rectangle') {
        node.shape = { type: 'Rectangle' };
      } else if (shape === 'diamond') {
        node.shape = { type: 'Diamond' };
      }
    }

    // Add text
    if (node.data && (node.data as any).name) {
      node.annotations = [
        {
          content: (node.data as any).name,
          style: { fontSize: 12, color: '#ffffff' },
        } as any,
      ];
    }

    return node;
  }

  //Sets the default properties for connectors
  public getConnectorDefaults(connector: ConnectorModel): ConnectorModel {
    (connector.targetDecorator as DecoratorModel).shape = 'None';
    connector.type = 'Straight';
    return connector;
  }

  ngOnInit(): void {
    this.snapSettings = { constraints: 0 };
    
    // Initialize with default data
    const initialData = [
      {
        id: '1',
        name: 'init',
        parentId: null,
        color: '#0d6efd',
        shape: 'Circle',
      },
    ];
    
    this.items = new DataManager(initialData as JSON[], new Query().take(500));

    //Uses layout to auto-arrange nodes on the Diagram page
    this.layout = {
      //set layout type
      type: 'RadialTree',
      root: '1',
    };

    //Configures data source for Diagram
    this.dataSourceSettings = {
      id: 'id',
      parentId: 'parentId',
      dataSource: this.items,
    };
  }

  public onClick(args: IClickEventArgs): void {
    const element = args.element as NodeModel;
    if (element && element.data) {
      const data = element.data as TreeNode;
      console.log('Full data:', data);
      console.log('Node ID:', data.id);
      console.log('Name:', data.name);
      console.log('Color:', data.color);
      this.dialog.open(NodePopUp, { data: data, panelClass: 'custom-dialog', hasBackdrop: true });
    }
  }

  // Create a new node
  createNode(): void {
    if (!this.nodeName()) {
      alert('Please enter a node name');
      return;
    }

    this.treeAPI.createNode(
      this.nodeName(),
      this.selectedParentId(),
      this.nodeShape(),
      this.nodeColor()
    );

    // Reset form
    this.nodeName.set('');
    this.nodeColor.set('#0d6efd');
    this.nodeShape.set('Circle');
  }

  // Get all node IDs for parent dropdown
  getNodeIds(): string[] {
    return this.treeAPI.nodeList().map((n) => n.id);
  }
}

