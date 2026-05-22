export interface Image {
  id: string
  filename: string
  original_filename: string
  file_path: string
  size: number
  width: number
  height: number
  format: string
  created_at: string
  updated_at: string
}

export type ToolName = 'rotate' | 'flip' | 'blur' | 'sharpen' | 'resize' | 'crop';

export type PendingEdit =
  | { tool: 'rotate';  angle: number }
  | { tool: 'flip';    direction: 'horizontal' | 'vertical' }
  | { tool: 'blur';    sigma: number }
  | { tool: 'sharpen'; sigma: number }
  | { tool: 'resize';  width: number; height: number }
  | { tool: 'crop';    x: number; y: number; width: number; height: number; unit: '%' }
  | null;
