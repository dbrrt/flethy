import { RequestParams } from '../controllers/HttpRequestConfig'
import { ApiDescription } from '../types/ApiDescription.type'

export type OpenseaEntity = { assets; collections }
export type OpenseaEndpoint = { get }

export interface OpenseaParams extends RequestParams {
  'query:offset': number
  'query:limit': number
}

export interface OpenseaGetAssets extends OpenseaParams {
  kind: 'opensea.assets.get'
  'query:owner': string
  'query:asset_contract_address': string
  'query:order_direction': 'asc' | 'desc'
  'auth:X-API-KEY'?: string
}

export interface OpenseaGetCollections extends OpenseaParams {
  kind: 'opensea.collections.get'
  'query:asset_owner': string
  'auth:X-API-KEY'?: string
}

export const OPENSEA: ApiDescription<OpenseaEntity, OpenseaEndpoint> = {
  meta: {
    name: 'Opensea',
    url: 'https://opensea.io',
    docs: 'https://docs.opensea.io/',
  },
  base: 'https://api.opensea.io/api/v1',
  api: {
    assets: {
      get: {
        meta: {
          title: 'Retrieving assets',
          description:
            'To retrieve assets from our API, call the /assets endpoint with the desired filter parameters.',
          docs: 'https://docs.opensea.io/reference/getting-assets',
        },
        method: 'GET',
        auth: {
          'X-API-KEY': { type: 'header' },
        },
        paths: [
          {
            name: 'assets',
            type: 'static',
          },
        ],
      },
    },
    collections: {
      get: {
        meta: {
          title: 'Retrieving collections',
          description: 'Use this endpoint to fetch collections on OpenSea.',
          docs: 'https://docs.opensea.io/reference/retrieving-collections',
        },
        method: 'GET',
        auth: {
          'X-API-KEY': { type: 'header' },
        },
        paths: [
          {
            name: 'collections',
            type: 'static',
          },
        ],
      },
    },
  },
}
