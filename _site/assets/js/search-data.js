var store = [{
        "title": "First Blog Post!",
        "excerpt":"This is my very first blog post – ever! I’m very excited! Some things I need to remember:   This blog is using Kramdown for markdown  It supports MathJax  The free Font Awesome provides some great icons  This blog uses both “category” (i.e. creates a folder name  work, demo, etc)  and “tag” (i.e. labels a post with  C#, Java, algorithm, etc)  so make good use of themLet’s see this come to life! ","categories": [],
        "tags": [],
        "url": "http://localhost:4000/first-blog-post/"
      },{
        "title": "Integrating JavaScript In Jekyll",
        "excerpt":"I was wondering about integrating JavaScript into my Software Design blog and Markdown clearly didn’t support HTML… at least that was what I thought. I still made Jekyllimport my JavaScript code on my request. 123456789101112There are several ways to include JavaScript on demand using Jekyll.   RAW HTML which looked messy but it does work  Modify the header code generated by Jekyll to import JavaScript into the Post  Modify the header code generated by Jekyll to use a script elementI rejected option 1, though I may use it one day, because it is just messy. Everything must be tightly aligned on the left of the text which is okay for something short butterrible for longer scripts. I rejected option 2 because I seem to prefer having my javascript loaded remotely rather than having it embedded into my page. In the end it isn’t much different than option 3. I took the option of having Jekyll generate a separate script element to import multiple scripts from a remote location. I just add a tag at the top of the post and my script is loaded and ready to run. ","categories": [],
        "tags": ["javascript"],
        "url": "http://localhost:4000/integrating_javascript/"
      },{
        "title": "Integrating HTML5 Canvas In Jekyll",
        "excerpt":"I was just wondering about integrating the HTML5 canvas into my Software Design blog like I did with JavaScript last week. Canvas is still basically JavaScript with a Canvas element. Your browser does not support the HTML5 canvas tag.I saw this clock as a demo a long time ago and I was happily able to reproduce it. ","categories": [],
        "tags": ["javascript","html"],
        "url": "http://localhost:4000/integrating_canvas/"
      }]
