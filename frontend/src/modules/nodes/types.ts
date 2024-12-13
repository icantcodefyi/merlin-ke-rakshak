import type { ComponentType } from "react";

export enum BuilderNode {
    START = "start",
    END = "end",
    TEXT_MESSAGE = "text-message",
    CONDITIONAL_PATH = "conditional-path",
    GOOGLE_INTEGRATION = "google-integration",
    IMAGE_GENERATION = "image-generation",
    LLM = "llm",
    CRYPTO_ANALYZER = "crypto-analyzer",
    API_REQUEST = "api-request",
}

export type BuilderNodeType = `${BuilderNode}`;

export interface RegisterNodeMetadata<T = Record<string, any>> {
    type: BuilderNodeType;
    node: ComponentType<any>;
    detail: {
        icon: string;
        title: string;
        description: string;
    };
    connection: {
        inputs: number;
        outputs: number;
    };
    available?: boolean;
    defaultData?: T;
    propertyPanel?: ComponentType<any>;
}

export interface BaseNodeData extends Record<string, any> {
    deletable?: boolean;
}
