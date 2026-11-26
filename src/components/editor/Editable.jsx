import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export default function Editable({
  value = '',
  onChange,
  onFocus,
  onBlur,
  className,
  placeholder,
  multiline = false,
  as: Tag = 'div',
  ...props
}) {
  const ref = useRef(null);
  const lastValue = useRef(value);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (document.activeElement === element) return;
    if (element.innerText !== value) {
      element.innerText = value;
    }
  }, [value]);

  const commit = () => {
    const element = ref.current;
    if (!element) {
      onBlur?.();
      return;
    }
    const raw = element.innerText || '';
    const next = multiline
      ? raw.replace(/\n{3,}/g, '\n\n').replace(/\s+$/g, '')
      : raw.replace(/\s+/g, ' ').trim();
    if (next !== value) onChange?.(next);
    onBlur?.();
  };

  const insertPlainText = (event) => {
    event.preventDefault();
    const text = event.clipboardData?.getData('text/plain') || '';
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      tabIndex={0}
      spellCheck
      data-placeholder={placeholder}
      onFocus={(event) => {
        lastValue.current = value;
        onFocus?.(event);
      }}
      onBlur={commit}
      onPaste={insertPlainText}
      onKeyDown={(event) => {
        if (!multiline && event.key === 'Enter') {
          event.preventDefault();
          ref.current?.blur();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          if (ref.current) ref.current.innerText = lastValue.current;
          ref.current?.blur();
        }
      }}
      className={cn(
        'rounded-[3px] px-0.5 -mx-0.5 outline-none transition-colors focus:bg-[#F4ECFF]/70 focus:ring-2 focus:ring-[#7D2AE8]/25',
        multiline && 'whitespace-pre-wrap',
        className,
      )}
      {...props}
    />
  );
}
