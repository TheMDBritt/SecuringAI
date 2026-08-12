'use client';

import { useCallback, useRef } from 'react';

/**
 * Keyboard behaviour for an ARIA tablist.
 *
 * Declaring role="tablist" and role="tab" is a promise to the user that arrow
 * keys move between tabs and that the set occupies one tab stop. Several tab
 * strips in this app declared the roles without implementing either, which
 * leaves a screen-reader user with controls that announce as tabs and then do
 * not behave like them.
 *
 * Implements the WAI-ARIA authoring-practices pattern: Left/Right (and
 * Up/Down) move and activate, Home/End jump to the ends, and only the selected
 * tab is in the document tab order.
 *
 * Usage:
 *   const tabs = useTabList(ids, active, setActive);
 *   <div role="tablist" {...tabs.listProps}>
 *     {ids.map(id => <button key={id} {...tabs.tabProps(id)}>...</button>)}
 *   </div>
 */
export function useTabList<T extends string>(
  ids: readonly T[],
  active: T,
  onChange: (id: T) => void,
) {
  const refs = useRef(new Map<T, HTMLButtonElement | null>());

  const focusAndSelect = useCallback(
    (id: T) => {
      onChange(id);
      // Focus after the state change so the newly enabled tab stop receives it.
      requestAnimationFrame(() => refs.current.get(id)?.focus());
    },
    [onChange],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const i = ids.indexOf(active);
      if (i === -1) return;

      let next: T | undefined;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          next = ids[(i + 1) % ids.length];
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          next = ids[(i - 1 + ids.length) % ids.length];
          break;
        case 'Home':
          next = ids[0];
          break;
        case 'End':
          next = ids[ids.length - 1];
          break;
        default:
          return;
      }

      e.preventDefault();
      if (next) focusAndSelect(next);
    },
    [ids, active, focusAndSelect],
  );

  return {
    listProps: { onKeyDown },
    tabProps: (id: T) => ({
      role: 'tab' as const,
      id: `tab-${id}`,
      'aria-selected': active === id,
      'aria-controls': `tabpanel-${id}`,
      // Roving tabindex: the set is a single tab stop.
      tabIndex: active === id ? 0 : -1,
      ref: (el: HTMLButtonElement | null) => {
        refs.current.set(id, el);
      },
      onClick: () => onChange(id),
    }),
    panelProps: (id: T) => ({
      role: 'tabpanel' as const,
      id: `tabpanel-${id}`,
      'aria-labelledby': `tab-${id}`,
      tabIndex: 0,
    }),
  };
}
