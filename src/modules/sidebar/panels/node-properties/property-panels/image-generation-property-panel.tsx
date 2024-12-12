import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMemo } from "react";

import type { ImageGenerationNodeData } from "~/modules/nodes/nodes/image-generation-node/image-generation.node";
import type { BuilderNodeType } from "~/modules/nodes/types";

import { cn } from "~@/utils/cn";

enum ImageGenerationModel {
    DALL_E = "dall-e",
    STABLE_DIFFUSION = "stable-diffusion",
    MIDJOURNEY = "midjourney",
}

const ImageGenerationModels = {
    [ImageGenerationModel.DALL_E]: {
        name: "DALL-E",
        icon: "i-simple-icons:openai",
        sizes: ["1024x1024", "1024x1792", "1792x1024"],
        styles: ["vivid", "natural"],
    },
    [ImageGenerationModel.STABLE_DIFFUSION]: {
        name: "Stable Diffusion",
        icon: "i-simple-icons:openbadges",
        sizes: ["512x512", "768x768", "1024x1024"],
        styles: ["anime", "photographic", "digital-art", "comic-book"],
    },
    [ImageGenerationModel.MIDJOURNEY]: {
        name: "Midjourney",
        icon: "i-simple-icons:boat",
        sizes: ["1024x1024", "1024x1408", "1408x1024"],
        styles: ["raw", "steampunk", "synthwave", "cyberpunk"],
    },
} as const;

type ImageGenerationPropertyPanelProps = Readonly<{
    id: string;
    type: BuilderNodeType;
    data: ImageGenerationNodeData;
    updateData: (data: Partial<ImageGenerationNodeData>) => void;
}>;

