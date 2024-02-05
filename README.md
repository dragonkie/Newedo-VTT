# Newedo System

![Foundry v11](https://img.shields.io/badge/foundry-v11-green)

official system for playing Newedo on foundryvtt

THIS SYSTEM IS IN DEVELOPMENT. SOME FEATURES MAY BE MISSING OR INCOMPLETE

## Usage

Before installing this system, you should rename any files that have `newedo` in their filename to use whatever machine-safe name your system needs, such as `adnd2e` if you were building a system for 2nd edition Advanced Dungeons & Dragons. In addition, you should search through the files for `newedo` and `Newedo` and do the same for those, replacing them with appropriate names for your system.

### System Generator

This project is also available as generator that can be run with npm: https://www.npmjs.com/package/generator-foundry

### Vue 3 Newedo

Alternatively, there's another build of this system that supports using Vue 3 components (ES module build target) for character sheet templates.

Head over to the [Vue3Newedo System](https://gitlab.com/asacolips-projects/foundry-mods/vue3newedo) repo if you're interested in using Vue!

### Tutorial

For much more information on how to use this system as a starting point for making your own, see the [full tutorial on the Foundry Wiki](https://founttttdryvtt.wiki/en/development/guides/SD-tutorial)!

## Compiling the CSS

This repo includes both CSS for the theme and SCSS source files. If you're new to CSS, it's probably easier to just work in those files directly and delete the SCSS directory. If you're interested in using a CSS preprocessor to add support for nesting, variables, and more, you can run `npm install` in this directory to install the dependencies for the scss compiler. After that, just run `npm run gulp` to compile the SCSS and start a process that watches for new changes.

![image](http://mattsmith.in/images/newedo.png)
