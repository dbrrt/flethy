import * as fs from 'fs'
import * as path from 'path'
import { logger } from '../utils/Logger'
import { BrandExporter, LANDINGPAGE_CONSTANTS } from './brand.exporter'
import { DOCS_BASE } from './docs.exporter'
import metaBirthdays from '../../../../docs/meta/birthdays.json'

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
const OUTPUT_DIR = path.join(
  __dirname,
  '..',
  '..',
  '..',
  HTTP_CONFIGS_DIR_NAME,
  'src',
  'constants'
)
const CONFIG_CONST_FILENAME = 'configs.const.ts'
// INDEX
const INDEX_FILE = path.join(
  __dirname,
  '..',
  '..',
  '..',
  HTTP_CONFIGS_DIR_NAME,
  'src',
  'index.ts'
)
// API COUNT
const API_COUNT_FILE = path.join(__dirname, '..', '..', 'data.json')

interface MetaBirthdays {
  id: string
  created: {
    iso: string
    unix: number
  }
  updated: {
    iso: string
    unix: number
  }
}

export class ConfigsExporter {
  public static async export() {
    const imports: string[] = [
      `import { ApiDescription } from '../types/ApiDescription.type'`,
    ]
    const exports: string[] = []
    const mapEntries: string[] = []
    const birthdays: MetaBirthdays[] = metaBirthdays

    const files = fs.readdirSync(CONFIGS_DIR)
    const dataJsonContent = { apicount: files.length }
    const brandExporter = new BrandExporter()
    brandExporter.readLoadedBrands()
    for (const file of files) {
      const id = file.split('.')[0]
      if (!birthdays.find((birthday) => birthday.id === id)) {
        const stat = fs.statSync(`${CONFIGS_DIR}/${file}`)
        birthdays.push({
          id,
          created: {
            iso: stat.birthtime.toISOString(),
            unix: stat.birthtime.getTime(),
          },
          updated: {
            iso: stat.mtime.toISOString(),
            unix: stat.mtime.getTime(),
          },
        })
        logger.info(`Adding <${id}> to birthdays`)
      }
      if (file.split('.')[1] !== 'config') {
        continue
      }
      const configName = `${file.split('.')[0]}.${file.split('.')[1]}`
      logger.info(`ConfigsExporter | Loading Config <${file}>`)
      // eslint-disable-next-line no-await-in-loop
      const Config = await import(`${CONFIGS_DIR}/${configName}`)
      try {
        const instanceOfConfig = Config.default
        await brandExporter.exportOne(instanceOfConfig)
        imports.push(
          `import { ${instanceOfConfig.API.meta.name} } from '../configs/${configName}'`
        )
        exports.push(
          `export { ${instanceOfConfig.API.meta.name} } from './configs/${configName}'`
        )
        mapEntries.push(
          `['${instanceOfConfig.API.meta.id}', ${instanceOfConfig.API.meta.name}.API],`
        )
      } catch (error) {
        logger.error(error)
      }
    }
    exports.push(
      `export { HttpRequestConfig, nao } from './utils/Request.utils'`
    )
    exports.push(`export type { ConfigType } from './types/ConfigType.type'`)
    exports.push(
      `export { CONFIG_TYPES } from './configTypes/configTypes.const'`
    )
    const constantContent: string[] = [...imports, '']
    constantContent.push(
      `export const CONFIGS: Map<string, ApiDescription<any, any>> = new Map<string, ApiDescription<any, any>>([`
    )
    constantContent.push(...mapEntries)
    constantContent.push(`])`)
    logger.info(`Writing output...`)
    fs.writeFileSync(
      `${OUTPUT_DIR}/${CONFIG_CONST_FILENAME}`,
      constantContent.join('\n')
    )
    logger.info(`Writing exports...`)
    fs.writeFileSync(INDEX_FILE, exports.join('\n'))
    logger.info(`Exported ${files.length} configs.`)
    logger.info(`Writing data json...`)
    fs.writeFileSync(API_COUNT_FILE, JSON.stringify(dataJsonContent))
    fs.writeFileSync(
      `${LANDINGPAGE_CONSTANTS}/api.const.ts`,
      `export const API_COUNT = ${files.length}`
    )
    fs.writeFileSync(
      `${DOCS_BASE}/meta/birthdays.json`,
      JSON.stringify(birthdays)
    )
    await brandExporter.fetchLogos()
    brandExporter.exportLogosToLandingPage()
  }
}
