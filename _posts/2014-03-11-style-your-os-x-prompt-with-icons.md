---
layout: post
title: Style your OS X prompt with icons
---
Inspired by Andre Torrez' note [*Put a burger in your shell*](http://notes.torrez.org/2013/04/put-a-burger-in-your-shell.html), i just styled the prompt on my Mac with a *see-no-evil monkey*.

![My new prompt...](/media/prompt-with-monkey.png)

You have to insert something like this into your `~/.bash_profile`:

```bash
export PS1="\e[35;1m\w\e[0m 🙈  \e[30;1m# \e[0m"
```

You can browse UTF-8 symbols and directly copy your desired symbol at [FileFormats.org](http://www.fileformat.info/info/unicode/block/index.htm).

Colorcodes, sequences and more information on prompt styling can be found at [IBM DeveloperWorks](http://www.ibm.com/developerworks/linux/library/l-tip-prompt/).