// Test stub for the `cloudflare:workers` virtual module, which only exists in
// the Worker runtime. Tests that transitively import it get an empty env; any
// test exercising real bindings should inject a test database instead.
export const env = {} as Record<string, unknown>
