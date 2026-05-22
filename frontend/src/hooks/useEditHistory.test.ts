import { describe, it, expect } from 'vitest';
import { editHistoryReducer } from './useEditHistory';
import type { EditHistoryState } from './useEditHistory';
import type { EditHistoryEntry } from '@/types';

const entry = (sequence: number): EditHistoryEntry => ({
  id: `id-${sequence}`,
  image_id: 'img-1',
  action: 'blur',
  parameters: JSON.stringify({ sigma: 2 }),
  sequence,
  created_at: new Date().toISOString(),
});

const empty: EditHistoryState = { redoStack: [] };

describe('editHistoryReducer', () => {
  it('PUSH_REDO appends entry to redo stack', () => {
    const e = entry(1);
    const next = editHistoryReducer(empty, { type: 'PUSH_REDO', entry: e });
    expect(next.redoStack).toHaveLength(1);
    expect(next.redoStack[0]).toBe(e);
  });

  it('PUSH_REDO preserves existing entries', () => {
    const first = entry(1);
    const second = entry(2);
    const state1 = editHistoryReducer(empty, { type: 'PUSH_REDO', entry: first });
    const state2 = editHistoryReducer(state1, { type: 'PUSH_REDO', entry: second });
    expect(state2.redoStack).toEqual([first, second]);
  });

  it('POP_REDO removes the last entry', () => {
    const state = { redoStack: [entry(1), entry(2)] };
    const next = editHistoryReducer(state, { type: 'POP_REDO' });
    expect(next.redoStack).toHaveLength(1);
    expect(next.redoStack[0].sequence).toBe(1);
  });

  it('POP_REDO on empty stack is a no-op', () => {
    const next = editHistoryReducer(empty, { type: 'POP_REDO' });
    expect(next.redoStack).toHaveLength(0);
  });

  it('CLEAR_REDO empties the stack', () => {
    const state = { redoStack: [entry(1), entry(2), entry(3)] };
    const next = editHistoryReducer(state, { type: 'CLEAR_REDO' });
    expect(next.redoStack).toHaveLength(0);
  });

  it('CLEAR_REDO on empty stack is a no-op', () => {
    const next = editHistoryReducer(empty, { type: 'CLEAR_REDO' });
    expect(next.redoStack).toHaveLength(0);
  });

  it('undo sequence: push then pop returns original state', () => {
    const e = entry(1);
    const pushed = editHistoryReducer(empty, { type: 'PUSH_REDO', entry: e });
    const popped = editHistoryReducer(pushed, { type: 'POP_REDO' });
    expect(popped.redoStack).toHaveLength(0);
  });

  it('clear after undo removes all redo entries', () => {
    let state = empty;
    state = editHistoryReducer(state, { type: 'PUSH_REDO', entry: entry(1) });
    state = editHistoryReducer(state, { type: 'PUSH_REDO', entry: entry(2) });
    state = editHistoryReducer(state, { type: 'CLEAR_REDO' });
    expect(state.redoStack).toHaveLength(0);
  });
});
