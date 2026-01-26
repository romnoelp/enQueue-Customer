export type Purpose = 'payment' | 'clinic' | 'inquire' | 'misc'

export interface ContactCardProps {
  initialLocalPart?: string
  initialPurpose?: Purpose
  onSubmit?: (email: string, purpose: Purpose) => void
  className?: string
}
