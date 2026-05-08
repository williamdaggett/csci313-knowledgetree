import { Component, ViewEncapsulation, ViewChild, inject, effect, output } from '@angular/core';
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
  NodeConstraints,
  ConnectorConstraints,
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
  selector: 'app-diagram-display',
  templateUrl: './diagram-display.html',
  encapsulation: ViewEncapsulation.None,
})
export class DiagramDisplay {
  @ViewChild('diagram')
  public diagram?: DiagramComponent;
  public snapSettings?: SnapSettingsModel;
  public items?: DataManager;
  public layout?: LayoutModel;
  public dataSourceSettings?: DataSourceModel;

  treeAPI = inject(TreeAPI);
  dialog = inject(MatDialog);

  loadContent = output<string[]>(); //node content id

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
    const data = node.data as any;
    function gradientColor() {
      if (!data.color) {
        return 'black';
      }
      //won't be able to access methods outside of this
      let hex = data.color;
      // Remove # if present
      if (hex[0] === '#') hex = hex.slice(1);
      // Convert to RGB
      let r = Math.trunc(parseInt(hex.slice(0, 2), 16) * 0.7)
        .toString(16)
        .padStart(2, '0');
      let g = Math.trunc(parseInt(hex.slice(2, 4), 16) * 0.7)
        .toString(16)
        .padStart(2, '0');
      let b = Math.trunc(parseInt(hex.slice(4, 6), 16) * 0.7)
        .toString(16)
        .padStart(2, '0');
      // Return as Hex
      return '#' + r + g + b;
    }
    node.borderWidth = 0;
    node.style = {
      fill: data.color,
      gradient: {
        type: 'Linear',
        x1: 0,
        y1: 0,
        x2: 50,
        y2: 50,
        stops: [
          { color: data.color, offset: 0, opacity: 1 },
          { color: gradientColor(), offset: 100, opacity: 1 },
        ],
      },
    };
    if (data?.shape) {
      //basic shape types available: Rectangle, Ellipse,
      // Polygon, Triangle, Plus, Star, Pentagon,
      // Hexagon, Octagon, Trapezoid, Parallelogram, Diamond
      node.shape = { type: 'Basic', shape: data?.shape };
    }
    if (data?.completed === true) {
    } else if (data?.completed === false) {
      node.style = {
        opacity: 0.3,
      };
    }
    if (data?.size) {
      switch (data.size) {
        case 'Big':
          node.height = 60;
          node.width = 60;
          break;
        case 'Medium':
          node.height = 45;
          node.width = 45;
          break;
        case 'Small':
          node.height = 30;
          node.width = 30;
          break;
      }
    } else {
      node.height = 20;
      node.width = 20;
    }
    node.constraints =
      NodeConstraints.Default &
      ~NodeConstraints.Drag &
      ~NodeConstraints.Resize &
      ~NodeConstraints.Rotate &
      ~NodeConstraints.Select;
    return node;
  }

  //Sets the default properties for connectors
  public getConnectorDefaults(connector: ConnectorModel): ConnectorModel {
    (connector.targetDecorator as DecoratorModel).shape = 'None';
    connector.type = 'Straight';
    connector.constraints = ConnectorConstraints.ReadOnly;
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
      if (data.id == '1') return;
      if (data.completed == true) {
        this.loadContent.emit([data.contentId ? data.contentId : 'EMPTY', 'COMPLETE', data.id]);
      } else if (data.parent == '1') {
        this.loadContent.emit([data.contentId ? data.contentId : 'EMPTY', 'INCOMPLETE', data.id]);
      } else {
        for (const n of this.treeAPI.nodeList()) {
          if (n.id == data.parent) {
            if (n.completed == true) {
              this.loadContent.emit([
                data.contentId ? data.contentId : 'EMPTY',
                'INCOMPLETE',
                data.id,
              ]);
            } else {
              this.loadContent.emit(['LOCK', 'INCOMPLETE', data.id]);
            }
            return;
          }
        }
      }
    }
  }

  invertColor(hex: string) {
    // Remove # if present
    if (hex.indexOf('#') === 0) hex = hex.slice(1);
    // Convert to RGB
    let r = (255 - parseInt(hex.slice(0, 2), 16)).toString(16).padStart(2, '0');
    let g = (255 - parseInt(hex.slice(2, 4), 16)).toString(16).padStart(2, '0');
    let b = (255 - parseInt(hex.slice(4, 6), 16)).toString(16).padStart(2, '0');
    // Return as Hex
    return '#' + r + g + b;
  }
}
