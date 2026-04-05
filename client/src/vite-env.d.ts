/// <reference types="vite/client" />

declare module "*.jsx" {
  const component: React.FC;
  export default component;
}

declare module "./game" {
  export function startGame(): void;
}
