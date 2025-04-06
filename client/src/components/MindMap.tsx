import React, { useState, useEffect, useRef } from 'react';
import { Note, MindMapNode } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';

interface MindMapProps {
  notes: Note[];
  onNodeSelect: (noteId: string) => void;
}

export const MindMap: React.FC<MindMapProps> = ({ notes, onNodeSelect }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<MindMapNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Initialize nodes from notes
    const initialNodes = notes.map((note) => ({
      id: uuidv4(),
      noteId: note.id,
      position: { x: Math.random() * 800, y: Math.random() * 600 },
      connections: [],
    }));
    setNodes(initialNodes);

    // Create connections based on note links
    const updatedNodes = initialNodes.map((node) => {
      const note = notes.find((n) => n.id === node.noteId);
      if (note) {
        const connections = note.links.map((link) => {
          const targetNode = initialNodes.find((n) => n.noteId === link.targetNoteId);
          return targetNode?.id || '';
        }).filter(Boolean);
        return { ...node, connections };
      }
      return node;
    });
    setNodes(updatedNodes);
  }, [notes]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections
    nodes.forEach((node) => {
      node.connections.forEach((connectionId) => {
        const targetNode = nodes.find((n) => n.id === connectionId);
        if (targetNode) {
          ctx.beginPath();
          ctx.moveTo(node.position.x, node.position.y);
          ctx.lineTo(targetNode.position.x, targetNode.position.y);
          ctx.strokeStyle = '#666';
          ctx.stroke();
        }
      });
    });

    // Draw nodes
    nodes.forEach((node) => {
      const note = notes.find((n) => n.id === node.noteId);
      if (note) {
        ctx.beginPath();
        ctx.arc(node.position.x, node.position.y, 20, 0, Math.PI * 2);
        ctx.fillStyle = selectedNode === node.id ? '#4CAF50' : '#2196F3';
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(note.title.substring(0, 10), node.position.x, node.position.y + 4);
      }
    });
  }, [nodes, selectedNode, notes]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedNode = nodes.find((node) => {
      const dx = node.position.x - x;
      const dy = node.position.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 20;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      setIsDragging(true);
      setDragStart({ x, y });
      onNodeSelect(clickedNode.noteId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedNode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const dx = x - dragStart.x;
    const dy = y - dragStart.y;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === selectedNode
          ? {
              ...node,
              position: {
                x: node.position.x + dx,
                y: node.position.y + dy,
              },
            }
          : node
      )
    );

    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
    </div>
  );
}; 