export default function ImageGenerationPropertyPanel({ id, data, updateData }: ImageGenerationPropertyPanelProps) {
    const currentModel = useMemo(() => {
        return ImageGenerationModels[data.config.model];
    }, [data.config.model]);

    const updateConfig = (config: Partial<typeof data.config>) => {
        updateData({
            config: {
                ...data.config,
                ...config,
            },
        });
    };

    return (
        <div className="flex flex-col gap-4.5 p-4">
            <div className="flex flex-col">
                <div className="text-xs text-light-900/60 font-semibold">
                    Unique Identifier
                </div>

                <div className="mt-2 flex">
                    <input
                        type="text"
                        value={id}
                        readOnly
                        className="h-8 w-full border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm font-medium shadow-sm outline-none transition hover:(bg-dark-300/60) read-only:(text-light-900/80 op-80 hover:bg-dark-300/30)"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="text-xs text-light-900/60 font-semibold">
                    Model
                </div>

                <div className="mt-2 flex">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className="h-8 w-full flex items-center justify-between border border-dark-200 rounded-md bg-dark-400 px-2.5 shadow-sm outline-none transition active:(border-dark-200 bg-dark-400/50) data-[state=open]:(border-dark-200 bg-dark-500) data-[state=closed]:(hover:bg-dark-300/60)"
                            >
                                <div className="flex items-center">
                                    <div className={cn(currentModel.icon, "size-4")} />

                                    <div className="ml-2 text-sm font-medium leading-none tracking-wide">
                                        {currentModel.name}
                                    </div>
                                </div>

                                <div className="i-lucide:chevrons-up-down ml-1 size-3 op-50" />
                            </button>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Portal>
                            <DropdownMenu.Content
                                sideOffset={5}
                                align="start"
                                className={cn(
                                    "[width:var(--radix-popper-anchor-width)] select-none border border-dark-100 rounded-lg bg-dark-200/90 p-0.5 text-light-50 shadow-xl backdrop-blur-lg transition",
                                    "animate-in data-[side=top]:slide-in-bottom-0.5 data-[side=bottom]:slide-in-bottom--0.5 data-[side=bottom]:fade-in-40 data-[side=top]:fade-in-40",
                                )}
                            >
                                {Object.entries(ImageGenerationModels).map(([model, details]) => (
                                    <DropdownMenu.Item
                                        key={model}
                                        className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300/60) hover:bg-dark-100"
                                        onSelect={() => updateConfig({ model: model as ImageGenerationModel })}
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
                </div>
            </div>

            <div className="flex flex-col">
                <div className="text-xs text-light-900/60 font-semibold">
                    Prompt
                </div>

                <div className="mt-2 flex">
                    <textarea
                        value={data.config.prompt}
                        onChange={e => updateConfig({ prompt: e.target.value })}
                        placeholder="Enter prompt for image generation..."
                        className="min-h-30 w-full resize-none border border-dark-200 rounded-md bg-dark-400 px-2.5 py-2 text-sm font-medium shadow-sm outline-none transition focus:(border-teal-800 bg-dark-500 ring-2 ring-teal-800/50) hover:(bg-dark-300/60) placeholder:(text-light-900/50 font-normal italic)"
                    />
                </div>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center justify-between">
                    <div className="text-xs text-light-900/60 font-semibold">
                        Auto Configuration
                    </div>
                    <button
                        type="button"
                        className={cn(
                            "relative h-5 w-9 rounded-full transition-colors",
                            data.config.isAuto ? "bg-teal-600" : "bg-dark-200",
                        )}
                        onClick={() => updateConfig({ isAuto: !data.config.isAuto })}
                    >
                        <span
                            className={cn(
                                "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform",
                                data.config.isAuto && "translate-x-4",
                            )}
                        />
                    </button>
                </div>
                {data.config.isAuto && (
                    <div className="mt-2 text-xs text-light-900/50 italic">
                        AI will automatically optimize the number of images, size, and style based on your prompt and use case.
                    </div>
                )}
            </div>

            {!data.config.isAuto && (
                <>
                    <div className="flex flex-col">
                        <div className="text-xs text-light-900/60 font-semibold">
                            Negative Prompt (Optional)
                        </div>

                        <div className="mt-2 flex">
                            <textarea
                                value={data.config.negativePrompt}
                                onChange={e => updateConfig({ negativePrompt: e.target.value })}
                                placeholder="Enter things to avoid in the generated image..."
                                className="min-h-20 w-full resize-none border border-dark-200 rounded-md bg-dark-400 px-2.5 py-2 text-sm font-medium shadow-sm outline-none transition focus:(border-teal-800 bg-dark-500 ring-2 ring-teal-800/50) hover:(bg-dark-300/60) placeholder:(text-light-900/50 font-normal italic)"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="text-xs text-light-900/60 font-semibold">
                            Number of Images
                        </div>

                        <div className="mt-2 flex">
                            <input
                                type="number"
                                min={1}
                                max={10}
                                value={data.config.numImages}
                                onChange={e => updateConfig({ numImages: Math.max(1, Math.min(10, Number.parseInt(e.target.value) || 1)) })}
                                className="h-8 w-full border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm font-medium shadow-sm outline-none transition focus:(border-teal-800 bg-dark-500 ring-2 ring-teal-800/50) hover:(bg-dark-300/60)"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="text-xs text-light-900/60 font-semibold">
                            Size
                        </div>

                        <div className="mt-2 flex">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        type="button"
                                        className="h-8 w-full flex items-center justify-between border border-dark-200 rounded-md bg-dark-400 px-2.5 shadow-sm outline-none transition active:(border-dark-200 bg-dark-400/50) data-[state=open]:(border-dark-200 bg-dark-500) data-[state=closed]:(hover:bg-dark-300/60)"
                                    >
                                        <div className="text-sm font-medium leading-none tracking-wide">
                                            {data.config.size}
                                        </div>

                                        <div className="i-lucide:chevrons-up-down ml-1 size-3 op-50" />
                                    </button>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        sideOffset={5}
                                        align="start"
                                        className={cn(
                                            "[width:var(--radix-popper-anchor-width)] select-none border border-dark-100 rounded-lg bg-dark-200/90 p-0.5 text-light-50 shadow-xl backdrop-blur-lg transition",
                                            "animate-in data-[side=top]:slide-in-bottom-0.5 data-[side=bottom]:slide-in-bottom--0.5 data-[side=bottom]:fade-in-40 data-[side=top]:fade-in-40",
                                        )}
                                    >
                                        {currentModel.sizes.map(size => (
                                            <DropdownMenu.Item
                                                key={size}
                                                className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300/60) hover:bg-dark-100"
                                                onSelect={() => updateConfig({ size })}
                                            >
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    {size}
                                                </div>
                                            </DropdownMenu.Item>
                                        ))}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <div className="text-xs text-light-900/60 font-semibold">
                            Style
                        </div>

                        <div className="mt-2 flex">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button
                                        type="button"
                                        className="h-8 w-full flex items-center justify-between border border-dark-200 rounded-md bg-dark-400 px-2.5 shadow-sm outline-none transition active:(border-dark-200 bg-dark-400/50) data-[state=open]:(border-dark-200 bg-dark-500) data-[state=closed]:(hover:bg-dark-300/60)"
                                    >
                                        <div className="text-sm font-medium leading-none tracking-wide capitalize">
                                            {data.config.style}
                                        </div>

                                        <div className="i-lucide:chevrons-up-down ml-1 size-3 op-50" />
                                    </button>
                                </DropdownMenu.Trigger>

                                <DropdownMenu.Portal>
                                    <DropdownMenu.Content
                                        sideOffset={5}
                                        align="start"
                                        className={cn(
                                            "[width:var(--radix-popper-anchor-width)] select-none border border-dark-100 rounded-lg bg-dark-200/90 p-0.5 text-light-50 shadow-xl backdrop-blur-lg transition",
                                            "animate-in data-[side=top]:slide-in-bottom-0.5 data-[side=bottom]:slide-in-bottom--0.5 data-[side=bottom]:fade-in-40 data-[side=top]:fade-in-40",
                                        )}
                                    >
                                        {currentModel.styles.map(style => (
                                            <DropdownMenu.Item
                                                key={style}
                                                className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300/60) hover:bg-dark-100"
                                                onSelect={() => updateConfig({ style })}
                                            >
                                                <div className="text-xs font-medium leading-none tracking-wide capitalize">
                                                    {style}
                                                </div>
                                            </DropdownMenu.Item>
                                        ))}
                                    </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                            </DropdownMenu.Root>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
