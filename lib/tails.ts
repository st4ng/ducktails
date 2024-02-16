import chalk from "chalk"
import { watch } from "chokidar"
import fs from "fs/promises"
import path from "path"
import { Tail } from "tail"
import {
  FsTailWatcher,
  TailsConfig,
  TailsOptions,
  TailsStyle,
  TailsStyler,
  TailsStylerFunction,
  TailsStyles,
} from "./types.js"

const tagFileTemplate = "{file}"
const defaultTag = `[${chalk.cyanBright(tagFileTemplate)}] `

export const tails = (
  files: string | readonly string[],
  styler?: TailsStyler,
  tagTemplate = defaultTag
): FsTailWatcher => {
  const watcher: FsTailWatcher = watch(files).on("ready", () => {
    const onFileAdded = (file: string, fromBeginning: boolean) => {
      const fileTail = tail(file, { styler, tagTemplate, fromBeginning })
      watcher.emit("tail", file, fileTail)
    }

    watcher.on("add", (file) => onFileAdded(file, true))

    Object.entries(watcher.getWatched())
      .reduce<string[]>(
        (files, [dir, dirFiles]) => [
          ...files,
          ...dirFiles.map((file) => path.join(dir, file)),
        ],
        []
      )
      .forEach((file) => onFileAdded(file, false))
  })

  return watcher
}

export const tail = (file: string, options?: TailsOptions): Tail => {
  const { styler, tagTemplate = defaultTag, ...tailOptions } = options ?? {}

  const base = path.basename(file)
  const name = base.substring(0, base.length - path.extname(file).length)
  const tag = tagTemplate.replace(tagFileTemplate, name)

  const tail = new Tail(file, tailOptions)
  tail.on("line", (line: string) => {
    console.log(`${tag}${styler?.apply(line) ?? line}`)
  })

  return tail
}

export const loadConfig = async (file: string): Promise<TailsConfig> => {
  return JSON.parse(await fs.readFile(file, "utf8"))
}

export const getStyler = (styles: TailsStyles): TailsStyler => {
  const stylers: TailsStyler["styles"] = Object.entries(styles).map(
    ([key, value]): TailsStyler["styles"][number] => {
      const { regex = false, style = value as TailsStyle[] } =
        typeof value === "object" && !Array.isArray(value) ? value : {}
      return [
        regex ? new RegExp(key.replaceAll("\\[", "(?<!\\u001B)\\["), "g") : key,
        getStylerFunction(style),
      ]
    }
  )
  return {
    styles: stylers,
    apply: (value) => {
      return stylers.reduce((value, [searchValue, styler]) => {
        return value.replaceAll(searchValue, (match, ...capture) => {
          const numberOfCaptures = capture.findIndex(
            (c) => typeof c !== "string"
          )
          return numberOfCaptures === 0
            ? styler(match)
            : capture
                .slice(0, numberOfCaptures)
                .reduce((m, c) => m.replace(c, styler(c)), match)
        })
      }, value)
    },
  }
}

export const getStylerFunction = (style: TailsStyle[]): TailsStylerFunction =>
  style.reduce(
    (_chalk, property) =>
      typeof property === "string"
        ? _chalk[property]
        : // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          _chalk[property[0]](...property.slice(1)),
    chalk
  )
