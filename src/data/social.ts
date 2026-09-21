// Social profiles shown as footer icons and declared in the identity schema.
// A profile with an empty url is not rendered. Fill a url only once Shafiq
// confirms the handle; never guess one (Golden Rule). Keep this list and the
// Person sameAs in src/data/person-professionalservice.json in step.

export interface SocialProfile {
  id: 'linkedin' | 'youtube' | 'x' | 'facebook' | 'instagram' | 'tiktok'
  label: string
  url: string
}

export const SOCIAL_PROFILES: SocialProfile[] = [
  { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/shafiqhirani/' },
  { id: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@ShafiqHiraniCRE' },
  { id: 'x', label: 'X', url: 'https://x.com/shafiqhirani' },
  { id: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/shafiq.hirani/' },
  { id: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/shafiqhirani/' },
  { id: 'tiktok', label: 'TikTok', url: 'https://www.tiktok.com/@shafiqhirani' },
]

export function activeProfiles(profiles: SocialProfile[] = SOCIAL_PROFILES): SocialProfile[] {
  return profiles.filter((p) => /^https:\/\//.test(p.url))
}
