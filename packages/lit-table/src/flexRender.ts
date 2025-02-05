import type { TemplateResult } from 'lit'

export function flexRender<TProps>(
  Comp: ((props: TProps) => string) | string | TemplateResult | undefined,
  props: TProps,
): TemplateResult | string | null {
  if (!Comp) return null

  if (typeof Comp === 'function') {
    return Comp(props)
  }

  return Comp
}
