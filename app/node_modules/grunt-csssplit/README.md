[![Dependency Status](https://david-dm.org/project-collins/grunt-csssplit.svg)](https://david-dm.org/project-collins/grunt-csssplit)
[![devDependency Status](https://david-dm.org/project-collins/grunt-csssplit/dev-status.svg)](https://david-dm.org/project-collins/grunt-csssplit#info=devDependencies)
# DEPRECATED

This project is no longer maintained. If you are still supporting ie9 then you have my sympathies! 

# grunt-csssplit

> IE Sucks. Who knew?

IE9 has a per file css selector limit of 4096. Why? Because Bill hates you, that's why.
grunt-csssplit makes use of css-parse and css-stringify from the reworkcss project to split css files
into a size which IE9 can handle.

## Getting Started

This plugin requires Grunt `~0.4.0`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-csssplit --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-csssplit');
```

## The "csssplit" task

### Overview

In your project's Gruntfile, add a section named `csssplit` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  csssplit: {
    your_target: {
      src: ['path/or/paths/to/your/css'],
      dest: 'directory/to/write/split/css/to',
      options: {
          maxSelectors: 4095,
          maxPages: 3,
          suffix: '_page_'
      }
    },
  },
});
```

### Options

#### options.maxSelectors

Type: `Number`

Default value: `4095`

The maximum number of selectors for each output css file

#### options.maxPages

Type: `Number` or `Boolean`

Default value: `false`

Warn if the number of pages output for any input file exceeds this number. Useful for
situations where html needs editing if the output file count increases.

#### options.suppressSinglePage

Type: `Boolean`

Default value: `false`

Controls whether or not to write a page file if it would be the only page for the given source file.

### Usage Examples

#### Default Options

This example would split `file.css` into as many files as necessary, with a limit of 4095
rules per output file. The output files would be named `file_page_1.css, file_page_2.css ... file_page_n.css`

```js
grunt.initConfig({
  csssplit: {
    your_target: {
      src: ['path/or/paths/to/your/file.css'],
      dest: 'directory/to/write/split/css/to'
    },
  },
});
```

#### Custom Options

This example would split `file.css` into a maximum of 3 files, with a limit of 1000
selectors per output file. The output files would be named `filePage1.css, filePage2.css ... filePagen.css`.
If the output per input file exceeded 3 files a warning would be fired.

```js
grunt.initConfig({
  grunt.initConfig({
    csssplit: {
      your_target: {
        src: ['path/or/paths/to/your/css'],
        dest: 'directory/to/write/split/css/to',
        options: {
            maxSelectors: 1000,
            maxPages: 3,
            suffix: 'Page'
        }
      },
    },
  });
});
```

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

0.1.0 Initial Release

0.1.1 Chage required Grunt version to '0.4.0'

0.1.2 Move to Github.

0.1.3 Oops, update the package too

0.2.0 Split on selectors instead of rules (@paazmaya)

0.2.1 Add dependency checking to README.md and update packages (@paazmaya & @RidiculousGnome)

0.2.2 Update packages (@RidiculousGnome)

0.2.3 Update packages (@RidiculousGnome)

0.2.4 Update packages (@RidiculousGnome)

0.3.0 Add file globbing ([MattCBowman](https://github.com/MattCBowman))

0.4.0 Add single file suppression. 0.3.0 Add file globbing ([mhupman](https://github.com/mhupman))
