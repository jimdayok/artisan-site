// ALN Strategic White Paper Theme

#let aln-navy = rgb("#122033")
#let aln-ink = rgb("#172a28")
#let aln-cream = rgb("#fbf8f3")
#let aln-paper = rgb("#fffdf8")
#let aln-gold = rgb("#c9b28b")
#let aln-gold-dark = rgb("#8a7654")
#let aln-green = rgb("#1f8a70")
#let aln-mist = rgb("#eadfce")
#let aln-muted = rgb("#5f6863")

#let doc-title = "Building Aligned Infrastructure for the Future of Independent Eye Care"
#let doc-subtitle = "A Strategic White Paper for Independent Practices, Doctor Alliances, Vendor Partners, and Future Equity Owners"
#let doc-short-title = "ALN Strategic White Paper"
#let doc-date = "2026"

#let serif-font = "New Computer Modern"
#let sans-font = "New Computer Modern Sans"

#let setup-page() = {
  set page(
    paper: "us-letter",
    margin: (top: 0.78in, bottom: 0.72in, left: 0.78in, right: 0.78in),
    fill: aln-paper,
    footer: context {
      if counter(page).get().first() > 1 [
        #line(length: 100%, stroke: 0.45pt + aln-mist)
        #v(6pt)
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          text(size: 8.5pt, fill: aln-muted, doc-short-title),
          text(size: 8.5pt, fill: aln-muted)[Page #counter(page).display()]
        )
      ]
    },
  )
  set text(font: serif-font, size: 10.5pt, fill: aln-ink, lang: "en")
  set par(justify: true, leading: 0.62em, spacing: 0.72em)
  set heading(numbering: "1.1", supplement: none)
  show heading.where(level: 1): it => {
    pagebreak(weak: true)
    v(0.1in)
    text(size: 9pt, fill: aln-gold-dark, weight: "bold", tracking: 0.16em, upper(it.body))
    v(0.12in)
    line(length: 1.25in, stroke: 1.1pt + aln-gold)
    v(0.18in)
  }
  show heading.where(level: 2): it => {
    v(0.18in)
    text(size: 19pt, fill: aln-navy, weight: "bold", it.body)
    v(0.04in)
  }
  show heading.where(level: 3): it => {
    v(0.12in)
    text(size: 13pt, fill: aln-green, weight: "bold", it.body)
  }
  show link: set text(fill: aln-green)
}

#let eyebrow(body) = text(size: 8.5pt, fill: aln-gold-dark, weight: "bold", tracking: 0.18em, upper(body))

#let smallcaps(body) = text(size: 8.5pt, fill: aln-gold-dark, weight: "bold", tracking: 0.14em, upper(body))
