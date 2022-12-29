export class Logger {
  public static info(message: any) {
    Logger.log(message)
  }

  public static log(message: any) {
    console.dir(message, { depth: null })
  }
}
