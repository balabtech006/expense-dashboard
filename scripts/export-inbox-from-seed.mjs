import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'

const seedPath = 'src/data/seedTransactions.ts'
if (!existsSync(seedPath)) {
  console.warn('seedTransactions.ts missing; skip inbox export')
  process.exit(0)
}

let text = readFileSync(seedPath, 'utf8')
const m = text.match(/export const SEED_TRANSACTIONS[^=]*=\s*(\[[\s\S]*\])\s*/)
if (!m) {
  console.error('Could not parse SEED_TRANSACTIONS array')
  process.exit(1)
}

function singleQuotesToDouble(src) {
  let out = ''
  for (let i = 0; i < src.length; i++) {
    const c = src[i]
    if (c === "'") {
      out += '"'
      i++
      while (i < src.length) {
        if (src[i] === '\\') {
          out += src.slice(i, i + 2)
          i += 2
          continue
        }
        if (src[i] === "'") {
          out += '"'
          break
        }
        if (src[i] === '"') {
          out += '\\"'
          i++
          continue
        }
        out += src[i]
        i++
      }
      continue
    }
    out += c
  }
  return out
}

let s = m[1]
s = s.replace(/([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":')
s = singleQuotesToDouble(s)
s = s.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')

const data = JSON.parse(s)
mkdirSync('public/inbox', { recursive: true })
const body = data.map((t) => JSON.stringify(t)).join('\n') + '\n'
writeFileSync('public/inbox/transactions.jsonl', body)
console.log('exported inbox', data.length, 'rows', body.length, 'bytes')
