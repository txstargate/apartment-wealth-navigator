// Which service page an article hands off to. Valuation has no service of
// its own: the NOI review is where a valuation question starts.
export const SERVICE_FOR_PILLAR: Record<string, { href: string; title: string }> = {
  noi: { href: '/services/noi/', title: 'NOI Navigator™' },
  refinance: { href: '/services/refinance/', title: 'Refinance Navigator™' },
  sale: { href: '/services/sale/', title: 'Exit Navigator™' },
  valuation: { href: '/services/noi/', title: 'NOI Navigator™' },
}

export function serviceForPillar(pillar: string) {
  return SERVICE_FOR_PILLAR[pillar] ?? { href: '/services/', title: 'Services' }
}
