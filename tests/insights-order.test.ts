import { test, expect } from 'vitest'
import { orderInsights } from '../src/lib/content'

const e = (title: string, pillar: string, dcCounterpart?: string) => ({ data: { title, pillar, dcCounterpart } })

test('guides lead their pillar and pillars run valuation, noi, refinance, sale', () => {
  const out = orderInsights([
    e('5 Signals It Is Time to Sell', 'sale'),
    e('DSCR', 'refinance'),
    e('How to Refinance', 'refinance', 'refinance-dc'),
    e('Utility Leaks', 'noi'),
    e('How to Increase NOI', 'noi', 'noi-dc'),
    e('How to Prepare for Sale', 'sale', 'sale-dc'),
    e('What Is My Building Worth', 'valuation', 'worth-dc'),
    e('Revenue Capture', 'noi'),
  ]).map((x) => x.data.title)
  expect(out).toEqual([
    'What Is My Building Worth',
    'How to Increase NOI',
    'Revenue Capture',
    'Utility Leaks',
    'How to Refinance',
    'DSCR',
    'How to Prepare for Sale',
    '5 Signals It Is Time to Sell',
  ])
})
