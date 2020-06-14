// Extends UIkit definitions to actually include .use(plugin)

import UIkitOriginal from 'uikit';

// eslint-disable-next-line
declare namespace UIkit {
  const use: (plugin: any) => void;
}

const uikit: typeof UIkit & typeof UIkitOriginal = UIkitOriginal as any;

export default uikit;
