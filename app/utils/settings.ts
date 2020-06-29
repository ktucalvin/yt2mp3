import Store from 'electron-store';

interface SettingsSchema {
  theme: string;
}

export default new Store<SettingsSchema>({
  defaults: {
    theme: 'system'
  },
  schema: {
    theme: {
      type: 'string',
      pattern: '(system|dark|light)'
    }
  }
});
