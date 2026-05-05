import { Component, ViewEncapsulation, ViewChild, inject, effect } from '@angular/core';
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

Diagram.Inject(DataBinding, RadialTree);

@Component({
  imports: [DiagramModule],

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

  //Initializes data source
  public data: object[] = [
    {
      id: '1',
      name: 'init',
    },
  ];

  constructor() {
    effect(() => {
      const nodes = this.treeAPI.nodeList() as object[];
      if (nodes && nodes.length > 0) {
        if (this.diagram) {
          this.items = new DataManager(nodes as JSON[], new Query().take(7));
          //Uses layout to auto-arrange nodes on the Diagram page
          this.layout = {
            //set layout type
            type: 'RadialTree',
            root: '1',
          };
          this.diagram.dataSourceSettings = {
            id: 'id',
            parentId: 'parent',
            dataSource: this.items,
          };
        }
      }
    });
  }

  //Sets the default properties for nodes
  public getNodeDefaults(node: NodeModel): NodeModel {
    node.height = 20;
    node.width = 20;
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
    this.items = new DataManager(this.data as JSON[], new Query().take(7));

    //Uses layout to auto-arrange nodes on the Diagram page
    this.layout = {
      //set layout type
      type: 'RadialTree',
      root: '1',
    };

    //Configures data source for Diagram
    console.log(this.data[0]);
    this.dataSourceSettings = {
      id: 'id',
      parentId: 'parent',
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
}
