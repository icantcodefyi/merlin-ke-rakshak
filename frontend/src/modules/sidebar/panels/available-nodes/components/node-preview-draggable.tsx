import { type DragEvent, type ReactNode, useCallback } from "react";

import type { useInsertNode } from "~/modules/flow-builder/hooks/use-insert-node";
import type { BuilderNodeType } from "~/modules/nodes/types";
import type { ApplicationState } from "~/stores/application-state";

import { NODE_TYPE_DRAG_DATA_FORMAT } from "~/constants/symbols";

import { cn } from "~@/utils/cn";

enum BuilderNode {
    START = "start",
    END = "end",
    TEXT_MESSAGE = "text-message",
    CONDITIONAL_PATH = "conditional-path",
    GOOGLE_INTEGRATION = "google-integration",
    IMAGE_GENERATION = "image-generation",
    LLM = "llm",
    CRYPTO_ANALYZER = "crypto-analyzer",
}

type NodePreviewDraggableProps = Readonly<{
    icon: string | ReactNode;
    title: string;
    description: string;
    type: string;
    children?: never;
    isMobileView: boolean;
    setActivePanel: (panel: ApplicationState["sidebar"]["active"]) => void;
    insertNode: ReturnType<typeof useInsertNode>;
}>;

export function NodePreviewDraggable({ icon, title, description, type, isMobileView, setActivePanel, insertNode }: NodePreviewDraggableProps) {
    const onDragStart = useCallback((e: DragEvent, type: string) => {
        if (isMobileView)
            return;

        e.dataTransfer.setData(NODE_TYPE_DRAG_DATA_FORMAT, type);
        e.dataTransfer.effectAllowed = "move";
    }, [isMobileView]);

    const onClick = useCallback(() => {
        if (!isMobileView)
            return;

        insertNode(type as BuilderNodeType);
        setActivePanel("none");
    }, [insertNode, isMobileView, setActivePanel, type]);

    const getHoverClass = (type: string) => {
        switch (type) {
            case BuilderNode.START:
            case BuilderNode.END:
                return "hover:(ring-2 ring-teal-600/50)";
            case BuilderNode.LLM:
                return "hover:(ring-2 ring-indigo-600/50)";
            case BuilderNode.IMAGE_GENERATION:
                return "hover:(ring-2 ring-rose-600/50)";
            case BuilderNode.GOOGLE_INTEGRATION:
                return "hover:(ring-2 ring-sky-600/50)";
            case BuilderNode.CONDITIONAL_PATH:
                return "hover:(ring-2 ring-purple-600/50)";
            case BuilderNode.TEXT_MESSAGE:
                return "hover:(ring-2 ring-amber-600/50)";
            case BuilderNode.CRYPTO_ANALYZER:
                return "hover:(ring-2 ring-blue-600/50)";
            default:
                return "";
        }
    };

    return (
        <div
            className={cn(
                "flex cursor-grab select-none gap-2 border border-dark-300 rounded-xl bg-dark-400 p-2.5 shadow-sm transition",
                getHoverClass(type),
                isMobileView && "active:(op-70 scale-98)",
            )}
            onClick={onClick}
            onDragStart={e => onDragStart(e, type)}
            draggable
            data-vaul-no-drag
        >
            <div className="shrink-0">
                <div className="size-10 flex items-center justify-center border border-dark-200 rounded-xl bg-dark-300">
                    {typeof icon === "string" ? <div className={cn(icon, "size-6 text-white")} /> : icon}
                </div>
            </div>

            <div className="ml-1 flex grow flex-col">
                <div className="mt-px text-sm font-medium leading-normal">
                    {title}
                </div>

                <div className="line-clamp-3 mt-1 text-xs text-light-50/40 leading-normal">
                    {description}
                </div>
            </div>
        </div>
    );
}
