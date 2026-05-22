'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical, Droplets, Sparkles, Maximize, Crop } from 'lucide-react';
import type { Image, PendingEdit, ToolName } from '@/types';

const TOOLS: { name: ToolName; label: string; icon: React.ReactNode }[] = [
  { name: 'rotate',  label: 'Rotate',  icon: <RotateCw className="size-4" /> },
  { name: 'flip',    label: 'Flip',    icon: <FlipHorizontal className="size-4" /> },
  { name: 'blur',    label: 'Blur',    icon: <Droplets className="size-4" /> },
  { name: 'sharpen', label: 'Sharpen', icon: <Sparkles className="size-4" /> },
  { name: 'resize',  label: 'Resize',  icon: <Maximize className="size-4" /> },
  { name: 'crop',    label: 'Crop',    icon: <Crop className="size-4" /> },
];

export default function ToolPanel({
  image,
  onChange,
}: {
  image: Image | null;
  onChange: (edit: PendingEdit) => void;
}) {
  const [activeTool, setActiveTool] = useState<ToolName | null>(null);
  const [angle, setAngle] = useState(0);
  const [blurSigma, setBlurSigma] = useState(2);
  const [sharpenSigma, setSharpenSigma] = useState(1);
  const [resizeWidth, setResizeWidth] = useState('');
  const [resizeHeight, setResizeHeight] = useState('');

  function selectTool(tool: ToolName) {
    if (activeTool === tool) {
      setActiveTool(null);
      onChange(null);
      return;
    }
    setActiveTool(tool);
    setAngle(0);
    setBlurSigma(2);
    setSharpenSigma(1);
    setResizeWidth(image ? String(image.width) : '');
    setResizeHeight(image ? String(image.height) : '');

    if (tool === 'crop') {
      onChange({ tool: 'crop', x: 0, y: 0, width: 50, height: 50, unit: '%' });
    } else if (tool === 'rotate') {
      onChange({ tool: 'rotate', angle: 0 });
    } else if (tool === 'blur') {
      onChange({ tool: 'blur', sigma: 2 });
    } else if (tool === 'sharpen') {
      onChange({ tool: 'sharpen', sigma: 1 });
    } else if (tool === 'resize') {
      onChange({ tool: 'resize', width: image?.width ?? 0, height: image?.height ?? 0 });
    } else {
      onChange(null);
    }
  }

  function rotateBy(delta: number) {
    const next = angle + delta;
    setAngle(next);
    onChange({ tool: 'rotate', angle: next });
  }

  function flip(direction: 'horizontal' | 'vertical') {
    onChange({ tool: 'flip', direction });
  }

  function onBlurChange(value: number | readonly number[]) {
    const v = Array.isArray(value) ? (value as number[])[0] : (value as number);
    setBlurSigma(v);
    onChange({ tool: 'blur', sigma: v });
  }

  function onSharpenChange(value: number | readonly number[]) {
    const v = Array.isArray(value) ? (value as number[])[0] : (value as number);
    setSharpenSigma(v);
    onChange({ tool: 'sharpen', sigma: v });
  }

  function onResizeWidthChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setResizeWidth(val);
    const w = parseInt(val, 10);
    const h = parseInt(resizeHeight, 10);
    if (w > 0 && h > 0) onChange({ tool: 'resize', width: w, height: h });
  }

  function onResizeHeightChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setResizeHeight(val);
    const w = parseInt(resizeWidth, 10);
    const h = parseInt(val, 10);
    if (w > 0 && h > 0) onChange({ tool: 'resize', width: w, height: h });
  }

  return (
    <div className="flex flex-col gap-2 p-2 border rounded-lg bg-background">
      <div className="flex gap-1 flex-wrap">
        {TOOLS.map(({ name, label, icon }) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            disabled={!image}
            className={cn(activeTool === name && 'bg-accent text-accent-foreground')}
            onClick={() => selectTool(name)}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>

      {activeTool === 'rotate' && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => rotateBy(-90)}>
            <RotateCcw className="size-4" />
            Left
          </Button>
          <Button variant="outline" size="sm" onClick={() => rotateBy(90)}>
            <RotateCw className="size-4" />
            Right
          </Button>
          <span className="text-sm text-muted-foreground">{angle}°</span>
        </div>
      )}

      {activeTool === 'flip' && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => flip('horizontal')}>
            <FlipHorizontal className="size-4" />
            Horizontal
          </Button>
          <Button variant="outline" size="sm" onClick={() => flip('vertical')}>
            <FlipVertical className="size-4" />
            Vertical
          </Button>
        </div>
      )}

      {activeTool === 'blur' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-12">Sigma</span>
          <Slider
            min={0.3}
            max={20}
            step={0.1}
            value={[blurSigma]}
            onValueChange={onBlurChange}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">{blurSigma.toFixed(1)}</span>
        </div>
      )}

      {activeTool === 'sharpen' && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground w-12">Sigma</span>
          <Slider
            min={0.1}
            max={10}
            step={0.1}
            value={[sharpenSigma]}
            onValueChange={onSharpenChange}
            className="flex-1"
          />
          <span className="text-sm text-muted-foreground w-8">{sharpenSigma.toFixed(1)}</span>
        </div>
      )}

      {activeTool === 'resize' && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">W</span>
          <Input
            type="number"
            min={1}
            value={resizeWidth}
            onChange={onResizeWidthChange}
            className="w-24 h-8"
          />
          <span className="text-sm text-muted-foreground">H</span>
          <Input
            type="number"
            min={1}
            value={resizeHeight}
            onChange={onResizeHeightChange}
            className="w-24 h-8"
          />
          <span className="text-sm text-muted-foreground">px</span>
        </div>
      )}

      {activeTool === 'crop' && (
        <p className="text-sm text-muted-foreground">Drag on the image to select the crop area.</p>
      )}
    </div>
  );
}
