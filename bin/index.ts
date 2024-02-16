#!/usr/bin/env node
import chalk from "chalk"
import { Command } from "commander"
import path from "path"
import {
  getStyler,
  getStylerFunction,
  loadConfig,
  tails,
} from "../lib/tails.js"
import { TailsConfig } from "../lib/types.js"

// @ts-expect-error assert is required
import packageJson from "../package.json" assert { type: "json" }

const init = (name: string, version: string) => {
  const cmd = new Command(name)
    .version(version)
    .argument("<files...>", "files, directories or globs")
    .usage(`[${chalk.cyanBright("options")}] <${chalk.green("files...")}>`)
    .option("-c, --config <file>", "path to config")
    .allowExcessArguments(false)
    .allowUnknownOption(false)
    .action(
      async (files: string[], { config: configFile }: { config?: string }) => {
        const { styles, tag }: TailsConfig = configFile
          ? await loadConfig(configFile)
          : {}

        const watcher = tails(
          files,
          styles ? getStyler(styles) : undefined,
          typeof tag === "object"
            ? getStylerFunction(tag.style)(tag.template)
            : tag
        )

        watcher.on("tail", (file) => {
          console.log(chalk.cyan(`Watching file "${path.basename(file)}"...`))
        })
      }
    )
    .configureOutput({ writeErr: (error) => console.error(chalk.red(error)) })

  cmd.parse(process.argv)
}

init(packageJson.name, packageJson.version)
