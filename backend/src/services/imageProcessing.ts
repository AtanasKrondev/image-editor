import sharp from 'sharp';

export function applyEdit(
  pipeline: sharp.Sharp,
  action: string,
  parameters: Record<string, unknown>,
): sharp.Sharp {
  switch (action) {
    case 'crop':
      return pipeline.extract({
        left: parameters.left as number,
        top: parameters.top as number,
        width: parameters.width as number,
        height: parameters.height as number,
      });
    case 'resize':
      return pipeline.resize({
        width: parameters.width as number | undefined,
        height: parameters.height as number | undefined,
      });
    case 'rotate':
      return pipeline.rotate(parameters.angle as number);
    case 'flip':
      return (parameters.direction as string) === 'horizontal'
        ? pipeline.flop()
        : pipeline.flip();
    case 'blur':
      return pipeline.blur(parameters.sigma as number);
    case 'sharpen': {
      const sigma = parameters.sigma as number | undefined;
      return sigma !== undefined
        ? pipeline.sharpen({ sigma })
        : pipeline.sharpen();
    }
    default:
      return pipeline;
  }
}

export async function applyHistory(
  filePath: string,
  history: Array<{ action: string; parameters: string }>,
  outputFormat?: keyof sharp.FormatEnum,
): Promise<Buffer> {
  let pipeline = sharp(filePath);
  for (const entry of history) {
    const params = JSON.parse(entry.parameters) as Record<string, unknown>;
    pipeline = applyEdit(pipeline, entry.action, params);
  }
  if (outputFormat) {
    pipeline = pipeline.toFormat(outputFormat);
  }
  return pipeline.toBuffer();
}
