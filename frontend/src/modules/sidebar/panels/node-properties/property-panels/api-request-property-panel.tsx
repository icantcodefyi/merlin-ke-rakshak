import { produce } from "immer";
import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";

import { HttpMethod } from "~/modules/nodes/nodes/api-request-node/api-request.node";
import { BuilderNode } from "~/modules/nodes/types";

interface ApiRequestPropertyPanelProps {
    id: string;
}

export default function ApiRequestPropertyPanel({ id }: ApiRequestPropertyPanelProps) {
    const { setNodes, getNode } = useReactFlow();
    const node = getNode(id);

    const updateConfig = useCallback(
        (updates: Partial<typeof node.data.config>) => {
            setNodes((nodes) =>
                produce(nodes, (draft) => {
                    const node = draft.find((n) => n.id === id);
                    if (node?.type === BuilderNode.API_REQUEST) {
                        (node as any).data.config = {
                            ...(node as any).data.config,
                            ...updates,
                        };
                    }
                }),
            );
        },
        [id, setNodes],
    );

    if (!node || node.type !== BuilderNode.API_REQUEST) {
        return null;
    }

    return (
        <div className="space-y-4 p-4">
            <div>
                <label className="block text-xs font-medium text-light-900/50 mb-1">HTTP Method</label>
                <select
                    className="w-full bg-dark-400 border border-dark-200 rounded-lg px-3 py-2 text-sm outline-none transition focus:(ring-1 ring-yellow-600/50 border-yellow-600)"
                    value={node.data.config.method}
                    onChange={(e) => updateConfig({ method: e.target.value as HttpMethod })}
                >
                    {Object.values(HttpMethod).map((method) => (
                        <option key={method} value={method}>
                            {method}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-light-900/50 mb-1">API Endpoint URL</label>
                <input
                    type="text"
                    className="w-full bg-dark-400 border border-dark-200 rounded-lg px-3 py-2 text-sm outline-none transition focus:(ring-1 ring-yellow-600/50 border-yellow-600)"
                    value={node.data.config.url}
                    onChange={(e) => updateConfig({ url: e.target.value })}
                    placeholder="https://api.example.com/endpoint"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-light-900/50 mb-1">Headers</label>
                <div className="space-y-2">
                    {Object.entries(node.data.config.headers).map(([key, value], index) => (
                        <div key={index} className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-dark-400 border border-dark-200 rounded-lg px-3 py-2 text-sm outline-none transition focus:(ring-1 ring-yellow-600/50 border-yellow-600)"
                                value={key}
                                onChange={(e) => {
                                    const newHeaders = { ...node.data.config.headers };
                                    delete newHeaders[key];
                                    newHeaders[e.target.value] = value;
                                    updateConfig({ headers: newHeaders });
                                }}
                                placeholder="Header name"
                            />
                            <input
                                type="text"
                                className="flex-1 bg-dark-400 border border-dark-200 rounded-lg px-3 py-2 text-sm outline-none transition focus:(ring-1 ring-yellow-600/50 border-yellow-600)"
                                value={value as string}
                                onChange={(e) => {
                                    const newHeaders = { ...node.data.config.headers };
                                    newHeaders[key] = e.target.value;
                                    updateConfig({ headers: newHeaders });
                                }}
                                placeholder="Header value"
                            />
                            <button
                                type="button"
                                className="size-10 flex items-center justify-center border border-dark-200 rounded-lg bg-dark-400 text-red-400 outline-none transition hover:bg-dark-300"
                                onClick={() => {
                                    const newHeaders = { ...node.data.config.headers };
                                    delete newHeaders[key];
                                    updateConfig({ headers: newHeaders });
                                }}
                            >
                                <div className="i-lucide:x size-4" />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="w-full h-10 flex items-center justify-center border border-dark-200 rounded-lg bg-dark-400 outline-none transition hover:bg-dark-300"
                        onClick={() => {
                            const newHeaders = { ...node.data.config.headers, "": "" };
                            updateConfig({ headers: newHeaders });
                        }}
                    >
                        <div className="i-lucide:plus size-4 mr-2" />
                        Add Header
                    </button>
                </div>
            </div>

            {node.data.config.method !== HttpMethod.GET && (
                <div>
                    <label className="block text-xs font-medium text-light-900/50 mb-1">Request Body (JSON)</label>
                    <textarea
                        className="w-full h-32 bg-dark-400 border border-dark-200 rounded-lg px-3 py-2 text-sm outline-none transition focus:(ring-1 ring-yellow-600/50 border-yellow-600)"
                        value={node.data.config.body}
                        onChange={(e) => updateConfig({ body: e.target.value })}
                        placeholder="{}"
                    />
                </div>
            )}

            <div>
                <label className="block text-xs font-medium text-light-900/50 mb-1">Output Fields (one per line)</label>
                <textarea
                    className="w-full h-32 bg-dark-400 border border-dark-200 rounded-lg px-3 py-2 text-sm outline-none transition focus:(ring-1 ring-yellow-600/50 border-yellow-600)"
                    value={node.data.config.outputFields.join("\n")}
                    onChange={(e) => updateConfig({ outputFields: e.target.value.split("\n").filter(Boolean) })}
                    placeholder="response.data.id&#10;response.data.name&#10;response.status"
                />
                <p className="mt-1 text-xs text-light-900/50">Enter JSON paths to extract from the response. Each field will create an output handle.</p>
            </div>
        </div>
    );
}
