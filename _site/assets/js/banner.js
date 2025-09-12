$(document).ready(function () {
  // banner
  const header = document.querySelector("header");
  if (header) {
    header.innerHTML = `
    <button class="mh-banner">Matthew's Official Website</button>
    <div class="mh-banner-content">
        <div class="mh-banner-content-center"><strong>Welcome to one of Matthew's official websites!</strong><br/></div>
        <div class="mh-banner-content-filler-first">&nbsp;</div>
        <div>
            <strong>Matthew's Websites</strong><br/
            <ul>
                <li><a href="https://matthewhanna.com">Business Website</a></li>
                <li><a href="https://matthewhanna.net">Resume Website</a></li>
                <li><a href="https://blog.matthewhanna.net">Coding Blog</a></li>
                <li><a href="https://matthewhanna.me">Personal Blog</a></li>
            </ul>
        </div>
        <div>&nbsp;</div>
        <div>
            <strong>Managed Websites</strong><br/
            <ul>
                <li><a href="https://jhausman.ninja">Jessica Hausman</a></li>
                <li><a href="https://msgdrinking.ninja">Drinking Giraffe Blog</a></li>
            </ul>
        </div>
        <div class="mh-banner-content-filler-second">&nbsp;</div>
        <div class="mh-banner-content-center">Feel free to explore and learn more about Matthew's work and interests!</div>
    </div>
`;

    const coll = document.getElementsByClassName("mh-banner");
    for (let i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
          content.style.maxHeight = null;
        } else {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      });
    }
  }
});
