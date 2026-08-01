import re

html = open('c:/xampp/htdocs/gimnasio/frontend/src/HomeConverted.jsx', encoding='utf-8').read()

header_start = html.find('<header className="header-section">')
header_end = html.find('</header>') + 9
header_html = html[header_start:header_end]

open('c:/xampp/htdocs/gimnasio/frontend/src/components/Header.jsx', 'w', encoding='utf-8').write(
    "import React from 'react';\n"
    "import { Link } from 'react-router-dom';\n"
    "export default function Header() { return (" + 
    header_html.replace('href="./index.html"', 'to="/"').replace('href="#"', 'to="#"').replace('href="./about-us.html"', 'to="/about"').replace('href="./classes.html"', 'to="/classes"').replace('<a ', '<Link ').replace('</a>', '</Link>') +
    "); }"
)

footer_start = html.find('<section className="footer-section">')
footer_end = html.find('</section>', footer_start) + 10
footer_html = html[footer_start:footer_end]

open('c:/xampp/htdocs/gimnasio/frontend/src/components/Footer.jsx', 'w', encoding='utf-8').write(
    "import React from 'react';\n"
    "import { Link } from 'react-router-dom';\n"
    "export default function Footer() { return (" + 
    footer_html.replace('<a ', '<Link ').replace('</a>', '</Link>') +
    "); }"
)

home_html = html[:header_start] + '<Header />' + html[header_end:footer_start] + '<Footer />' + html[footer_end:]
open('c:/xampp/htdocs/gimnasio/frontend/src/pages/Home.jsx', 'w', encoding='utf-8').write(
    home_html.replace("import React from 'react';", "import React from 'react';\nimport Header from '../components/Header';\nimport Footer from '../components/Footer';")
)
