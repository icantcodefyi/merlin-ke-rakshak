import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { isEmpty } from "radash";
import { useCallback } from "react";

import { CryptoAnalysisType, type CryptoAnalyzerNodeData } from "~/modules/nodes/nodes/crypto-analyzer-node/crypto-analyzer.node";
import { BuilderNode, type BuilderNodeType } from "~/modules/nodes/types";

import { cn } from "~@/utils/cn";

interface CryptoAnalyzerPropertyPanelProps {
    id: string;
    type: BuilderNodeType;
    data: CryptoAnalyzerNodeData;
    updateData: (data: Partial<CryptoAnalyzerNodeData>) => void;
}

const TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w", "1M"] as const;
const TECHNICAL_INDICATORS = ["RSI", "MACD", "Moving Average", "Bollinger Bands", "Volume"] as const;

export default function CryptoAnalyzerPropertyPanel({ id, type: _type, data, updateData: _updateData }: CryptoAnalyzerPropertyPanelProps) {
    const { setNodes } = useReactFlow();

    const updateNodeData = useCallback(
        (updates: Partial<CryptoAnalyzerNodeData["config"]>) => {
            setNodes((nodes) => {
                return produce(nodes, (draft) => {
                    const node = draft.find(n => n.id === id);
                    if (node?.type === BuilderNode.CRYPTO_ANALYZER) {
                        node.data.config = {
                            ...node.data.config,
                            ...updates,
                        };
                    }
                });
            });
        },
        [id, setNodes],
    );

    return (
        <div className="space-y-6">
            <div>
                <div className="mb-4 flex items-center justify-between">
                    <label className="text-xs text-light-900/50 font-medium">Auto Mode</label>
                    <button
                        type="button"
                        onClick={() => {
                            updateNodeData({ isAuto: !data.config.isAuto });
                        }}
                        className={cn(
                            "w-12 h-6 rounded-full transition-colors",
                            data.config.isAuto ? "bg-blue-600" : "bg-dark-200",
                        )}
                    >
                        <div
                            className={cn(
                                "w-5 h-5 rounded-full bg-white transform transition-transform",
                                data.config.isAuto ? "translate-x-6" : "translate-x-1",
                            )}
                        />
                    </button>
                </div>
            </div>

            {!data.config.isAuto && (
                <div>
                    <label className="mb-2 block text-xs text-light-900/50 font-medium">
                        Cryptocurrency Symbol
                    </label>
                    <input
                        type="text"
                        value={data.config.symbol}
                        onChange={(e) => {
                            updateNodeData({ symbol: e.target.value.toUpperCase() });
                        }}
                        placeholder="BTC, ETH, etc."
                        className="h-8 w-full border border-dark-200 rounded-lg bg-dark-300 px-2 text-sm outline-none transition focus:(border-blue-600 ring-1 ring-blue-600/50)"
                    />
                </div>
            )}

            <div>
                <label className="mb-2 block text-xs text-light-900/50 font-medium">Timeframe</label>
                <div className="grid grid-cols-3 gap-1">
                    {TIMEFRAMES.map((timeframe) => {
                        return (
                            <button
                                key={timeframe}
                                type="button"
                                onClick={() => updateNodeData({ timeframe })}
                                className={cn(
                                    "h-8 flex items-center justify-center border rounded-lg text-sm transition",
                                    data.config.timeframe === timeframe ? "border-blue-600 bg-blue-600/20 text-blue-400" : "border-dark-200 bg-dark-300 hover:bg-dark-200",
                                )}
                            >
                                {timeframe}
                            </button>
                        );
                    })}
                </div>
            </div>

            {data.type === CryptoAnalysisType.TECHNICAL_INDICATORS && (
                <div>
                    <label className="mb-2 block text-xs text-light-900/50 font-medium">Technical Indicators</label>
                    <div className="space-y-1">
                        {TECHNICAL_INDICATORS.map(indicator => (
                            <button
                                key={indicator}
                                type="button"
                                onClick={() => {
                                    const indicators = data.config.indicators || [];
                                    const newIndicators = indicators.includes(indicator) ? indicators.filter(i => i !== indicator) : [...indicators, indicator];
                                    updateNodeData({ indicators: newIndicators });
                                }}
                                className={cn(
                                    "w-full h-8 flex items-center justify-between px-2 border rounded-lg text-sm transition",
                                    data.config.indicators?.includes(indicator) ? "border-blue-600 bg-blue-600/20 text-blue-400" : "border-dark-200 bg-dark-300 hover:bg-dark-200",
                                )}
                            >
                                <span>{indicator}</span>
                                {data.config.indicators?.includes(indicator) && <div className="i-lucide:check size-4" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="text-xs text-light-900/50">
                {data.config.isAuto
                    ? "Automatically analyzing cryptocurrencies."
                    : isEmpty(data.config.symbol)
                        ? "Enter a cryptocurrency symbol to start analyzing."
                        : `Analyzing ${data.config.symbol} on ${data.config.timeframe} timeframe${
                            data.type === CryptoAnalysisType.TECHNICAL_INDICATORS && !isEmpty(data.config.indicators)
                                ? ` with ${data.config.indicators?.join(", ")}`
                                : ""
                        }.`}
            </div>
        </div>
    );
}
