declare module 'webex-node-bot-framework' {
  // The library has no types. We import via dynamic import and use a structural
  // shim (defined in src/index.ts) for the actual types. This declaration just
  // satisfies tsc's module resolution.
  const Framework: unknown
  export default Framework
}
