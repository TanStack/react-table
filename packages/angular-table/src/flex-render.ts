import {
  ChangeDetectorRef,
  ComponentRef,
  Directive,
  EmbeddedViewRef,
  InjectionToken,
  Injector,
  Input,
  TemplateRef,
  Type,
  ViewContainerRef,
  inject,
  type DoCheck,
  type OnInit,
} from '@angular/core'

type FlexRenderContent<TProps extends NonNullable<unknown>> =
  | string
  | number
  | Type<TProps>
  | FlexRenderComponent<TProps>
  | TemplateRef<{ $implicit: TProps }>
  | null

@Directive({
  selector: '[flexRender]',
  standalone: true,
})
export class FlexRenderDirective<TProps extends NonNullable<unknown>>
  implements OnInit, DoCheck
{
  @Input({ required: true, alias: 'flexRender' })
  content:
    | number
    | string
    | ((props: TProps) => FlexRenderContent<TProps>)
    | undefined = undefined

  @Input({ required: true, alias: 'flexRenderProps' })
  props: TProps = {} as TProps

  @Input({ required: false, alias: 'flexRenderInjector' })
  injector: Injector = inject(Injector)

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>
  ) {}

  ref?: ComponentRef<unknown> | EmbeddedViewRef<unknown> | null = null

  ngOnInit(): void {
    this.ref = this.render()
  }

  ngDoCheck() {
    if (this.ref instanceof ComponentRef) {
      this.ref.injector.get(ChangeDetectorRef).markForCheck()
    } else if (this.ref instanceof EmbeddedViewRef) {
      this.ref.markForCheck()
    }
  }

  render() {
    this.viewContainerRef.clear()
    const { content, props } = this
    if (!this.content) {
      return null
    }

    if (typeof content === 'string' || typeof content === 'number') {
      return this.renderStringContent()
    }
    if (typeof content === 'function') {
      return this.renderContent(content(props))
    }
    return null
  }

  private renderContent(content: FlexRenderContent<TProps>) {
    if (typeof content === 'string' || typeof content === 'number') {
      return this.renderStringContent()
    }
    if (content instanceof TemplateRef) {
      return this.viewContainerRef.createEmbeddedView(
        content,
        this.getTemplateRefContext()
      )
    } else if (content instanceof FlexRenderComponent) {
      return this.renderComponent(content)
    } else if (content instanceof Type) {
      return this.renderCustomComponent(content)
    } else {
      return null
    }
  }

  private renderStringContent(): EmbeddedViewRef<unknown> {
    const context = () => {
      return typeof this.content === 'string' ||
        typeof this.content === 'number'
        ? this.content
        : this.content?.(this.props)
    }
    return this.viewContainerRef.createEmbeddedView(this.templateRef, {
      get $implicit() {
        return context()
      },
    })
  }

  private renderComponent(
    flexRenderComponent: FlexRenderComponent<TProps>
  ): ComponentRef<unknown> {
    const { component, inputs, injector } = flexRenderComponent

    const getContext = () => this.props

    const proxy = new Proxy(this.props, {
      get: (_, key) => getContext()?.[key as keyof typeof _],
    })

    const componentInjector = Injector.create({
      parent: injector ?? this.injector,
      providers: [{ provide: FlexRenderComponentProps, useValue: proxy }],
    })

    const componentRef = this.viewContainerRef.createComponent(component, {
      injector: componentInjector,
    })
    for (const prop in inputs) {
      if (componentRef.instance?.hasOwnProperty(prop)) {
        componentRef.setInput(prop, inputs[prop])
      }
    }
    return componentRef
  }

  private renderCustomComponent(
    component: Type<unknown>
  ): ComponentRef<unknown> {
    const componentRef = this.viewContainerRef.createComponent(component, {
      injector: this.injector,
    })
    for (const prop in this.props) {
      // Only signal based input can be added here
      if (componentRef.instance?.hasOwnProperty(prop)) {
        componentRef.setInput(prop, this.props[prop])
      }
    }
    return componentRef
  }

  private getTemplateRefContext() {
    const getContext = () => this.props
    return {
      get $implicit() {
        return getContext()
      },
    }
  }
}

export class FlexRenderComponent<T extends NonNullable<unknown>> {
  constructor(
    readonly component: Type<unknown>,
    readonly inputs: T = {} as T,
    readonly injector?: Injector
  ) {}
}

const FlexRenderComponentProps = new InjectionToken<NonNullable<unknown>>(
  '[@tanstack/angular-table] Flex render component context props'
)

export function injectFlexRenderContext<T extends NonNullable<unknown>>(): T {
  return inject<T>(FlexRenderComponentProps)
}
