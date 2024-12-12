import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type Node, Position, useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { nanoid } from "nanoid";
import { isEmpty } from "radash";
import { type ChangeEvent, memo, useCallback, useMemo, useState } from "react";

import CustomHandle from "~/modules/flow-builder/components/handles/custom-handle";
import { useDeleteNode } from "~/modules/flow-builder/hooks/use-delete-node";
import { type BaseNodeData, BuilderNode } from "~/modules/nodes/types";
import { useApplicationState } from "~/stores/application-state";

import { cn } from "~@/utils/cn";

export enum LLMMode {
    CONTENT_GENERATION = "content-generation",
    SUMMARIZATION = "summarization",
    TRANSLATION = "translation",
}

interface LLMNodeData extends BaseNodeData {
    mode: LLMMode;
    input?: string;
    output?: string;
    targetLanguage?: string;
    contentType?: string;
}

const NODE_TYPE = BuilderNode.LLM;

export function LLMNode({
    id,
    data,
    selected,
    isConnectable,
}: {
    id: string;
    data: LLMNodeData;
    selected: boolean;
    isConnectable?: boolean;
}) {
    const meta = useMemo(() => ({ icon: "i-material-symbols-robot-2-outline", title: "LLM Processing" }), []);
    const [sourceHandleId] = useState<string>(nanoid());
    const { setNodes } = useReactFlow();
    const deleteNode = useDeleteNode();
    const [showNodePropertiesOf] = useApplicationState(s => [s.actions.sidebar.showNodePropertiesOf]);

    const handleModeChange = useCallback(
        (mode: LLMMode) => {
            setNodes((nodes: Node[]) =>
                produce(nodes, (draft: Node[]) => {
                    const node = draft.find((n: Node) => n.id === id);
                    if (node) {
                        (node.data as LLMNodeData).mode = mode;
                    }
                }),
            );
        },
        [id, setNodes],
    );

    const showNodeProperties = useCallback(() => {
        showNodePropertiesOf({ id, type: NODE_TYPE });
    }, [id, showNodePropertiesOf]);

    return (
        <>
            <div
                data-selected={selected}
                className="w-xs overflow-clip border border-dark-200 rounded-xl bg-dark-300/50 shadow-sm backdrop-blur-xl transition divide-y divide-dark-200 data-[selected=true]:(border-indigo-600 ring-1 ring-indigo-600/50)"
                onDoubleClick={showNodeProperties}
            >
                <div className="relative bg-dark-300/50">
                    <div className="absolute inset-0">
                        <div className="absolute h-full w-3/5 from-teal-900/20 to-transparent bg-gradient-to-r" />
                    </div>

                    <div className="relative h-9 flex items-center justify-between gap-x-4 px-0.5 py-0.5">
                        <div className="flex grow items-center pl-0.5">
                            <div className="size-7 flex items-center justify-center">
                                <div className="size-6 flex items-center justify-center rounded-lg">
                                    <div className={cn(meta.icon, "size-4")} />
                                </div>
                            </div>

                            <div className="ml-1 text-xs font-medium leading-none tracking-wide uppercase op-80">
                                <span className="translate-y-px">{meta.title}</span>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-x-0.5 pr-0.5">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="h-7 flex items-center justify-center border border-transparent rounded-lg bg-transparent px-1.2 outline-none transition active:(border-dark-200 bg-dark-400/50) data-[state=open]:(border-dark-200 bg-dark-500) data-[state=closed]:(hover:bg-dark-100)">
                                        <div className={cn("i-mynaui:magic-wand", "size-4")} />
                                        <div className="i-lucide:chevrons-up-down ml-1 size-3 op-50" />
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        sideOffset={5}
                                        className={cn(
                                            "min-w-40 select-none border border-dark-100 rounded-lg bg-dark-200/90 p-0.5 text-light-50 shadow-xl backdrop-blur-lg transition",
                                            "animate-in data-[side=top]:slide-in-bottom-0.5 data-[side=bottom]:slide-in-bottom--0.5 data-[side=bottom]:fade-in-40 data-[side=top]:fade-in-40",
                                        )}
                                    >
                                        <DropdownMenu.Item
                                            className="cursor-pointer rounded-md p-2 text-sm outline-none data-[highlighted]:bg-white/10 hover:bg-white/10"
                                            onClick={() => handleModeChange(LLMMode.CONTENT_GENERATION)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mynaui:edit size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Content Generation
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            className="cursor-pointer rounded-md p-2 text-sm outline-none data-[highlighted]:bg-white/10 hover:bg-white/10"
                                            onClick={() => handleModeChange(LLMMode.SUMMARIZATION)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mynaui:compress size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Text Summarization
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            className="cursor-pointer rounded-md p-2 text-sm outline-none data-[highlighted]:bg-white/10 hover:bg-white/10"
                                            onClick={() => handleModeChange(LLMMode.TRANSLATION)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mynaui:translate size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Language Translation
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>

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
                    <div className="flex flex-col p-4">
                        <div className="text-xs text-light-900/50 font-medium">
                            {data.mode === LLMMode.CONTENT_GENERATION ? "Content Type" : data.mode === LLMMode.TRANSLATION ? "Target Language" : "Input Text"}
                        </div>
                        <div className="line-clamp-4 mt-2 text-sm leading-snug">
                            {data.mode === LLMMode.CONTENT_GENERATION
                                ? (
                                        isEmpty(data.contentType)
                                            ? (
                                                    <span className="text-light-900/80 italic">No content type selected...</span>
                                                )
                                            : (
                                                    data.contentType
                                                )
                                    )
                                : data.mode === LLMMode.TRANSLATION
                                    ? (
                                            isEmpty(data.targetLanguage)
                                                ? (
                                                        <span className="text-light-900/80 italic">No target language selected...</span>
                                                    )
                                                : (
                                                        data.targetLanguage
                                                    )
                                        )
                                    : isEmpty(data.input)
                                        ? (
                                                <span className="text-light-900/80 italic">No input text yet...</span>
                                            )
                                        : (
                                                data.input
                                            )}
                        </div>
                    </div>
                </div>
            </div>
            <CustomHandle type="target" position={Position.Left} id="in" isConnectable={isConnectable} />
            <CustomHandle type="source" position={Position.Right} id={sourceHandleId} isConnectable={isConnectable} />
        </>
    );
}

export function LLMPropertyPanel({
    id,
    data,
}: {
    id: string;
    data: LLMNodeData;
}) {
    const { setNodes } = useReactFlow();

    const handleInputChange = (value: string) => {
        setNodes((nodes: Node[]) =>
            produce(nodes, (draft: Node[]) => {
                const node = draft.find((n: Node) => n.id === id);
                if (node) {
                    (node.data as LLMNodeData).input = value;
                }
            }),
        );
    };

    const handleSettingChange = (key: keyof LLMNodeData, value: string) => {
        setNodes((nodes: Node[]) =>
            produce(nodes, (draft: Node[]) => {
                const node = draft.find((n: Node) => n.id === id);
                if (node) {
                    (node.data as LLMNodeData)[key] = value;
                }
            }),
        );
    };

    return (
        <div className="flex flex-col gap-4 p-4">
            <div>
                <label className="mb-2 block text-sm font-medium">Input Text</label>
                <textarea
                    value={data.input || ""}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleInputChange(e.target.value)}
                    placeholder={
                        data.mode === LLMMode.CONTENT_GENERATION
                            ? "Enter topic or keywords..."
                            : data.mode === LLMMode.SUMMARIZATION
                                ? "Enter text to summarize..."
                                : "Enter text to translate..."
                    }
                    className="h-32"
                />
            </div>

            {data.mode === LLMMode.TRANSLATION && (
                <div>
                    <label className="mb-2 block text-sm font-medium">Target Language</label>
                    <select
                        value={data.targetLanguage || ""}
                        onChange={e => handleSettingChange("targetLanguage", e.target.value)}
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm"
                    >
                        <option value="">Select language</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="it">Italian</option>
                        <option value="pt">Portuguese</option>
                    </select>
                </div>
            )}

            {data.mode === LLMMode.CONTENT_GENERATION && (
                <div>
                    <label className="mb-2 block text-sm font-medium">Content Type</label>
                    <select
                        value={data.contentType || ""}
                        onChange={e => handleSettingChange("contentType", e.target.value)}
                        className="w-full rounded-md bg-zinc-800 px-3 py-2 text-sm"
                    >
                        <option value="">Select type</option>
                        <option value="blog">Blog Post</option>
                        <option value="email">Email</option>
                        <option value="product">Product Description</option>
                    </select>
                </div>
            )}
        </div>
    );
}

export const metadata = {
    type: NODE_TYPE,
    node: memo(LLMNode),
    detail: {
        icon: "i-material-symbols-robot-2-outline",
        title: "LLM Processing",
        description: "Process text using LLM for various tasks like content generation, summarization, and translation.",
    },
    connection: {
        inputs: 1,
        outputs: 1,
    },
    available: true,
    defaultData: {
        mode: LLMMode.CONTENT_GENERATION,
    },
    propertyPanel: LLMPropertyPanel,
};
