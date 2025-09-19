---
layout: post
title:  "Integrating HTML5 Canvas In Jekyll"
date:   2020-05-17 16:30:25 -0700
tags: javascript
js-list:
 - "/assets/js/clock2.js"
---
I was just wondering about integrating the HTML5 canvas into my Software Design blog like 
I did with JavaScript last week. Canvas is still basically JavaScript with a Canvas element.

<div id="loading">
  <p><strong>Loading...</strong></p>
</div>

<canvas id="canvas" width="400" height="400" style="padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: none;">
        Your browser does not support the HTML5 canvas tag.
</canvas>

I could have also added the canvas into the page using Kramdown...
```
<canvas>Your browser does not support the HTML5 canvas tag.</canvas>
{: #canvas width="400" height="400" style="padding-left: 0; padding-right: 0; margin-left: auto; margin-right: auto; display: none;"}
```

I saw this clock as a demo a long time ago and I was happily able to reproduce it.

<script>document.addEventListener("DOMContentLoaded",function () { clock() });</script>
