import { FetchMethod, FetchParams, FetchResponseType } from './FetchParams.type'
import { CATEGORY, TAG, TYPE } from './ServiceCategory.type'

export interface ApiDescription<Entity, Endpoint> {
  meta: {
    id: string
    name: string
    url: string
    docs: string
    signup?: string
    pricing?: string
    social?: {
      twitter?: string
      github?: string
      instagram?: string
    }
    tags: TAG[]
    category: CATEGORY
    type: TYPE
    config?: string
  }
  base: string | ApiDescriptionBase[]
  auth?: { [key: string]: ApiDescriptionAuth }
  headers?: { [key: string]: string }
  api: {
    [entity in keyof Entity]: {
      [endpoint in keyof Endpoint]: ApiDescriptionEndpoint
    }
  }
}

export interface ApiDescriptionPath {
  name: string
  type: 'static' | 'param' | 'auth'
}

export interface ApiDescriptionEndpoint {
  method: FetchMethod
  interface: string
  base?: string | ApiDescriptionBase[]
  auth?: { [key: string]: ApiDescriptionAuth }
  paths?: ApiDescriptionPath[]
  options?: ApiDescriptionEndpointOptions
  meta: {
    title: string
    description: string
    docs: string
  }
  query?: { [key: string]: string }
  params?: any
  transform?: {
    [key: string]: {
      type: 'prefix'
      value?: string
    }
  }
  responseType?: FetchResponseType
}

export interface ApiDescriptionEndpointOptions {
  pathTailingSlash?: boolean
  emptyBody?: boolean
}

export interface ApiDescriptionEndpointParam {
  type: 'enum' | 'string' | 'number' | 'any'
  required: boolean
  paramType: 'query' | 'path' | 'body' | 'bodyform'
  values?: string[]
  description?: string
}

export interface ApiDescriptionAuth {
  type:
    | 'query'
    | 'header'
    | 'header:basic'
    | 'header:basic:encoded'
    | 'header:bearer'
    | 'header:token'
    | 'header:custom'
    | 'header:key'
    | 'header:oauth1a'
    | 'path'
    | 'body'
    | 'body:form'
    | 'subdomain'
  authHandler?: (fetchParams: FetchParams, authValue: string) => void
  transform?: (authValue: string) => string
  custom?: {
    prefix?: string
    postfix?: string
    concat?: {
      keys: string[]
      separator: string
    }
  }
  options?: {
    oauth1SignatureMethod?: 'HMAC-SHA1' | 'HMAC-SHA256'
    oauth1data?: {
      [key: string]: string // params value from request : params value to be sent
    }
  }
}

export interface ApiAuthBasic {
  username: string
  password?: string
}

export interface ApiDescriptionBase {
  id: string
  url: string
}
