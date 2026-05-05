//store the tree diagram (not sure if needed)
export interface TreeDiagram {
  id: string;
  nodeList: TreeNode[];
}

export interface TreeNode {
  id: string;
  name: string;
  parent: string | null;
  color: string;
  shape: string;
  contentId: string | null;
}
