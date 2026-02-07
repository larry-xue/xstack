import { initClient, tsRestFetchApi, type ApiFetcherArgs } from '@ts-rest/core'
import { contract } from '@repo/contracts'

export type { ErrorEnvelope, SdkError } from './errors'
export { parseErrorEnvelope } from './errors'

export type CreateClientArgs = {
  baseUrl: string
  getAccessToken?: () => string | null | undefined | Promise<string | null | undefined>
}

export const createClient = ({ baseUrl, getAccessToken }: CreateClientArgs) => {
  const api = async (args: ApiFetcherArgs) => {
    if (!getAccessToken) {
      return tsRestFetchApi(args)
    }

    const token = await getAccessToken()
    if (!token) {
      return tsRestFetchApi(args)
    }

    const authorization = token.toLowerCase().startsWith('bearer ') ? token : `Bearer ${token}`

    return tsRestFetchApi({
      ...args,
      headers: {
        ...args.headers,
        authorization,
      },
    })
  }

  return initClient(contract, { baseUrl, api })
}
