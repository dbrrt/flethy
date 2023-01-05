import * as fs from 'fs'
import * as path from 'path'
import { ApiDescription } from '../../../connectors/src/types/ApiDescription.type'
import { logger } from '../utils/Logger'

const CONFIGS_DIR_NAME = 'configs'
const HTTP_CONFIGS_DIR_NAME = 'connectors'
const CONFIGS_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  HTTP_CONFIGS_DIR_NAME,
  'src',
  CONFIGS_DIR_NAME
)

export const DOCS_BASE = path.join(__dirname, '..', '..', '..', '..', 'docs')
const API_FOLDER = 'api'
export const DOCUSAURUS_BASE = path.join(
  __dirname,
  '..',
  '..',
  '..',
  '..',
  'apps',
  'docs',
  'docs',
  'integrations'
)

interface Documentation {
  meta: {
    id: string
    title: string
    description: string
    sidebar_label: string
  }
  filename: string
  markdown: string[]
}

interface Readme extends Documentation {
  web3: string[]
  web2: string[]
}

export class DocsExporter {
  public static async export() {
    const docs: Documentation[] = []
    const readme: Readme = {
      meta: {
        id: 'readme',
        title: 'README',
        description: 'README',
        sidebar_label: 'README',
      },
      filename: 'README.md',
      markdown: [
        `# @flethy/connectors`,
        '',
        'The following Endpoints are currently supported.',
        '',
        '## API',
        '',
      ],
      web3: ['', '### Web3', ''],
      web2: ['', '### Web2', ''],
    }

    const files = fs.readdirSync(CONFIGS_DIR)
    for (const file of files) {
      const configName = `${file.split('.')[0]}.${file.split('.')[1]}`
      logger.info(`DocsExporter | Loading Config <${file}>`)
      // eslint-disable-next-line no-await-in-loop
      const Config = await import(`${CONFIGS_DIR}/${configName}`)
      try {
        const instanceOfConfig = Config.default
        const api: ApiDescription<any, any> = instanceOfConfig.API

        if (api.meta.tags.includes('web3')) {
          readme.web3.push(
            `* [${api.meta.name}](./${API_FOLDER}/${api.meta.id}.md)`
          )
        }
        if (api.meta.tags.includes('web2')) {
          readme.web2.push(
            `* [${api.meta.name}](./${API_FOLDER}/${api.meta.id}.md)`
          )
        }

        const markdown: string[] = [`# ${api.meta.name}`, '']
        markdown.push(`## Links`)
        markdown.push(``)
        markdown.push(`* URL: [${api.meta.url}](${api.meta.url})`)
        markdown.push(`* Documentation: [${api.meta.docs}](${api.meta.docs})`)
        markdown.push(`* Tags: ${api.meta.tags.join(', ')}`)
        markdown.push(`* Category: ${api.meta.category}`)
        markdown.push(`* Type: ${api.meta.type}`)

        markdown.push(``)
        markdown.push(`## API`)
        markdown.push(``)

        if (api.auth) {
          markdown.push(`### Authentication`)
          markdown.push(``)
          Object.keys(api.auth).forEach((key) => {
            markdown.push(`* ${key}: ${api.auth[key].type}`)
          })
          markdown.push(``)
        }

        Object.keys(api.api).forEach((key) => {
          markdown.push(`### ${key}`)
          markdown.push(``)
          Object.keys(api.api[key]).forEach((subkey) => {
            markdown.push(`#### ${subkey}`)
            markdown.push(``)
            const endpoint = api.api[key][subkey]
            if (endpoint.auth) {
              markdown.push(`##### Authentication`)
              markdown.push(``)
              Object.keys(endpoint.auth).forEach((authkey) => {
                markdown.push(`* ${authkey}: ${endpoint.auth[authkey].type}`)
              })
              markdown.push(``)
            }
            markdown.push(`##### ${endpoint.meta.title}`)
            markdown.push(``)
            markdown.push(`* Description: ${endpoint.meta.description}`)
            markdown.push(
              `* Docs: [${endpoint.meta.docs}](${endpoint.meta.docs})`
            )
            markdown.push(``)
          })
        })

        docs.push({
          meta: {
            id: api.meta.id,
            title: api.meta.name,
            description: api.meta.name,
            sidebar_label: api.meta.name,
          },
          filename: `${api.meta.id}.md`,
          markdown,
        })
      } catch (error) {
        logger.error(error)
      }
    }
    logger.info(`Writing output...`)

    const sidebarsArray: Array<{ type: string; id: string }> = [
      { type: 'doc', id: 'integrations/start' },
    ]

    for (const doc of docs) {
      logger.info(`Writing ${doc.filename}`)
      fs.writeFileSync(
        `${DOCS_BASE}/${API_FOLDER}/${doc.filename}`,
        doc.markdown.join('\n')
      )
      logger.info(`Writing Docusaurus Docs for ${doc.meta.id}`)

      const id = doc.meta.id === 'readme' ? 'readmecom' : doc.meta.id

      const docusaurusDoc = `---
id: ${id}
title: ${doc.meta.title}
sidebar_label: ${doc.meta.sidebar_label}
description: ${doc.meta.description}
---
`

      fs.writeFileSync(
        `${DOCUSAURUS_BASE}/${id}.mdx`,
        [docusaurusDoc, ...doc.markdown].join('\n')
      )

      sidebarsArray.push({ type: 'doc', id: `integrations/${id}` })
    }

    logger.info(`Writing ${readme.filename}`)
    fs.writeFileSync(
      `${DOCS_BASE}/${readme.filename}`,
      `${readme.markdown.join('\n')}${readme.web3.join(
        '\n'
      )}\n${readme.web2.join('\n')}`
    )

    logger.info(`Writing sidebars`)
    fs.writeFileSync(
      `${DOCUSAURUS_BASE}/sidebar.js`,
      `module.exports = ${JSON.stringify(sidebarsArray)};`
    )
  }
}
