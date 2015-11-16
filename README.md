# Ripple | PreCSS
[![Coverage Status](https://coveralls.io/repos/rijs/precss/badge.svg?branch=master&service=github)](https://coveralls.io/github/rijs/precss?branch=master)
[![Build Status](https://travis-ci.org/rijs/precss.svg)](https://travis-ci.org/rijs/precss)

Pre-applies CSS styles to a component before rendering it. Using the following syntax:

```html
<component-name css="styles.css">
```

A style tag with the CSS styles from the specified resource will be added to the beginning of the Shadow Root

```html
<style resource="styles.css"> /* ... */ </style>
```

If there is no Shadow DOM, the styles will scoped and added to the end of the document head. The style tags are deduped so there will only be one for each specfic CSS resource in use.

Multiple CSS modules are also possible:

```html
<component-name css="component-styles.css fa-circle.css fa-square.css">
```