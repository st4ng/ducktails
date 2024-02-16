import type { ChalkInstance, ColorName, ModifierName } from "chalk"
import type { FSWatcher } from "chokidar"
import type { Tail, TailOptions } from "tail"

/* *********************************************************
 *                         Config                          *
 ********************************************************* */
export type TailsConfig = {
  /**
   * A mapping of strings/regexes to styles. The string will be replaced within
   * each log line by its styled version. For regexes with capture groups, the
   * style will be applied to all matching capture groups of the regex.
   *
   * The styles are an array of chalk colors or modifiers, e.g.
   * `["red", "bold"]`. You can also use functions like rgb by passing a nested
   * array, where the first element is the function name and the rest is the
   * parameters, e.g. `[["rgb", 255, 255, 255], "bold"]`.
   *
   * @see {@link https://github.com/chalk/chalk} for more information
   * about colors and modifiers. Note: your terminal might not support all
   * of them.
   */
  styles?: TailsStyles
  /**
   * Tag that will be prepended to each logged line. The "{file}" placeholder
   * will be replaced with the filename the log line belongs to.
   *
   * If you don't want to apply a style you can also directly assign your
   * template instead of an object.
   *
   * Default template: "[{file}] "
   */
  tag?: TailsTag
}

export type TailsTag =
  | string
  | {
      template: string
      style: TailsStyle[]
    }

export type TailsStyles = {
  [key: string]: TailsStyle[] | TailsStyleOptions
}

export type TailsStyle =
  | ColorName
  | ModifierName
  | ChalkToTails<"rgb">
  | ChalkToTails<"hex">
  | ChalkToTails<"ansi256">
  | ChalkToTails<"bgRgb">
  | ChalkToTails<"bgHex">
  | ChalkToTails<"bgAnsi256">

export type TailsStyleOptions = {
  regex?: boolean
  style: TailsStyle[]
}

/* *********************************************************
 *                          Other                          *
 ********************************************************* */
export type TailsOptions = {
  styler?: TailsStyler
  tagTemplate?: string
} & TailOptions

export type TailsStylerFunction = (value: string) => string
export type TailsStyler = Readonly<{
  styles: ReadonlyArray<[string | RegExp, TailsStylerFunction]>
  apply: TailsStylerFunction
}>

export type TailsListener = (file: string, tail: Tail) => void
export type FsTailWatcher = FSWatcher & {
  on: (event: "tail", listener: TailsListener) => FsTailWatcher
  off: (event: "tail", listener: TailsListener) => FsTailWatcher
}

/* *********************************************************
 *                         Helper                          *
 ********************************************************* */
type ChalkToTails<T extends keyof ChalkInstance> = readonly [
  T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...Parameters<Extract<ChalkInstance[T], (...args: any) => any>>
]
