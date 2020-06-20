// Fixes broken UIkit definitions

import UIkitOriginal from 'uikit';
import { EventEmitter } from 'events';

// eslint-disable-next-line
declare namespace UIkit {
  interface UIkitDropdownElement {
    show(): void;
    hide(delay?: boolean): void;
  }

  const dropdown: (element: string) => UIkitDropdownElement;
  const use: (plugin: any) => void;
  const util: {
    on: (element: string, event: string, listener: () => void) => void;
  };
}

const uikit: typeof UIkit & typeof UIkitOriginal = UIkitOriginal as any;

export default uikit;
