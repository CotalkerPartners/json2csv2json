import { Node, rowClassify } from './headerClassifier';

export function generateSchema(headerList: string[]): object {
  const schema: object = {};
  let nodeList: Node[] = [];
  const headerSize: number = headerList.length;
  for (let i = 0; i < headerSize; i += 1) {
    nodeList = nodeList.concat(rowClassify(headerList[i], schema));
  }
  const maxlvl: number = Math.max.apply(Math, nodeList.map((node: Node) => node.level));
  const nodesMap: { [level: number]: Node[] } = {};
  nodeList.forEach((node) => {
    if (!nodesMap[node.level]) {
      nodesMap[node.level] = [];
    }
    nodesMap[node.level].push(node);
  });

  for (let j = 1; j <= maxlvl; j += 1) {
    const nodeListPerLevel: Node[] = nodesMap[j];
    let pathTo: any = schema;
    nodeListPerLevel.forEach((node) => {
      pathTo = schema;
      for (let p = 0, parentSize: number = node.parent.length; p < parentSize; p += 1) {
        pathTo = pathTo[node.parent[p]];
      }
      let key: (string | number) = null;
      if (node.ptype === `Array`) key = node.index;
      else if (node.ptype === `Object`) key = node.key;
      if (key) {
        if (node.isLeaf) pathTo[key] = `String`;
        else if (node.type === `Array`)  pathTo[key] = [];
        else if (node.type === `Object`) pathTo[key] = {};
      }
    });
  }
  return schema;
}
