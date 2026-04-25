import Handlebars from 'handlebars'

/**
 * Register shared Handlebars helpers used across templates.
 * Idempotent - safe to call multiple times.
 */
export function registerHelpers(hb: typeof Handlebars = Handlebars): void {
  hb.registerHelper('eq', (a, b) => a === b)
  hb.registerHelper('or', (...args) => {
    // Last arg is Handlebars options object
    return args.slice(0, -1).some(v => !!v)
  })
  hb.registerHelper('and', (...args) => {
    return args.slice(0, -1).every(v => !!v)
  })
  hb.registerHelper('slug', (s: string) =>
    String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  )
  hb.registerHelper('today', () => new Date().toISOString().slice(0, 10))
  hb.registerHelper('json', (ctx: unknown) => JSON.stringify(ctx, null, 2))
}

export { Handlebars }
