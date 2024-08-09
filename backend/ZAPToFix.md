---
HiG
Content Security Policy (CSP) is an added layer of security that helps to detect and mitigate certain types of attacks. Including (but not limited to) Cross Site Scripting (XSS), and data injection attacks. These attacks are used for everything from data theft to site defacement or distribution of malware. CSP provides a set of standard HTTP headers that allow website owners to declare approved sources of content that browsers should be allowed to load on that page — covered types are JavaScript, CSS, HTML frames, fonts, images and embeddable objects such as Java applets, ActiveX, audio and video files.

Ensure that your web server, application server, load balancer, etc. is properly configured to set the Content-Security-Policy header.

frame-ancestors, form-action

The directive(s): frame-ancestors, form-action are among the directives that do not fallback to default-src, missing/excluding them is the same as allowing anything.
---

---

MED
Content Security Policy (CSP) Header Not Set

---

## Cross-Domain Misconfiguration

## Hidden File Found

## Missing Anti-clickjacking Header

LOW
Server Leaks Information via "X-Powered-By" HTTP Response Header Field(s)
--
Timestamp Disclosure - Unix
--
X-Content-Type-Options Header Missing
--
Information Disclosure - Suspicious Comments
--
Modern Web Application
