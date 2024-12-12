import { type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { produce } from "immer";
import { nanoid } from "nanoid";
import { isEmpty } from "radash";
import { memo, useCallback, useMemo, useState } from "react";

import CustomHandle from "~/modules/flow-builder/components/handles/custom-handle";
import { useDeleteNode } from "~/modules/flow-builder/hooks/use-delete-node";
import { type BaseNodeData, BuilderNode, type RegisterNodeMetadata } from "~/modules/nodes/types";
import { getNodeDetail } from "~/modules/nodes/utils";
import ImageGenerationPropertyPanel from "~/modules/sidebar/panels/node-properties/property-panels/image-generation-property-panel";
import { useApplicationState } from "~/stores/application-state";

import { cn } from "~@/utils/cn";

export enum ImageGenerationModel {
    DALL_E = "dall-e",
    STABLE_DIFFUSION = "stable-diffusion",
    MIDJOURNEY = "midjourney",
}

export interface ImageGenerationConfig {
    model: ImageGenerationModel;
    prompt: string;
    numImages: number;
    size: string;
    style: string;
    negativePrompt?: string;
    isAuto: boolean;
}

export interface ImageGenerationNodeData extends BaseNodeData {
    config: ImageGenerationConfig;
}

const NODE_TYPE = BuilderNode.IMAGE_GENERATION;

type ImageGenerationNodeProps = NodeProps<Node<ImageGenerationNodeData, typeof NODE_TYPE>>;

const ImageGenerationModels = {
    [ImageGenerationModel.DALL_E]: {
        name: "DALL-E",
        icon: "i-simple-icons:openai",
    },
    [ImageGenerationModel.STABLE_DIFFUSION]: {
        name: "Stable Diffusion",
        icon: "i-simple-icons:openbadges",
    },
    [ImageGenerationModel.MIDJOURNEY]: {
        name: "Midjourney",
        icon: "i-simple-icons:boat",
    },
} as const;

export function ImageGenerationNode({ id, isConnectable, selected, data }: ImageGenerationNodeProps) {
    const meta = useMemo(() => getNodeDetail(NODE_TYPE), []);
    const [sourceHandleId] = useState<string>(nanoid());
    const deleteNode = useDeleteNode();
    const [showNodePropertiesOf] = useApplicationState(s => [s.actions.sidebar.showNodePropertiesOf]);
    const instance = useReactFlow();

    const showNodeProperties = useCallback(() => {
        showNodePropertiesOf({ id, type: NODE_TYPE });
    }, [id, showNodePropertiesOf]);

    const updateModel = useCallback((model: ImageGenerationModel) => {
        instance.setNodes((nodes) =>
            produce(nodes, (draft) => {
                const node = draft.find(n => n.id === id) as Node<ImageGenerationNodeData>;
                if (node) {
                    node.data.config.model = model;
                }
            }),
        );
    }, [id, instance]);

    const getModelIcon = (model: ImageGenerationModel) => {
        switch (model) {
            case ImageGenerationModel.DALL_E:
                return "i-simple-icons:openai";
            case ImageGenerationModel.STABLE_DIFFUSION:
                return "i-simple-icons:openbadges";
            case ImageGenerationModel.MIDJOURNEY:
                return "i-simple-icons:boat";
        }
    };

    return (
        <>
            <div
                data-selected={selected}
                className="w-xs overflow-clip border border-dark-200 rounded-xl bg-dark-300/50 shadow-sm backdrop-blur-xl transition divide-y divide-dark-200 data-[selected=true]:(border-teal-600 ring-1 ring-teal-600/50)"
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
                                <span className="translate-y-px">
                                    {meta.title}
                                </span>
                            </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-x-0.5 pr-0.5">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        type="button"
                                        className="h-7 flex items-center justify-center border border-transparent rounded-lg bg-transparent px-1.2 outline-none transition active:(border-dark-200 bg-dark-400/50) data-[state=open]:(border-dark-200 bg-dark-500) data-[state=closed]:(hover:bg-dark-100)"
                                    >
                                        <div className={cn(getModelIcon(data.config.model), "size-4")} />
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
                                        {Object.entries(ImageGenerationModels).map(([model, details]) => (
                                            <DropdownMenu.Item
                                                key={model}
                                                className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300) hover:bg-dark-100"
                                                onSelect={() => updateModel(model as ImageGenerationModel)}
                                            >
                                                <div className="flex items-center gap-x-2">
                                                    <div className={cn(details.icon, "size-4")} />
                                                    <div className="text-xs font-medium leading-none tracking-wide">
                                                        {details.name}
                                                    </div>
                                                </div>
                                            </DropdownMenu.Item>
                                        ))}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>

                            <button
                                type="button"
                                className="size-7 flex items-center justify-center border border-transparent rounded-lg bg-transparent outline-none transition active:(border-dark-200 bg-dark-400/50) hover:(bg-dark-100)"
                                onClick={() => showNodeProperties()}
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
                            Prompt
                        </div>
                        <div className="line-clamp-4 mt-2 text-sm leading-snug">
                            {isEmpty(data.config.prompt)
                                ? <span className="text-light-900/80 italic">No prompt yet...</span>
                                : data.config.prompt}
                        </div>

                        {!isEmpty(data.config.negativePrompt) && (
                            <>
                                <div className="mt-4 text-xs text-light-900/50 font-medium">
                                    Negative Prompt
                                </div>
                                <div className="line-clamp-2 mt-2 text-sm leading-snug">
                                    {data.config.negativePrompt}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="px-4 py-2">
                        <div className="text-xs text-light-900/50">
                            {data.config.isAuto
                                ? (
                                        <span className="flex items-center gap-1">
                                            <div className="i-lucide:sparkles size-3.5" />
                                            Auto configuration enabled
                                        </span>
                                    )
                                : (
                                        <>
                                            {"Will generate "}
                                            {data.config.numImages}
                                            {" image"}
                                            {data.config.numImages > 1 ? "s" : ""}
                                            {" using "}
                                            {data.config.model}
                                            {" ("}
                                            {data.config.size}
                                            )
                                        </>
                                    )}
                        </div>
                    </div>

                    <div className="bg-dark-300/30 px-4 py-2 text-xs text-light-900/50">
                        {"Node: "}
                        <span className="text-light-900/60 font-semibold">
                            #
                            {id}
                        </span>
                    </div>
                </div>
            </div>

            <CustomHandle
                type="target"
                id={sourceHandleId}
                position={Position.Left}
                isConnectable={isConnectable}
            />

            <CustomHandle
                type="source"
                id={sourceHandleId}
                position={Position.Right}
                isConnectable={isConnectable}
            />
        </>
    );
}

export const metadata: RegisterNodeMetadata<ImageGenerationNodeData> = {
    type: NODE_TYPE,
    node: memo(ImageGenerationNode),
    detail: {
        icon: "i-solar:gallery-wide-bold",
        title: "Image Generation",
        description: "Generate images using AI models like DALL-E, Stable Diffusion, or Midjourney.",
    },
    connection: {
        inputs: 1,
        outputs: 1,
    },
    defaultData: {
        config: {
            model: ImageGenerationModel.DALL_E,
            prompt: "",
            numImages: 1,
            size: "1024x1024",
            style: "vivid",
            isAuto: false,
        },
    },
    propertyPanel: ImageGenerationPropertyPanel,
};
