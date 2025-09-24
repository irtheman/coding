$(document).ready(function () {
  // banner
  const header = document.querySelector("header");
  if (header) {
    header.innerHTML = `
    <button class="mh-banner">Matthew's Official Website</button>
    <div class="mh-banner-content">
        <div class="mh-banner-content-center"><strong>Welcome to one of Matthew's official websites!</strong><br/></div>
        <div class="mh-banner-content-filler-first">&nbsp;</div>
        <div class="mh-banner-content-col1">
            <strong>Matthew's Websites</strong><br/>
            <ul>
                <li><a href="https://matthewhanna.com">Business Website</a></li>
                <li><a href="https://matthewhanna.net">Resume Website</a></li>
                <li><a href="https://blog.matthewhanna.net">Coding Blog</a> &check;</li>
                <li><a href="https://matthewhanna.me">Personal Blog</a></li>
            </ul>
        </div>
        <div class="mh-banner-content-col2">&nbsp;</div>
        <div class="mh-banner-content-col3">
            <strong>Managed Websites</strong><br/>
            <ul>
                <li><a href="https://jhausman.ninja">Jessica Hausman</a></li>
                <li><a href="https://msgdrinking.ninja">Drinking Giraffe Blog</a></li>
            </ul>
        </div>
        <div class="mh-banner-content-filler-second">&nbsp;</div>
        <div class="mh-banner-content-center">Feel free to explore and learn more about Matthew's work and interests!</div>
        <div class="mh-banner-content-center"><small>Please note, these websites are hobbies and not constantly maintained due to preferences for working.</small><small class="see-grid"> &#128295;</small></div>
        <div class="mh-banner-content-center">&nbsp;</div>
    </div>
`;

    if (!header.style.backgroundColor) {
      header.style.backdropFilter = "brightness(150%)";
    }

    const banner = header.querySelector(".mh-banner");
    if (banner) {
      if (!header.style.color) {
        header.style.color = window.getComputedStyle(banner).getPropertyValue("color");
        header.style.backgroundColor = window.getComputedStyle(header).getPropertyValue("background-color");
        header.style.backdropFilter = "";
      }

      banner.addEventListener("click", function () {
        this.classList.toggle("banner-active");
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
