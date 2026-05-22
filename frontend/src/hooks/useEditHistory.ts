'use client';

import { useState, useReducer } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { deleteLastHistory, editImage, fetchHistory, historyKey } from '@/services/api';
import type { EditHistoryEntry } from '@/types';

export interface EditHistoryState {
  redoStack: EditHistoryEntry[];
}

export type EditHistoryAction =
  | { type: 'PUSH_REDO'; entry: EditHistoryEntry }
  | { type: 'POP_REDO' }
  | { type: 'CLEAR_REDO' };

export function editHistoryReducer(
  state: EditHistoryState,
  action: EditHistoryAction
): EditHistoryState {
  switch (action.type) {
    case 'PUSH_REDO':
      return { redoStack: [...state.redoStack, action.entry] };
    case 'POP_REDO':
      return { redoStack: state.redoStack.slice(0, -1) };
    case 'CLEAR_REDO':
      return { redoStack: [] };
    default:
      return state;
  }
}

export function useEditHistory(
  imageId: string | null,
  onHistoryChange: () => void
) {
  const [{ redoStack }, dispatch] = useReducer(editHistoryReducer, { redoStack: [] });

  // Derived state: clear redo stack when image changes (avoids useEffect + cascading renders)
  const [prevImageId, setPrevImageId] = useState(imageId);
  if (prevImageId !== imageId) {
    setPrevImageId(imageId);
    dispatch({ type: 'CLEAR_REDO' });
  }

  const { data: history, mutate } = useSWR(
    historyKey(imageId),
    () => fetchHistory(imageId!)
  );

  const { trigger: triggerDelete, isMutating: isUndoing } = useSWRMutation(
    historyKey(imageId),
    () => deleteLastHistory(imageId!)
  );

  const { trigger: triggerEdit, isMutating: isRedoing } = useSWRMutation(
    imageId,
    (_key: string, { arg }: { arg: { action: string; parameters: Record<string, unknown> } }) =>
      editImage(_key, arg.action, arg.parameters)
  );

  async function undo() {
    if (!imageId || !canUndo || isUndoing) return;
    const deleted = await triggerDelete();
    if (deleted) {
      dispatch({ type: 'PUSH_REDO', entry: deleted });
      await mutate();
      onHistoryChange();
    }
  }

  async function redo() {
    if (!imageId || !canRedo || isRedoing) return;
    const entry = redoStack[redoStack.length - 1];
    await triggerEdit({ action: entry.action, parameters: JSON.parse(entry.parameters) });
    dispatch({ type: 'POP_REDO' });
    await mutate();
    onHistoryChange();
  }

  function clearRedo() {
    dispatch({ type: 'CLEAR_REDO' });
  }

  const resolvedHistory = history ?? [];
  const canUndo = resolvedHistory.length > 0;
  const canRedo = redoStack.length > 0;

  return {
    history: resolvedHistory,
    redoStack,
    canUndo,
    canRedo,
    isUndoing,
    isRedoing,
    undo,
    redo,
    clearRedo,
    refetch: mutate,
  };
}
