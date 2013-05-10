# A11YLint Brackets Extension
******

A11YLint Brackets Extension aims to bring the same kind of in-context, immediate feedback that you get from JSLint/JSHint and other linting tools, but regarding issues in your HTML that would affect how accessible your content is.

## Getting Started

Download and install the A11YLint Brackets Extension the same way you would download [Other Brackets Extensions](https://github.com/adobe/brackets/wiki/Brackets-Extensions)

## Turn It On

You Enable / Disable A11YLint in the Brackets > View menu, in the same way you turn on/off JSLint

## What It Gives You

An output panel at the bottom of the screen, just like JSLint, with line numbers, messages and code snippets if there are issues.  Clicking on an error scrolls the editor to that line, so you can change things easily.

## Background

I was lucky enough to have some really smart people help me out at work with some accessibility related code.  And what I learned in that process was that if you try to bolt it on at the end it's just painful.  So I wanted something that I could have in my editor to point out when I was leaving out the important stuff.

### What I Meant To Do

What I really wanted to do was create a nicely portable JS library that was modeled after JSLint.  I wanted to implement the same interfaces and do things the same way, so that people who already had JSLint integrations could easily integrate A11YLint into the same processes.

### What I Actually Did

I went a little mental trying to do that.  Someone pointed me to an existing project called [arialinter](https://github.com/globant-ui/arialinter) that I hoped I could just drag and drop into a Brackets extension, but the arialinter is really more Grunt-focused, and there was a lot of modification I would have needed to do.  So instead I ended up pulling out the [JSHint Brackets Extension](https://github.com/cfjedimaster/brackets-jshint), mining it for the interface to Brackets that I wanted, and pulling in the rules as defined in the arialier (though I had to heavily modify some of them along the way in order to make things work).

So in the end, there's a bit of JSLint, a bit of JSHint, quite a lot from arialinter all plugged in here.  I owe a tremendous debt of gratitude to all of those projects and their authors for cutting a trail.

### Known Issues

#### Security

This extension currently works by loading the HTML from your editor into a hidden div and manipulating it.  This means if there is some javascript in your code, that JS could break Brackets (for example, by trying to load in another version of jQuery).  The extension is trying to account for that by replacing \<script and \<\/script with \<noscript and \<\/noscript, but that's not security.  Loading this into an iframe or doing something smarter is called for, but I'd rather push this out now than hold off.  Be aware and smart.

## License

MIT License. I don't think there's enough in here from JSLint or JSHint to require using their modified license, but I'm prepared to be wrong about that.

## Credit

- Built using [Brackets](https://github.com/adobe/brackets)
 - Thank to  [Glenn Ruehle](https://github.com/gruehle) for some great pointers, and for enduring my excitement.
- Made readable and sane by [JSLint](http://www.jslint.com/)
- Guided by the [JSHint Brackets Extension](https://github.com/cfjedimaster/brackets-jshint) written by [Raymond Camden](https://github.com/cfjedimaster)
- Heavily Informed by the [arialinter](https://github.com/globant-ui/arialinter/) written by [Esteban S. Abait](https://github.com/eabait)
 - Which pulls in [color](https://github.com/harthur/color) by [Heather Arthur](https://github.com/harthur)
