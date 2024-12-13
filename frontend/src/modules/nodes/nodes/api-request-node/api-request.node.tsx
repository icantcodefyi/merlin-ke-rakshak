import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Position, useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { nanoid } from "nanoid";
import { isEmpty } from "radash";
import { memo, useCallback, useMemo, useState } from "react";
import { get } from "radash";

import type { BaseNodeData, RegisterNodeMetadata, FlowNode } from "~/modules/nodes/types";

import CustomHandle from "~/modules/flow-builder/components/handles/custom-handle";
import { useDeleteNode } from "~/modules/flow-builder/hooks/use-delete-node";
import { BuilderNode } from "~/modules/nodes/types";
import { getNodeDetail } from "~/modules/nodes/utils";
import ApiRequestPropertyPanel from "~/modules/sidebar/panels/node-properties/property-panels/api-request-property-panel";
import { useApplicationState } from "~/stores/application-state";

export enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE",
    PATCH = "PATCH",
}

export interface ApiRequestConfig {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    body?: string;
    outputFields: string[];
}

export interface ApiRequestNodeData extends BaseNodeData {
    config: ApiRequestConfig;
    response?: any;
    isLoading?: boolean;
    error?: string;
    availableArrays?: string[];
    selectedItems?: any[];
    selectedArrayPath?: string;
}

const NODE_TYPE = BuilderNode.API_REQUEST;

interface ApiRequestNodeProps {
    id: string;
    isConnectable: boolean;
    selected: boolean;
    data: ApiRequestNodeData;
}

