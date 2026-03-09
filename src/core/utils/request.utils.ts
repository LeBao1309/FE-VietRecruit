export const createQueryString = (params: Record<string, any>) => {
  return new URLSearchParams(params).toString()
}

export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
