import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { type Node, type NodeProps, Position, useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { nanoid } from "nanoid";
import { isEmpty } from "radash";
import { memo, useCallback, useMemo, useState } from "react";

import CustomHandle from "~/modules/flow-builder/components/handles/custom-handle";
import { useDeleteNode } from "~/modules/flow-builder/hooks/use-delete-node";
import { type BaseNodeData, BuilderNode, type RegisterNodeMetadata } from "~/modules/nodes/types";
import { getNodeDetail } from "~/modules/nodes/utils";
import CryptoAnalyzerPropertyPanel from "~/modules/sidebar/panels/node-properties/property-panels/crypto-analyzer-property-panel";
import { useApplicationState } from "~/stores/application-state";

import { cn } from "~@/utils/cn";

export enum CryptoAnalysisType {
    PRICE_ANALYSIS = "price_analysis",
    SENTIMENT_ANALYSIS = "sentiment_analysis",
    TECHNICAL_INDICATORS = "technical_indicators",
}

export interface CryptoAnalyzerConfig {
    symbol: string;
    timeframe: string;
    indicators?: string[];
    isAuto: boolean;
}

export interface CryptoAnalyzerNodeData extends BaseNodeData {
    type: CryptoAnalysisType;
    config: CryptoAnalyzerConfig;
}

const NODE_TYPE = BuilderNode.CRYPTO_ANALYZER;

type CryptoAnalyzerNodeProps = NodeProps<Node<CryptoAnalyzerNodeData, typeof NODE_TYPE>>;

export function CryptoAnalyzerNode({ id, isConnectable, selected, data }: CryptoAnalyzerNodeProps) {
    const meta = useMemo(() => getNodeDetail(NODE_TYPE), []);
    const [sourceHandleId] = useState<string>(nanoid());
    const { setNodes } = useReactFlow();
    const deleteNode = useDeleteNode();
    const [showNodePropertiesOf] = useApplicationState(s => [s.actions.sidebar.showNodePropertiesOf]);

    const onTypeChange = useCallback(
        (type: CryptoAnalysisType) => {
            setNodes(nodes => produce(nodes, (draft) => {
                const node = draft.find(n => n.id === id);
                if (node?.type === NODE_TYPE) {
                    node.data.type = type;
                    node.data.config = {
                        symbol: "",
                        timeframe: "1d",
                        indicators: type === CryptoAnalysisType.TECHNICAL_INDICATORS ? [] : undefined,
                        isAuto: false,
                    };
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
                className="w-xs overflow-clip border border-dark-200 rounded-xl bg-dark-300/50 shadow-sm backdrop-blur-xl transition divide-y divide-dark-200 data-[selected=true]:(border-blue-600 ring-1 ring-blue-600/50)"
                onDoubleClick={showNodeProperties}
            >
                <div className="relative bg-dark-300/50">
                    <div className="absolute inset-0">
                        <div className="absolute h-full w-3/5 from-blue-900/20 to-transparent bg-gradient-to-r" />
                    </div>

                    <div className="relative h-9 flex items-center justify-between gap-x-4 px-0.5 py-0.5">
                        <div className="flex grow items-center pl-0.5">
                            <div className="size-7 flex items-center justify-center">
                                <div className="size-6 flex items-center justify-center rounded-lg">
                                    <div className="i-cryptocurrency:btc size-4" />
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
                                        <div
                                            className={cn(
                                                data.type === CryptoAnalysisType.PRICE_ANALYSIS
                                                    ? "i-mdi:chart-line"
                                                    : data.type === CryptoAnalysisType.SENTIMENT_ANALYSIS
                                                        ? "i-mdi:emoticon-happy"
                                                        : "i-mdi:chart-multiple",
                                                "size-4",
                                            )}
                                        />
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
                                            onSelect={() => onTypeChange(CryptoAnalysisType.PRICE_ANALYSIS)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mdi:chart-line size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Price Analysis
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300) hover:bg-dark-100"
                                            onSelect={() => onTypeChange(CryptoAnalysisType.SENTIMENT_ANALYSIS)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mdi:emoticon-happy size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Sentiment Analysis
                                                </div>
                                            </div>
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            className="cursor-pointer border border-transparent rounded-lg p-1.5 outline-none transition active:(border-dark-100 bg-dark-300) hover:bg-dark-100"
                                            onSelect={() => onTypeChange(CryptoAnalysisType.TECHNICAL_INDICATORS)}
                                        >
                                            <div className="flex items-center gap-x-2">
                                                <div className="i-mdi:chart-multiple size-4" />
                                                <div className="text-xs font-medium leading-none tracking-wide">
                                                    Technical Indicators
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
                    {data.type === CryptoAnalysisType.TECHNICAL_INDICATORS && (
                        <div className="flex flex-col p-4">
                            <div className="text-xs text-light-900/50 font-medium">
                                Indicators
                            </div>
                            <div className="line-clamp-2 mt-2 text-sm leading-snug">
                                {isEmpty(data.config.indicators)
                                    ? (
                                            <span className="text-light-900/80 italic">No indicators selected yet...</span>
                                        )
                                    : (
                                            data.config.indicators.join(", ")
                                        )}
                            </div>
                        </div>
                    )}

                    <div className="px-4 py-2">
                        <div className="text-xs text-emerald-900/50">
                            {isEmpty(data.config.symbol)
                                ? (
                                        <span className="text-light-900/80 italic">
                                            No cryptocurrency selected yet...
                                        </span>
                                    )
                                : (
                                        <>
                                            Analyzing
                                            {" "}
                                            {data.config.symbol}
                                            {" "}
                                            on
                                            {" "}
                                            {data.config.timeframe}
                                            {" "}
                                            timeframe
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

export const metadata: RegisterNodeMetadata<CryptoAnalyzerNodeData> = {
    type: NODE_TYPE,
    node: memo(CryptoAnalyzerNode),
    detail: {
        icon: "i-cryptocurrency:btc",
        title: "Crypto Analyzer",
        description: "Analyze cryptocurrency data with price analysis, sentiment analysis, and technical indicators.",
    },
    connection: {
        inputs: 1,
        outputs: 1,
    },
    defaultData: {
        type: CryptoAnalysisType.PRICE_ANALYSIS,
        config: {
            symbol: "",
            timeframe: "1d",
            isAuto: false,
        },
    },
    propertyPanel: CryptoAnalyzerPropertyPanel,
};