export function ApiRequestNode({ id, isConnectable, selected, data }: ApiRequestNodeProps) {
    const meta = useMemo(() => getNodeDetail(NODE_TYPE), []);
    const [sourceHandles, setSourceHandles] = useState<string[]>([]);
    const { setNodes } = useReactFlow();
    const deleteNode = useDeleteNode();
    const [showNodePropertiesOf] = useApplicationState((s) => [s.actions.sidebar.showNodePropertiesOf]);

    const showNodeProperties = useCallback(() => {
        showNodePropertiesOf({ id, type: NODE_TYPE });
    }, [id, showNodePropertiesOf]);

    const executeRequest = useCallback(async () => {
        setNodes((nodes: FlowNode[]) =>
            produce(nodes, (draft: FlowNode[]) => {
                const node = draft.find((n) => n.id === id);
                if (node?.type === NODE_TYPE) {
                    node.data.isLoading = true;
                    node.data.error = undefined;
                }
            }),
        );

        try {
            const response = await fetch(data.config.url, {
                method: data.config.method,
                headers: data.config.headers,
                body: data.config.method !== HttpMethod.GET ? data.config.body : undefined,
            });

            const responseData = await response.json();
            const arrayPaths = findArraysInResponse(responseData);

            setNodes((nodes: FlowNode[]) =>
                produce(nodes, (draft: FlowNode[]) => {
                    const node = draft.find((n) => n.id === id);
                    if (node?.type === NODE_TYPE) {
                        node.data.response = responseData;
                        node.data.availableArrays = arrayPaths;
                        node.data.isLoading = false;
                    }
                }),
            );

            // Create output handles for selected items
            const newHandles = data.selectedItems?.map(() => nanoid()) || [];
            setSourceHandles(newHandles);
        } catch (error: unknown) {
            setNodes((nodes: FlowNode[]) =>
                produce(nodes, (draft: FlowNode[]) => {
                    const node = draft.find((n) => n.id === id);
                    if (node?.type === NODE_TYPE) {
                        node.data.error = error instanceof Error ? error.message : "Unknown error";
                        node.data.isLoading = false;
                    }
                }),
            );
        }
    }, [id, data.config, data.selectedItems, setNodes]);

    const handleArraySelection = useCallback(
        (arrayPath: string) => {
            setNodes((nodes: FlowNode[]) =>
                produce(nodes, (draft: FlowNode[]) => {
                    const node = draft.find((n) => n.id === id);
                    if (node?.type === NODE_TYPE) {
                        const arrayData = get(node.data.response, arrayPath);
                        node.data.selectedItems = arrayData;
                        node.data.selectedArrayPath = arrayPath;

                        // Create a new handle for connecting to the next node
                        const newHandle = nanoid();
                        setSourceHandles([newHandle]);
                    }
                }),
            );
        },
        [id, setNodes],
    );

    // Helper function to find arrays in response
    function findArraysInResponse(obj: any, path: string = ""): string[] {
        let results: string[] = [];

        for (const key in obj) {
            const newPath = path ? `${path}.${key}` : key;

            if (Array.isArray(obj[key])) {
                results.push(newPath);
            } else if (typeof obj[key] === "object" && obj[key] !== null) {
                results = results.concat(findArraysInResponse(obj[key], newPath));
            }
        }

        return results;
    }

    return (
        <>
            <div
                data-selected={selected}
                className="w-xs overflow-clip border border-dark-200 rounded-xl bg-dark-300/50 shadow-sm backdrop-blur-xl transition divide-y divide-dark-200 data-[selected=true]:(border-yellow-600 ring-1 ring-yellow-600/50)"
                onDoubleClick={showNodeProperties}
            >
                <div className="relative bg-dark-300/50">
                    <div className="absolute inset-0">
                        <div className="absolute h-full w-3/5 from-yellow-900/20 to-transparent bg-gradient-to-r" />
                    </div>

                    <div className="relative h-9 flex items-center justify-between gap-x-4 px-0.5 py-0.5">
                        <div className="flex grow items-center pl-0.5">
                            <div className="size-7 flex items-center justify-center">
                                <div className="size-6 flex items-center justify-center rounded-lg">
                                    <div className="i-mdi:api size-4" />
                                </div>
                            </div>

                            <div className="ml-1 text-xs font-medium leading-none tracking-wide uppercase op-80">
                                <span className="translate-y-px">{meta.title}</span>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-x-0.5 pr-0.5">
                            <button
                                type="button"
                                className="h-7 flex items-center justify-center border border-transparent rounded-lg bg-transparent px-2 outline-none transition active:(border-dark-200 bg-dark-400/50) hover:(bg-dark-100)"
                                onClick={executeRequest}
                                disabled={data.isLoading}
                            >
                                {data.isLoading ? <div className="i-lucide:loader-2 size-4 animate-spin" /> : <div className="i-lucide:play size-4" />}
                            </button>

                            <button
                                type="button"
                                className="size-7 flex items-center justify-center border border-transparent rounded-lg bg-transparent outline-none transition active:(border-dark-200 bg-dark-400/50) hover:(bg-dark-100)"
                                onClick={showNodeProperties}
                            >
                                <div className="i-mynaui:cog size-4" />
                            </button>

                            <button
                                type="button"
                                className="size-7 flex items-center justify-center border border-transparent rounded-lg bg-transparent text-red-400 outline-none transition active:(border-dark-200 bg-dark-400/50) hover:(bg-dark-100)"
                                onClick={() => deleteNode(id)}
                            >
                                <div className="i-mynaui:trash size-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col divide-y divide-dark-200">
                    <div className="px-4 py-2">
                        <div className="text-xs text-light-900/50">
                            {isEmpty(data.config.url) ? (
                                <span className="text-light-900/80 italic">No API endpoint configured yet...</span>
                            ) : (
                                <>
                                    {data.config.method} {data.config.url}
                                </>
                            )}
                        </div>
                    </div>

                    {data.error && <div className="px-4 py-2 text-xs text-red-400">Error: {data.error}</div>}

                    {data.response && (
                        <div className="px-4 py-2">
                            <div className="mb-2 text-xs text-light-900/50 font-medium">Response:</div>
                            <div className="max-h-32 overflow-auto text-xs text-light-900/80">{JSON.stringify(data.response, null, 2)}</div>
                        </div>
                    )}

                    {data.response && data.availableArrays && data.availableArrays.length > 0 && (
                        <div className="px-4 py-2">
                            <div className="text-xs text-light-900/50 font-medium mb-2">Available Arrays:</div>
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button type="button" className="h-8 w-full flex items-center justify-between border border-dark-50 rounded-md bg-dark-300 px-2.5 outline-none transition">
                                        <span className="text-xs">Select an array to process</span>
                                        <div className="i-lucide:chevrons-up-down ml-1 size-3 op-50" />
                                    </button>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        align="start"
                                        sideOffset={5}
                                        className="min-w-40 select-none border border-dark-100 rounded-lg bg-dark-200/90 p-0.5 text-light-50 shadow-xl backdrop-blur-lg"
                                    >
                                        {data.availableArrays.map((arrayPath) => (
                                            <DropdownMenu.Item
                                                key={arrayPath}
                                                className="h-8 flex cursor-pointer items-center border border-transparent rounded-lg p-1.5 pr-6 outline-none transition hover:bg-dark-100"
                                                onSelect={() => handleArraySelection(arrayPath)}
                                            >
                                                <div className="text-xs font-medium">{arrayPath}</div>
                                            </DropdownMenu.Item>
                                        ))}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>
                    )}

                    {data.selectedItems && (
                        <div className="px-4 py-2">
                            <div className="text-xs text-light-900/50 font-medium mb-2">Selected Items:</div>
                            <div className="max-h-32 overflow-auto text-xs text-light-900/80">{JSON.stringify(data.selectedItems, null, 2)}</div>
                        </div>
                    )}

                    <div className="bg-dark-300/30 px-4 py-2 text-xs text-light-900/50">
                        Node: <span className="text-light-900/60 font-semibold">#{id}</span>
                    </div>
                </div>
            </div>

            <CustomHandle type="target" id="input" position={Position.Left} isConnectable={isConnectable} />

            {sourceHandles.map((handleId, index) => (
                <CustomHandle key={handleId} type="source" id={handleId} position={Position.Right} isConnectable={isConnectable} style={{ top: `${(index + 1) * 25}%` }} />
            ))}
        </>
    );
}

export const metadata: RegisterNodeMetadata<ApiRequestNodeData> = {
    type: NODE_TYPE,
    node: memo(ApiRequestNode),
    detail: {
        icon: "i-mdi:api",
        title: "API Request",
        description: "Make custom API requests with configurable endpoints, methods, and headers.",
    },
    connection: {
        inputs: 1,
        outputs: 1,
    },
    defaultData: {
        config: {
            url: "",
            method: HttpMethod.GET,
            headers: {},
            outputFields: [],
        },
    },
    propertyPanel: ApiRequestPropertyPanel,
};
