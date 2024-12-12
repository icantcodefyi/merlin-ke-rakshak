"use client";

import { useState, useCallback } from "react";
import { ReactFlow, Controls, Background, NodeChange, EdgeChange, applyNodeChanges, applyEdgeChanges, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import SheetsList from "@/components/sheetsList";

const initialNodes: Node[] = [
  {
    id: "1",
    position: { x: 250, y: 250 },
    data: { label: "Start your workflow" },
    type: "input",
  },
];

const initialEdges: Edge[] = [];

export default function Home() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

    const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const addNewNode = () => {
    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: { label: "New Task" },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="flex h-screen w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="fixed left-4 top-4 z-10">
            Open Workflow Tools
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Workflow Tools</SheetTitle>
            <SheetDescription>
              Drag and drop elements to create your workflow
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[90vh] w-full rounded-md border p-4">
            <div className="flex flex-col gap-4">
              <Button onClick={addNewNode}>Add Task Node</Button>
              <SheetsList/>
              {/* Add more workflow tools here */}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      <div className="h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}
