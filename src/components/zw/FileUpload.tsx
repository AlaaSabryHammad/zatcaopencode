'use client';

import * as React from 'react';
import { cx } from './lib/cx';
import { fmtBytes } from './lib/format';
import { useZwT } from './lib/locale';
import { Icon } from './Icon';
import { IconButton } from './Button';

export interface UploadFile {
  name: string;
  size?: number;
  status?: 'uploading' | 'done' | 'error';
  progress?: number;
  error?: string;
}

export interface FileUploadProps {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  accept?: string;
  multiple?: boolean;
  icon?: string;
  compact?: boolean;
  /** Controlled file list (upload state comes from the caller). */
  files?: UploadFile[];
  onFiles?: (files: FileList) => void;
  onRemove?: (index: number) => void;
  className?: string;
}

export function FileUpload({
  label,
  hint,
  accept,
  multiple,
  icon,
  compact,
  files: filesProp,
  onFiles,
  onRemove,
  className,
}: FileUploadProps) {
  const t = useZwT();
  const [drag, setDrag] = React.useState(false);
  const [innerFiles, setInnerFiles] = React.useState<UploadFile[]>([]);
  const files = filesProp ?? innerFiles;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const labelId = React.useId();

  const add = (list: FileList | null) => {
    if (!list || !list.length) return;
    if (!filesProp)
      setInnerFiles((xs) => [
        ...xs,
        ...Array.from(list).map((f) => ({ name: f.name, size: f.size, status: 'done' as const })),
      ]);
    onFiles?.(list);
  };
  const remove = (i: number) => {
    if (!filesProp) setInnerFiles((xs) => xs.filter((_, j) => j !== i));
    onRemove?.(i);
  };

  return (
    <div className={cx('zw-upload', className)}>
      {label ? (
        <div className="zw-label" id={labelId}>
          {label}
        </div>
      ) : null}
      <div
        className={cx('zw-dropzone', drag && 'is-drag', compact && 'zw-dropzone--compact')}
        tabIndex={0}
        role="button"
        aria-labelledby={label ? labelId : undefined}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
      >
        <span className="zw-dropzone-icon">
          <Icon name={icon ?? 'cloud-upload'} size={22} />
        </span>
        <div className="zw-dropzone-text">
          {t('dropFiles')} <span className="zw-link">{t('browse')}</span>
        </div>
        {hint ? <div className="zw-dropzone-hint">{hint}</div> : null}
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={multiple}
          accept={accept}
          onChange={(e) => {
            add(e.target.files);
            e.target.value = '';
          }}
        />
      </div>
      {files.length ? (
        <ul className="zw-filelist">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={cx('zw-file', f.status === 'error' && 'is-error')}>
              <span className="zw-file-icon">
                <Icon name={/\.(xlsx?|csv)$/i.test(f.name) ? 'file-spreadsheet' : 'file-text'} size={18} />
              </span>
              <div className="zw-file-body">
                <div className="zw-file-name">{f.name}</div>
                <div className="zw-file-meta">
                  {f.status === 'error'
                    ? (f.error ?? t('uploadFailed'))
                    : fmtBytes(f.size ?? 0) + (f.status === 'uploading' ? ` · ${f.progress ?? 0}%` : '')}
                </div>
                {f.status === 'uploading' ? (
                  <div
                    className="zw-progress"
                    role="progressbar"
                    aria-valuenow={f.progress ?? 0}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div className="zw-progress-bar" style={{ width: `${f.progress ?? 0}%` }} />
                  </div>
                ) : null}
              </div>
              {f.status === 'done' ? (
                <span className="zw-file-ok">
                  <Icon name="circle-check" size={16} />
                </span>
              ) : null}
              <IconButton icon="x" label={t('close')} size="sm" onClick={() => remove(i)} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
