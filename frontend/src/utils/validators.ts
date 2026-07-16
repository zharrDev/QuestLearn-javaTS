
export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')
