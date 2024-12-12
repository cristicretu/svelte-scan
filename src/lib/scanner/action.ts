import { scanComponent } from ".";

interface ScanParams {
  props: Record<string, any>;
  componentName: string;
}

export function scan(node: HTMLElement, params: string | ScanParams) {
  if (typeof params === "string") {
    return scanComponent(node, params);
  }

  const scanner = scanComponent(node, params.componentName);

  // Initial props update
  scanner.update(params.props);

  return {
    ...scanner,
    update(newParams: ScanParams) {
      scanner.update(newParams.props);
    },
  };
}
