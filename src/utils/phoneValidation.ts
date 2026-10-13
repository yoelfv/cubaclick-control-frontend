export function isValidUsPhone(phone: string): boolean {
  const trimmedPhone = phone.trim()

  if (trimmedPhone.startsWith('+')) {
    const digits = trimmedPhone.replace(/\D/g, '')

    return digits.length === 11 && digits.startsWith('1')
  }

  const digits = trimmedPhone.replace(/\D/g, '')

  if (digits.length === 10) {
    return true
  }

  return digits.length === 11 && digits.startsWith('1')
}

export function isValidCubaPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 8) {
    return true
  }

  if (digits.length === 10 && digits.startsWith('53')) {
    return true
  }

  return false
}