const defaultSystemState = {
  downloadFolder: '', // These will be assigned in ../index.tsx
  platform: ''
};

export default function reduceSystem(state = defaultSystemState) {
  // State held underneath "system" should not change during application lifetime
  return state;
}
