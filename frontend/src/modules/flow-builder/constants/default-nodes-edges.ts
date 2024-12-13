import { nanoid } from "nanoid";

import type { TextMessageNodeData } from "~/modules/nodes/nodes/text-message-node/text-message.node";

import { BuilderNode } from "~/modules/nodes/types";
import { createNodeWithData, createNodeWithDefaultData } from "~/modules/nodes/utils";

const startNode = createNodeWithDefaultData(BuilderNode.START, { position: { x: 0, y: 267 } });
const mobileResponsiveInformationTextMessageNode = createNodeWithData<TextMessageNodeData>(BuilderNode.TEXT_MESSAGE, {
    channel: "telegram",
    message: "This project made by Merlin ke Rakshak! 🚀",
    deletable: true,
}, { position: { x: 300, y: 180 } });
const endNode = createNodeWithDefaultData(BuilderNode.END, { position: { x: 800, y: 267 } });

const nodes = [startNode, mobileResponsiveInformationTextMessageNode, endNode];

const edges = [
    { id: nanoid(), source: startNode.id, target: mobileResponsiveInformationTextMessageNode.id, type: "deletable" },
    { id: nanoid(), source: mobileResponsiveInformationTextMessageNode.id, target: endNode.id, type: "deletable" },
];

export {
    nodes as defaultNodes,
    edges as defaultEdges,
};
