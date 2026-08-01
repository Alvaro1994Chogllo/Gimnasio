import re

def convert():
    with open('c:/xampp/htdocs/gimnasio/plantilla/index.html', encoding='utf-8') as f:
        html = f.read()

    # Step 1: Strip HTML comments
    html = re.sub(r'<!--.*?-->', '', html, flags=re.DOTALL)

    # Step 2: class= -> className=
    html = html.replace(' class=', ' className=')

    # Step 3: for= -> htmlFor=
    html = html.replace(' for=', ' htmlFor=')

    # Step 4: Fix data-setbg inline style
    # data-setbg="img/hero/hero-1.jpg" -> style={{ backgroundImage: "url('/img/hero/hero-1.jpg')" }}
    def replace_setbg(m):
        path = m.group(1)
        if not path.startswith('/'):
            path = '/' + path
        return 'style={{ backgroundImage: "url(' + repr(path) + ')" }}'
    html = re.sub(r'data-setbg="([^"]+)"', replace_setbg, html)

    # Step 5: Fix src="img/ and href="img/
    html = re.sub(r'(src|href)="img/', r'\1="/img/', html)

    # Step 6: Self-close void elements
    for tag in ['img', 'input', 'hr', 'br', 'link', 'meta', 'source']:
        html = re.sub(r'<(' + tag + r')(\s[^>]*?)?(?<!/)>', r'<\1\2 />', html)

    # Step 7: Extract body content
    body_start = html.find('<body>') + 6
    body_end = html.find('<script src=')
    if body_end == -1:
        body_end = html.find('</body>')
    body_html = html[body_start:body_end].strip()

    # Step 8: Identify header boundaries
    header_start = body_html.find('<header className="header-section">')
    header_end = body_html.find('</header>') + 9
    header_html = body_html[header_start:header_end]

    # Step 9: Identify footer boundaries (last section before end)
    footer_start = body_html.rfind('<section className="footer-section">')
    footer_end = body_html.rfind('</section>') + 10
    footer_html = body_html[footer_start:footer_end]

    # Write Header.jsx
    header_content = header_html.replace('<a href="./index.html"', '<Link to="/"')
    header_content = header_content.replace('<a href="#"', '<Link to="#"')
    header_content = header_content.replace('</a>', '</Link>')
    header_content = re.sub(r'<a href="\./([^"]+)\.html"', r'<Link to="/\1"', header_content)

    with open('c:/xampp/htdocs/gimnasio/frontend/src/components/Header.jsx', 'w', encoding='utf-8') as f:
        f.write(
            "import React from 'react';\n"
            "import { Link } from 'react-router-dom';\n"
            "export default function Header() {\n"
            "  return (\n"
            + header_content +
            "\n  );\n}\n"
        )

    # Write Footer.jsx
    footer_content = footer_html.replace('<a href=', '<Link to=').replace('</a>', '</Link>')
    with open('c:/xampp/htdocs/gimnasio/frontend/src/components/Footer.jsx', 'w', encoding='utf-8') as f:
        f.write(
            "import React from 'react';\n"
            "import { Link } from 'react-router-dom';\n"
            "export default function Footer() {\n"
            "  return (\n"
            + footer_content +
            "\n  );\n}\n"
        )

    # Write Home.jsx - use full body but replace header and footer with components
    home_html = (
        body_html[:header_start] +
        '<Header />' +
        body_html[header_end:footer_start] +
        '<Footer />' +
        body_html[footer_end:]
    )

    use_effect = """  useEffect(() => {
    const reinit = () => {
      if (!window.jQuery) return;
      const $ = window.jQuery;

      // Set background images
      $('.set-bg').each(function () {
        const bg = $(this).data('setbg');
        if (bg) $(this).css('background-image', 'url(' + bg + ')');
      });

      // Hero slider
      if ($('.hs-slider').length && $.fn.owlCarousel) {
        $('.hs-slider').owlCarousel({
          loop: true, margin: 0, nav: true, items: 1, dots: false,
          animateOut: 'fadeOut', animateIn: 'fadeIn',
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          smartSpeed: 1200, autoHeight: false, autoplay: true
        });
      }

      // Team slider
      if ($('.ts-slider').length && $.fn.owlCarousel) {
        $('.ts-slider').owlCarousel({
          loop: true, margin: 0, items: 3, dots: true, dotsEach: 2,
          smartSpeed: 1200, autoHeight: false, autoplay: true,
          responsive: { 320: { items: 1 }, 768: { items: 2 }, 992: { items: 3 } }
        });
      }

      // Testimonial slider
      if ($('.ts_slider').length && $.fn.owlCarousel) {
        $('.ts_slider').owlCarousel({
          loop: true, margin: 0, items: 1, dots: false, nav: true,
          navText: ['<i class="fa fa-angle-left"></i>', '<i class="fa fa-angle-right"></i>'],
          smartSpeed: 1200, autoHeight: false, autoplay: true
        });
      }

      // Mobile menu
      if ($('.mobile-menu').length && $.fn.slicknav) {
        $('.mobile-menu').slicknav({ prependTo: '#mobile-menu-wrap', allowParentLinks: true });
      }

      // Preloader
      setTimeout(() => {
        $('.loader').fadeOut();
        $('#preloder').delay(200).fadeOut('slow');
      }, 500);
    };

    // If jQuery is loaded, run; else wait
    if (window.jQuery) {
      reinit();
    } else {
      const interval = setInterval(() => {
        if (window.jQuery) { clearInterval(interval); reinit(); }
      }, 100);
    }
  }, []);
"""

    with open('c:/xampp/htdocs/gimnasio/frontend/src/pages/Home.jsx', 'w', encoding='utf-8') as f:
        f.write(
            "import React, { useEffect } from 'react';\n"
            "import Header from '../components/Header';\n"
            "import Footer from '../components/Footer';\n\n"
            "export default function Home() {\n"
            + use_effect +
            "\n  return (\n    <>\n"
            + home_html +
            "\n    </>\n  );\n}\n"
        )

    print("Done! Files written successfully.")

if __name__ == '__main__':
    convert()
