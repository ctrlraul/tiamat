import { config } from 'dotenv'


// Set environment variables. We do this in
// this file just so the env vars are loaded
// as soon as any file needs them.
config()


export function env (name: string, defaultValue?: string): string {
  
  const value = process.env[name]

  if (value) {
    return value
  }

  if (typeof defaultValue === 'string') {
    return defaultValue
  }

  throw new TypeError(`Missing process.env.${name}`)

}
