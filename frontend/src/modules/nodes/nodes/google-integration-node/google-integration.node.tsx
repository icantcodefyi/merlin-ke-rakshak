import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { nanoid } from "nanoid";
import { isEmpty } from "radash";
import { memo, useCallback, useMemo, useState } from "react";

import CustomHandle from "~/modules/flow-builder/components/handles/custom-handle";
import { useDeleteNode } from "~/modules/flow-builder/hooks/use-delete-node";
import { type BaseNodeData, BuilderNode, type RegisterNodeMetadata } from "~/modules/nodes/types";
import { getNodeDetail } from "~/modules/nodes/utils";
import GoogleIntegrationPropertyPanel from "~/modules/sidebar/panels/node-properties/property-panels/google-integration-property-panel";
import { useApplicationState } from "~/stores/application-state";

import { cn } from "~@/utils/cn";

export enum GoogleIntegrationType {
    DOCS = "docs",
    SHEETS = "sheets",
}

export interface GoogleDocsConfig {
    link: string;
}

export interface GoogleSheetsConfig {
    link: string;
    columns: string[];
}

export interface GoogleIntegrationNodeData extends BaseNodeData {
    type: GoogleIntegrationType;
    config: GoogleDocsConfig | GoogleSheetsConfig;
}

const NODE_TYPE = BuilderNode.GOOGLE_INTEGRATION;

interface FlowNode {
    id: string;
    data: GoogleIntegrationNodeData;
    [key: string]: any;
}

type GoogleIntegrationNodeProps = NodeProps<GoogleIntegrationNodeData>;

export function GoogleIntegrationNode({ id, isConnectable, selected, data }: GoogleIntegrationNodeProps) {
    const meta = useMemo(() => getNodeDetail(NODE_TYPE), []);
    const [sourceHandleId] = useState<string>(nanoid());
    const { setNodes } = useReactFlow();
    const deleteNode = useDeleteNode();
    const [showNodePropertiesOf] = useApplicationState(s => [s.actions.sidebar.showNodePropertiesOf]);

    const onTypeChange = useCallback(
        (type: GoogleIntegrationType) => {
            setNodes((nodes: FlowNode[]) => produce(nodes, (draft: FlowNode[]) => {
                const node = draft.find((n: FlowNode) => n.id === id);
                if (node) {
                    node.data.type = type;
                    node.data.config = type === GoogleIntegrationType.DOCS
                        ? { link: "" }
                        : { link: "", columns: [] };
                }
            }));
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
                className="w-xs overflow-clip border border-dark-200 rounded-xl bg-dark-300/50 shadow-sm backdrop-blur-xl transition divide-y divide-dark-200 data-[selected=true]:(border-sky-600 ring-1 ring-sky-600/50)"
                onDoubleClick={showNodeProperties}
            >
                <div className="relative bg-dark-300/50">
                    <div className="absolute inset-0">
                        <div className="absolute h-full w-3/5 from-sky-900/20 to-transparent bg-gradient-to-r" />
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
                                        <div className={cn(data.type === GoogleIntegrationType.DOCS ? "i-mdi:file-document" : "i-mdi:google-spreadsheet", "size-4")} />
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
                                            className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300) hover:bg-dark-100"
                                            onSelect={() => onTypeChange(GoogleIntegrationType.DOCS)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mdi:file-document size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Google Docs
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300) hover:bg-dark-100"
                                            onSelect={() => onTypeChange(GoogleIntegrationType.SHEETS)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mdi:google-spreadsheet size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Google Sheets
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
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
                    {data.type === GoogleIntegrationType.SHEETS && (
                        <div className="flex flex-col p-4">
                            <div className="text-xs text-light-900/50 font-medium">
                                Columns
                            </div>
                            <div className="line-clamp-2 mt-2 text-sm leading-snug">
                                {isEmpty((data.config as GoogleSheetsConfig).columns)
                                    ? (
                                            <span className="text-light-900/80 italic">No columns selected yet...</span>
                                        )
                                    : (
                                            (data.config as GoogleSheetsConfig).columns.join(", ")
                                        )}
                            </div>
                        </div>
                    )}

                    <div className="px-4 py-2">
                        <div className="text-xs text-light-900/50">
                            {isEmpty(data.config.link)
                                ? (
                                        <span className="text-light-900/80 italic">
                                            No Google
                                            {data.type === GoogleIntegrationType.DOCS ? "Docs" : "Sheets"}
                                            {" "}
                                            link provided yet...
                                        </span>
                                    )
                                : (
                                        <>
                                            Using Google
                                            {data.type === GoogleIntegrationType.DOCS ? "Docs" : "Sheets"}
                                            {" "}
                                            for integration.
                                        </>
                                    )}
                        </div>
                    </div>

                    <div className="bg-dark-300/30 px-4 py-2 text-xs text-light-900/50">
                        Node:
                        {" "}
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

export const metadata: RegisterNodeMetadata<GoogleIntegrationNodeData> = {
    type: NODE_TYPE,
    node: memo(GoogleIntegrationNode),
    detail: {
        icon: "i-mdi:google",
        title: "Google Integration",
        description: "Integrate with Google Docs or Sheets to process documents and data.",
    },
    connection: {
        inputs: 1,
        outputs: 1,
    },
    defaultData: {
        type: GoogleIntegrationType.DOCS,
        config: {
            link: "",
        },
    },
    propertyPanel: GoogleIntegrationPropertyPanel,
};
