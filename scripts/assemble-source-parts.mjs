import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs'
import { dirname, join } from 'path'

const partsDir = '.github/source-parts'
if (!existsSync(partsDir)) {
  console.log('no source-parts dir; skip')
  process.exit(0)
}
const files = readdirSync(partsDir).filter((f) => /\.\d{2}$/.test(f))
const groups = new Map()
for (const f of files) {
  const name = f.replace(/\.\d{2}$/, '')
  if (!groups.has(name)) groups.set(name, [])
  groups.get(name).push(f)
}
const targets = {
  'Plan.tsx': 'src/components/Plan.tsx',
  'Analytics.tsx': 'src/components/Analytics.tsx',
  'Dashboard.tsx': 'src/components/Dashboard.tsx',
  'seedTransactions.ts': 'src/data/seedTransactions.ts',
  'transactions.jsonl': 'public/inbox/transactions.jsonl',
}
for (const [name, parts] of groups) {
  parts.sort()
  const target = targets[name]
  if (!target) {
    console.warn('skip unknown', name)
    continue
  }
  const body = parts.map((p) => readFileSync(join(partsDir, p), 'utf8')).join('')
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, body)
  console.log('assembled', target, body.length)
}
