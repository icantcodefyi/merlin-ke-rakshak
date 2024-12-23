import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useMemo } from "react";

import type { GoogleIntegrationNodeData, GoogleIntegrationType, GoogleSheetsConfig } from "~/modules/nodes/nodes/google-integration-node/google-integration.node";
import type { BuilderNodeType } from "~/modules/nodes/types";

import { cn } from "~@/utils/cn";

const GoogleIntegrationTypes = {
    docs: {
        name: "Google Docs",
        icon: "i-mdi:file-document",
        type: "docs" as GoogleIntegrationType,
    },
    sheets: {
        name: "Google Sheets",
        icon: "i-mdi:google-spreadsheet",
        type: "sheets" as GoogleIntegrationType,
    },
    slides: {
        name: "Google Slides",
        icon: "i-mdi:presentation-play",
        type: "slides" as GoogleIntegrationType,
    },
} as const;

type GoogleIntegrationPropertyPanelProps = Readonly<{
    id: string;
    type: BuilderNodeType;
    data: GoogleIntegrationNodeData;
    updateData: (data: Partial<GoogleIntegrationNodeData>) => void;
}>;

export default function GoogleIntegrationPropertyPanel({ id, data, updateData }: GoogleIntegrationPropertyPanelProps) {
    const currentIntegrationType = useMemo(() => {
        return GoogleIntegrationTypes[data.type];
    }, [data.type]);

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
                    Integration Type
                </div>

                <div className="mt-2 flex">
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                            <button
                                type="button"
                                className="h-8 w-full flex items-center justify-between border border-dark-200 rounded-md bg-dark-400 px-2.5 shadow-sm outline-none transition active:(border-dark-200 bg-dark-400/50) data-[state=open]:(border-dark-200 bg-dark-500) data-[state=closed]:(hover:bg-dark-300/60)"
                            >
                                <div className="flex items-center">
                                    <div className={cn(currentIntegrationType.icon, "size-4")} />

                                    <div className="ml-2 text-sm font-medium leading-none tracking-wide">
                                        {currentIntegrationType.name}
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
                                {Object.entries(GoogleIntegrationTypes).map(([key, details]) => (
                                    <DropdownMenu.Item
                                        key={key}
                                        className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300/60) hover:bg-dark-100"
                                        onSelect={() => updateData({
                                            type: details.type,
                                            config: details.type === "sheets"
                                                ? { link: "", columns: [] }
                                                : { link: "" },
                                        })}
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
                    {data.type === "sheets" 
                        ? "Google Sheets Link" 
                        : data.type === "docs"
                            ? "Google Docs Link"
                            : "Google Slides Link"}
                </div>

                <div className="mt-2 flex">
                    <input
                        type="text"
                        value={data.config.link}
                        onChange={e => updateConfig({ link: e.target.value })}
                        placeholder={
                            data.type === "sheets" 
                                ? "Enter Google Sheets link..." 
                                : data.type === "docs"
                                    ? "Enter Google Docs link..."
                                    : "Enter Google Slides link..."
                        }
                        className="h-8 w-full border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm font-medium shadow-sm outline-none transition focus:(border-teal-800 bg-dark-500 ring-2 ring-teal-800/50) hover:(bg-dark-300/60) placeholder:(text-light-900/50 font-normal italic)"
                    />
                </div>
            </div>

            {data.type === "sheets" && (
                <div className="flex flex-col">
                    <div className="text-xs text-light-900/60 font-semibold">
                        Columns (comma-separated)
                    </div>

                    <div className="mt-2 flex">
                        <input
                            type="text"
                            value={(data.config as GoogleSheetsConfig).columns.join(", ")}
                            onChange={e => updateConfig({ columns: e.target.value.split(",").map(c => c.trim()) })}
                            placeholder="Enter column names..."
                            className="h-8 w-full border border-dark-200 rounded-md bg-dark-400 px-2.5 text-sm font-medium shadow-sm outline-none transition focus:(border-teal-800 bg-dark-500 ring-2 ring-teal-800/50) hover:(bg-dark-300/60) placeholder:(text-light-900/50 font-normal italic)"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
