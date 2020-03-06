import {
  useInstance,
  useUpdateClassName,
  useIsomorphicLayoutEffect,
} from './util-hooks';

export default function useSingletonGenerator(createSingleton) {
  return function useSingleton({
    className,
    disabled = false,
    ignoreAttributes = true,
    ...restOfNativeProps
  } = {}) {
    const component = useInstance({
      children: [],
      renders: 1,
    });

    const props = {
      ignoreAttributes,
      ...restOfNativeProps,
    };

    const deps = [component.children.length];

    useIsomorphicLayoutEffect(() => {
      const {children, sourceData} = component;
      const instance = createSingleton(
        children.map(child => child.instance),
        sourceData.props,
      );

      component.instance = instance;

      if (disabled) {
        instance.disable();
      }

      return () => {
        instance.destroy();
        component.children = children.filter(
          ({instance}) => !instance.state.isDestroyed,
        );
      };
    }, deps);

    useIsomorphicLayoutEffect(() => {
      if (component.renders === 1) {
        component.renders++;
        return;
      }

      const {instance} = component;

      instance.setProps(props);

      if (disabled) {
        instance.disable();
      } else {
        instance.enable();
      }
    });

    useUpdateClassName(component, className, deps);

    const source = {
      data: component,
      hook(data) {
        component.sourceData = data;
      },
    };

    const target = {
      hook(data) {
        component.children.push(data);
      },
    };

    return [source, target];
  };
}