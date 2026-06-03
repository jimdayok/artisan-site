#import "theme.typ": *

#let cover-page() = {
  set page(margin: 0in, fill: aln-navy)
  rect(width: 100%, height: 100%, fill: aln-navy)[
    #place(top + right, dx: -0.2in, dy: 0.25in, rect(width: 2.9in, height: 2.9in, radius: 100%, stroke: 1.1pt + white.transparentize(82%)))
    #place(bottom + left, dx: -0.7in, dy: -0.5in, rect(width: 3.8in, height: 3.8in, radius: 100%, stroke: 1pt + aln-gold.transparentize(72%)))
    #pad(x: 0.78in, y: 0.78in)[
      #v(0.32in)
      #eyebrow("Artisan Lab Network")
      #v(0.52in)
      #text(size: 38pt, fill: white, weight: "bold")[#doc-title]
      #v(0.28in)
      #line(length: 1.7in, stroke: 1.5pt + aln-gold)
      #v(0.34in)
      #text(size: 15pt, fill: white.transparentize(22%))[#doc-subtitle]
      #v(1fr)
      #grid(
        columns: (1fr, auto),
        align: (left, right),
        [#text(size: 10pt, fill: white.transparentize(38%))[Confidentiality-safe strategic template]],
        [#text(size: 10pt, fill: white.transparentize(38%))[#doc-date]],
      )
    ]
  ]
  pagebreak()
  setup-page()
}

#let section-divider(title, subtitle: none) = {
  pagebreak()
  rect(width: 100%, height: 7.9in, fill: aln-navy, stroke: none)[
    #pad(x: 0.55in, y: 0.62in)[
      #v(1.45in)
      #eyebrow("Section")
      #v(0.28in)
      #text(size: 31pt, fill: white, weight: "bold")[#title]
      #v(0.25in)
      #line(length: 1.4in, stroke: 1.3pt + aln-gold)
      #if subtitle != none [
        #v(0.34in)
        #text(size: 13pt, fill: white.transparentize(28%))[#subtitle]
      ]
    ]
  ]
  pagebreak()
}

#let callout(title, body) = block(
  width: 100%,
  inset: 14pt,
  radius: 4pt,
  stroke: 0.8pt + aln-gold,
  fill: rgb("#fff8ef"),
)[
  #smallcaps(title)
  #v(5pt)
  #text(size: 10.5pt, fill: aln-ink)[#body]
]

#let pull-quote(body, attribution: none) = block(
  width: 100%,
  inset: (left: 18pt, right: 16pt, top: 12pt, bottom: 12pt),
  stroke: (left: 3pt + aln-gold),
  fill: rgb("#fbf8f3"),
)[
  #text(size: 17pt, fill: aln-navy, style: "italic")[“#body”]
  #if attribution != none [
    #v(6pt)
    #text(size: 8.8pt, fill: aln-muted, weight: "bold", tracking: 0.12em, upper(attribution))
  ]
]

#let graphic-placeholder(label, height: 1.9in) = block(
  width: 100%,
  height: height,
  inset: 12pt,
  radius: 5pt,
  stroke: 0.8pt + aln-mist,
  fill: rgb("#f6f1e9"),
)[
  #align(center + horizon)[
    #text(size: 8.8pt, fill: aln-gold-dark, weight: "bold", tracking: 0.16em, upper("Canva Graphic Placeholder"))
    #v(5pt)
    #text(size: 11pt, fill: aln-muted)[#label]
  ]
]

#let comparison-table(left-title, right-title, rows) = {
  table(
    columns: (1fr, 1fr),
    inset: 9pt,
    stroke: 0.55pt + aln-mist,
    fill: (x, y) => if y == 0 { aln-navy } else if calc.even(y) { rgb("#fbf8f3") } else { white },
    text(fill: white, weight: "bold", left-title),
    text(fill: white, weight: "bold", right-title),
    ..rows.flatten(),
  )
}

#let metric-strip(items) = grid(
  columns: (1fr, 1fr, 1fr),
  gutter: 10pt,
  ..items.map(item => block(inset: 12pt, radius: 4pt, stroke: 0.7pt + aln-mist, fill: white)[
    #text(size: 8pt, fill: aln-gold-dark, weight: "bold", tracking: 0.14em, upper(item.at(0)))
    #v(5pt)
    #text(size: 16pt, fill: aln-navy, weight: "bold")[#item.at(1)]
    #v(3pt)
    #text(size: 9pt, fill: aln-muted)[#item.at(2)]
  ])
)
