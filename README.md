<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/st4ng/ducktails/main/docs/ducktails-header-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/st4ng/ducktails/main/docs/ducktails-header-light.png">
  <img alt="Projects logo" src="https://raw.githubusercontent.com/st4ng/ducktails/main/docs/ducktails-header-light.png">
</picture>



_ducktails_ is a `tail -f`-like live log CLI tool for one or multiple files, directories or globs with colorful formatting options.

☑ live log of **multiple files, directories or globs**

☑ automatically **pick up new files** created while running

☑ customize **colors and other styling options**

## 🦆 Usage

`npx ducktails [options] <files...>`

```
$ npx ducktails --help

Usage: tails [options] <files...>

Arguments:
  files                file paths or globs

Options:
  -V, --version        output the version number
  -c, --config <file>  path to config
  -h, --help           display help for command
```

## 🎨 Formatting

_ducktails_ uses [chalk](https://github.com/chalk/chalk) for formatting, configured via a json config file.

Here's an example with explanations and its output:

```jsonc
{
  // Use the schema property for autocompletion in editors
  // like VS Code - ducking awesome!
  "$schema": "https://github.com/st4ng/ducktails/releases/download/v0.1.0/ducktails.schema.json",

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
  "styles": {
    // If you use a string, you can directly assign the style
    "ducks": ["underline"],
    // If you want to use a regex, you must use an object and
    // set regex true.
    "\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}": {
      "regex": true,
      "style": ["blue"]
    },
    "\\[(warn)\\] (.*)": {
      "regex": true,
      "style": ["yellow"]
    },
    "\\[(error).*?\\](.*)|(^ *at .*)": {
      "regex": true,
      "style": ["red"]
    }
  },
  /**
   * Tag that will be prepended to each logged line. The "{file}" placeholder
   * will be replaced with the filename the log line belongs to.
   *
   * If you don't want to apply a style you can also directly assign your
   * template instead of an object.
   *
   * Default template: "[{file}] "
   */
  "tag": {
    "template": "{file}| ",
    "style": ["grey"]
  }
}
```

##### Output

<img src="https://raw.githubusercontent.com/st4ng/ducktails/main/docs/ducktails-example-output.png" width="720">
