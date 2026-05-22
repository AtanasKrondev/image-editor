'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Undo2, Redo2, Check, X } from 'lucide-react';
import type { EditHistoryEntry } from '@/types';

function abbrev(action: string, parameters: string): string {
  try {
    const p = JSON.parse(parameters);
    if (action === 'blur') return `σ${p.sigma}`;
    if (action === 'sharpen') return p.sigma != null ? `σ${p.sigma}` : 'sharpen';
    if (action === 'rotate') return `${p.angle}°`;
    if (action === 'flip') return p.direction === 'horizontal' ? 'H' : 'V';
    if (action === 'resize') return `${p.width}×${p.height}`;
    if (action === 'crop') return `${p.width}×${p.height}`;
  } catch {
    // ignore parse errors
  }
  return '';
}

export default function EditHistory({
  history,
  redoStack,
  canUndo,
  canRedo,
  isUndoing,
  isRedoing,
  pendingUndoRedo,
  onUndo,
  onRedo,
  onApplyUndoRedo,
  onCancelUndoRedo,
}: {
  history: EditHistoryEntry[];
  redoStack: EditHistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  isUndoing: boolean;
  isRedoing: boolean;
  pendingUndoRedo: 'undo' | 'redo' | null;
  onUndo: () => void;
  onRedo: () => void;
  onApplyUndoRedo: () => void;
  onCancelUndoRedo: () => void;
}) {
  const busy = isUndoing || isRedoing;
  const hasPending = pendingUndoRedo !== null;
  const hasItems = history.length > 0 || redoStack.length > 0;

  return (
    <div className="flex items-center gap-2 px-2 py-1 border rounded-lg bg-background">
      <Button
        variant="outline"
        size="sm"
        disabled={!canUndo || busy || hasPending}
        onClick={onUndo}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="size-4" />
        Undo
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!canRedo || busy || hasPending}
        onClick={onRedo}
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="size-4" />
        Redo
      </Button>
      <Button
        size="sm"
        disabled={!hasPending || busy}
        onClick={onApplyUndoRedo}
      >
        <Check className="size-4" />
        Apply
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={!hasPending || busy}
        onClick={onCancelUndoRedo}
      >
        <X className="size-4" />
        Cancel
      </Button>

      {hasItems ? (
        <ScrollArea className="flex-1">
          <div className="flex items-center gap-1 pb-1">
            {history.map((entry) => (
              <span
                key={entry.id}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted text-xs whitespace-nowrap"
              >
                <span className="font-medium">{entry.action}</span>
                <span className="text-muted-foreground">{abbrev(entry.action, entry.parameters)}</span>
              </span>
            ))}
            {redoStack.map((entry, i) => (
              <span
                key={`redo-${i}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-muted/40 text-xs whitespace-nowrap opacity-40"
              >
                <span className="font-medium">{entry.action}</span>
                <span>{abbrev(entry.action, entry.parameters)}</span>
              </span>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <span className="text-xs text-muted-foreground">No edits yet</span>
      )}
    </div>
  );
}
