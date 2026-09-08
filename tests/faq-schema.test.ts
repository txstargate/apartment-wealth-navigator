import { test, expect } from 'vitest'
import { buildFaqSchema } from '../src/lib/schema'

test('faq schema returns FAQPage with a mainEntity Q&A array', () => {
  const s = buildFaqSchema([
    { question: 'What is NOI, in plain language?', answer: 'Net operating income is what the building collects minus what it costs to operate.' },
  ])
  expect(s['@type']).toBe('FAQPage')
  expect(s.mainEntity).toHaveLength(1)
  expect(s.mainEntity[0]['@type']).toBe('Question')
  expect(s.mainEntity[0].name).toBe('What is NOI, in plain language?')
  expect(s.mainEntity[0].acceptedAnswer['@type']).toBe('Answer')
  expect(s.mainEntity[0].acceptedAnswer.text).toBe(
    'Net operating income is what the building collects minus what it costs to operate.',
  )
})
