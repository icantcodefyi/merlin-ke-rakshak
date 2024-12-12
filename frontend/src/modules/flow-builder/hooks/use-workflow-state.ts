import { useCallback } from "react";
import { useReactFlow, type Node, type Edge } from "@xyflow/react";

interface WorkflowNode {
    id: string;
    type: string;
    data: any;
    connections: {
        incoming: string[];
        outgoing: string[];
    };
}

export function useWorkflowState() {
    const { getNodes, getEdges } = useReactFlow();

    const getWorkflowData = useCallback(() => {
        const nodes = getNodes();
        const edges = getEdges();

        const workflowNodes: WorkflowNode[] = nodes.map(node => {
            const nodeConnections = {
                incoming: edges.filter(edge => edge.target === node.id).map(edge => edge.source),
                outgoing: edges.filter(edge => edge.source === node.id).map(edge => edge.target)
            };

            return {
                id: node.id,
                type: node.type,
                data: node.data,
                connections: nodeConnections,
            };
        });

        return workflowNodes;
    }, [getNodes, getEdges]);

    return {
        getWorkflowData
    };
} 