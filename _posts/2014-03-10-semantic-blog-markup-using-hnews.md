---
layout: post
title: Semantic blog markup using hNews
---
Here's an example for properly formatted blog post markup using HTML5 and the hNews specification.

```html
<article class="hentry">
    <header>
        <h1 class="entry-title">THE TITLE</h1>
        <p class="entry-summary">THE TAGLINE</p>
        <time class="published" datetime="YYYY-MM-DDTHH:MM:SS+TZ">THE DATE</time>
        <p class="byline author vcard">by <span class="fn">THE AUTHOR</span></p>
    </header>
    <div class="entry-content">
        <p>SOME TEXT CONTENT</p>
        <figure>
            SOME MEDIA
            <figcaption>A CAPTION</figcaption>
        </figure>
        <aside>
            SHARING BUTTONS / ARTICLE RELATED STUFF
        </aside>
    </div>
    <footer>
        <p class="source-org vcard copyright">
            (c) 2014 <span class="org fn">THE LICENSE HOLDER</span>
        </p>
    </footer>
</article>
```

More info: [hNews microformat specification](http://microformats.org/wiki/hnews)
