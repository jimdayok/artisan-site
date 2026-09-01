#!/usr/bin/env python3
"""Generate the branded Artisan Lab Network policies guide PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUTS = [
    ROOT / "public" / "files" / "artisan-policies-guide.pdf",
    ROOT / "public" / "downloads" / "artisan-policies-guide.pdf",
]

PAGE_W, PAGE_H = landscape(letter)
INK = colors.HexColor("#171311")
NAVY = colors.HexColor("#122033")
CREAM = colors.HexColor("#F4EEE4")
PAPER = colors.HexColor("#FBF8F3")
WHITE = colors.white
GOLD = colors.HexColor("#D4C09A")
GOLD_DARK = colors.HexColor("#8A7654")
LINE = colors.HexColor("#DFD2BF")
MUTED = colors.HexColor("#5F5A53")
ALERT = colors.HexColor("#8B3E2F")
ALERT_BG = colors.HexColor("#F9EDEA")
SUCCESS = colors.HexColor("#325A46")
SUCCESS_BG = colors.HexColor("#EAF3ED")


def style(name, size=9, leading=None, color=MUTED, bold=False, align=TA_LEFT):
    return ParagraphStyle(
        name,
        fontName="Helvetica-Bold" if bold else "Helvetica",
        fontSize=size,
        leading=leading or size * 1.35,
        textColor=color,
        alignment=align,
        spaceAfter=0,
        spaceBefore=0,
    )


STYLES = {
    "body": style("body", 8.4, 11.2),
    "body_small": style("body_small", 7.6, 9.7),
    "bullet": style("bullet", 8.2, 10.8),
    "bullet_small": style("bullet_small", 7.5, 9.4),
    "label": style("label", 7.2, 8.5, GOLD_DARK, True),
    "card_title": style("card_title", 14.2, 16.8, INK, True),
    "card_title_white": style("card_title_white", 15, 18, WHITE, True),
    "card_subtitle": style("card_subtitle", 8.2, 10.5, GOLD_DARK, True),
    "card_subtitle_white": style("card_subtitle_white", 8.2, 10.5, GOLD, True),
    "metric": style("metric", 17, 18, NAVY, True, TA_CENTER),
    "metric_label": style("metric_label", 7.2, 8.8, GOLD_DARK, True, TA_CENTER),
    "table_label": style("table_label", 7.6, 9.2, NAVY, True),
    "table_value": style("table_value", 7.6, 9.2, MUTED),
}


def para(c, text, x, top, width, sty, max_height=1000):
    paragraph = Paragraph(text, sty)
    _, height = paragraph.wrap(width, max_height)
    paragraph.drawOn(c, x, top - height)
    return top - height


def bullet(c, text, x, top, width, small=False, color=GOLD_DARK, text_color=None):
    radius = 1.8
    c.setFillColor(color)
    c.circle(x + 3, top - 5.3, radius, fill=1, stroke=0)
    bullet_style = STYLES["bullet_small" if small else "bullet"]
    if text_color is not None:
        bullet_style = style(
            "bullet_custom",
            7.5 if small else 8.2,
            9.4 if small else 10.8,
            text_color,
        )
    return para(
        c,
        text,
        x + 11,
        top,
        width - 11,
        bullet_style,
    )


def rounded_rect(c, x, y, w, h, fill=WHITE, stroke=LINE, radius=16, line_width=1):
    c.setLineWidth(line_width)
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1)


def opaque_image(path, background_color, variant=0):
    """Flatten a transparent image to avoid renderer-specific alpha artifacts."""
    foreground = Image.open(path).convert("RGBA")
    background = Image.new(
        "RGBA",
        foreground.size,
        (
            round(background_color.red * 255),
            round(background_color.green * 255),
            round(background_color.blue * 255),
            255,
        ),
    )
    background.alpha_composite(foreground)
    result = background.convert("RGB")
    if variant:
        # Keep otherwise-identical page logos as separate PDF resources.
        result.putpixel((result.width - 1, result.height - 1), (variant, variant, variant))
    return result


def card(c, x, y, w, h, eyebrow, title, fill=WHITE, stroke=LINE, dark=False):
    rounded_rect(c, x, y, w, h, fill, stroke, 16)
    title_style = STYLES["card_title_white" if dark else "card_title"]
    eyebrow_style = STYLES["card_subtitle_white" if dark else "card_subtitle"]
    top = y + h - 18
    top = para(c, eyebrow.upper(), x + 18, top, w - 36, eyebrow_style)
    top -= 5
    top = para(c, title, x + 18, top, w - 36, title_style)
    return top - 10


def header(c, page_num, eyebrow, title, subtitle):
    c.setFillColor(CREAM)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
    c.setFillColor(INK)
    c.roundRect(28, 494, PAGE_W - 56, 90, 20, fill=1, stroke=0)

    logo_path = ROOT / "public" / "aln-white-logo.png"
    c.drawImage(ImageReader(opaque_image(logo_path, INK, page_num)), 48, 517, width=88, height=42, preserveAspectRatio=True, anchor="c")

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(158, 559, eyebrow.upper())
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(158, 533, title)
    c.setFillColor(colors.HexColor("#D9D4CE"))
    c.setFont("Helvetica", 8.2)
    c.drawString(158, 513, subtitle)

    c.setFillColor(colors.HexColor("#2B2623"))
    c.setStrokeColor(colors.HexColor("#4A423C"))
    c.roundRect(PAGE_W - 112, 541, 62, 24, 12, fill=1, stroke=1)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawCentredString(PAGE_W - 81, 550, f"PAGE {page_num} / 3")


def footer(c, page_num):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.line(34, 34, PAGE_W - 34, 34)
    c.setFont("Helvetica", 6.8)
    c.setFillColor(MUTED)
    c.drawString(36, 21, "Confidential professional reference for authorized Artisan Lab Network partners. Not for public distribution.")
    c.drawRightString(PAGE_W - 36, 21, f"Artisan Lab Network | Policies Guide | {page_num}")


def metric_card(c, x, y, w, value, label, note):
    rounded_rect(c, x, y, w, 72, WHITE, LINE, 14)
    para(c, value, x + 10, y + 55, w - 20, STYLES["metric"])
    para(c, label.upper(), x + 10, y + 31, w - 20, STYLES["metric_label"])
    para(c, note, x + 12, y + 17, w - 24, style("metric_note", 6.7, 8.2, MUTED, False, TA_CENTER))


def draw_cover(c):
    header(
        c,
        1,
        "Executive policy guide",
        "Artisan Policies Guide",
        "A practical reference for remakes, warranties, frames, shipping, specialty work, and support.",
    )

    c.setFillColor(NAVY)
    c.roundRect(36, 426, PAGE_W - 72, 50, 14, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(54, 457, "USE THIS GUIDE")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 10.8)
    c.drawString(54, 440, "Confirm the product, timing, original order details, and reason before submitting a policy request.")

    gap = 12
    card_w = (PAGE_W - 72 - (2 * gap)) / 3
    metric_card(c, 36, 338, card_w, "30 DAYS", "Lab error window", "Measured from the order ship date")
    metric_card(c, 36 + card_w + gap, 338, card_w, "1 YEAR", "Doctor redo window", "One eligible non-adapt change")
    metric_card(c, 36 + 2 * (card_w + gap), 338, card_w, "$4 / $16", "Outbound shipping", "Next Day Air / 2 Day Shipping")

    left_top = card(c, 36, 115, 350, 205, "Guide map", "Three pages, organized for quick decisions")
    sections = [
        "Page 1 - key timelines, rates, and policy map",
        "Page 2 - AR, scratch, doctor redos, lab errors, and special VSP policies",
        "Page 3 - frames, additional pairs, shipping, specialty work, Chemistrie, credits, and support",
    ]
    top = left_top
    for item in sections:
        top = bullet(c, item, 54, top, 314)
        top -= 8

    right_top = card(c, 404, 115, 352, 205, "Before submitting", "Set expectations and gather complete information", fill=PAPER)
    critical = [
        "Patient-owned frames are processed at the practice's risk and are not guaranteed by the lab.",
        "VSP Unity, TechShield by VSP, and SunSync may follow special redo and remake requirements.",
        "Outside-manufacturer programs can require separate authorization, returns, or documentation.",
        "When a policy is unclear, contact customer service before promising coverage or placing the replacement order.",
    ]
    top = right_top
    for item in critical:
        top = bullet(c, item, 422, top, 316, color=ALERT)
        top -= 7

    c.setFillColor(INK)
    c.roundRect(36, 49, PAGE_W - 72, 50, 14, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(54, 81, "POLICY SUPPORT")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 12.5)
    c.drawString(54, 62, "customerservice@artisanlabnetwork.com")
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#D9D4CE"))
    c.drawRightString(PAGE_W - 54, 66, "Contact customer service before submitting when timing, product, vendor, or eligibility is unclear.")
    c.linkURL("mailto:customerservice@artisanlabnetwork.com", (54, 56, 330, 76), relative=0)
    footer(c, 1)


def draw_warranties(c):
    header(
        c,
        2,
        "Coverage and remake policies",
        "Warranties, Redos, and Lab Errors",
        "Use the original invoice, ship date, product details, and reason to identify the correct policy path.",
    )

    top = card(c, 36, 51, 354, 425, "01 | AR and scratch", "Coverage terms by treatment", fill=WHITE)
    top = para(c, "Covered Artisan AR and scratch warranty claims do not require lenses to be returned before the warranty is used. Vendor-specific programs may carry separate requirements.", 54, top, 318, STYLES["body"])
    top -= 9
    rows = [
        ("Artisan Standard (AST)", "1 year, 1 time"),
        ("Azure, Nytopia, Emerald, Armour, Diamond Sun", "2 years, 2 times"),
        ("TechShield AR Technologies", "2 years, 2 times"),
        ("Tokai AR Technologies", "2 years, 2 times"),
        ("Crizal AR Technologies", "2 years, 2 times"),
        ("Shamir AR Technologies", "2 years, 2 times"),
        ("Hoya AR Technologies", "2 years, 2 times"),
        ("Factory Scratch Coat", "1 year, 1 time"),
        ("Diamond Defence (DDE)", "2 years, 2 times"),
        ("Mirror coating alone", "1 year, 1 time"),
        ("Mirror + Artisan Diamond backside AR", "2 years, 2 times"),
    ]
    c.setFillColor(PAPER)
    c.roundRect(54, 72, 318, 267, 10, fill=1, stroke=0)
    row_y = 322
    for idx, (label, value) in enumerate(rows):
        if idx:
            c.setStrokeColor(LINE)
            c.setLineWidth(0.5)
            c.line(64, row_y + 8, 362, row_y + 8)
        para(c, label, 64, row_y, 210, STYLES["table_label"])
        para(c, value, 274, row_y, 86, STYLES["table_value"])
        row_y -= 23

    top = card(c, 408, 325, 348, 151, "02 | Doctor redo and non-adapt", "One eligible patient-driven change within the first year")
    doctor_items = [
        "Eligible changes may include design, power, PD, prism, frame, segment height, or another patient non-adapt element. Submit updated details and the reason.",
        "For an upgrade to a higher-priced product, the original invoice is credited and the new order is invoiced when shipped.",
    ]
    for item in doctor_items:
        top = bullet(c, item, 426, top, 312, small=True)
        top -= 6

    top = card(c, 408, 190, 348, 121, "03 | Lab error remake process", "No-charge processing for a valid lab error reported on time", fill=PAPER)
    lab_items = [
        "A valid lab error request must be received within 30 days of the date the order shipped. Include a clear reason and the original order details.",
        "If the request is not a valid lab error, the customer's one-time remake is used. Return lenses when requested for inspection.",
    ]
    for item in lab_items:
        top = bullet(c, item, 426, top, 312, small=True)
        top -= 6
    top = card(c, 408, 51, 348, 134, "04 | VSP special policies", "VSP Unity, TechShield, and SunSync", fill=NAVY, stroke=NAVY, dark=True)
    vsp_items = [
        "These products may use special redo and remake policies instead of standard Artisan coverage.",
        "Before submitting, ask customer service which policy applies and whether you need a new VSP authorization, returned lenses, photos, or other documents.",
        "Provide the original order number, ship date, product or treatment, patient initials, and reason.",
    ]
    for item in vsp_items:
        top = bullet(c, item, 426, top, 312, small=True, color=GOLD, text_color=colors.HexColor("#E6E1DA"))
        top -= 4
    footer(c, 2)


def draw_operations(c):
    header(
        c,
        3,
        "Frames, fulfillment, specialty work, and support",
        "Operations and Additional Policies",
        "Confirm frame responsibility, shipping, specialty requirements, and documentation before submitting.",
    )

    top = card(c, 36, 298, 350, 178, "05 | Frame policy", "Manifest, suitability, and patient-owned frames")
    frame_items = [
        "A frame replacement request must include the frame manifest available on the Practice Resources page.",
        "PAL may decline a frame that is prone to damage or unsuitable for the prescription and lens order.",
        "Patient-owned frames are processed at the practice's risk. The lab is not liable for breakage during handling or processing.",
        "For orders more than 30 days old, patient-owned frames are not warranted or guaranteed.",
    ]
    for item in frame_items:
        top = bullet(c, item, 54, top, 314, small=True)
        top -= 5

    top = card(c, 404, 298, 352, 178, "06 | Multiple-pair program", "Eligible additional pairs ordered within 30 days", fill=PAPER)
    pair_items = [
        "Additional pairs purchased within 30 days of the original pair may receive 50% off the lesser-priced invoice.",
        "Each eligible pair must include AR treatment or polarization.",
        "There is no limit to eligible additional lens pairs unless account-specific terms state otherwise.",
        "Neurolens, Chemistrie Clip, specialty jobs, and account-specific programs may be excluded or follow separate rules.",
    ]
    for item in pair_items:
        top = bullet(c, item, 422, top, 316, small=True)
        top -= 5

    widths = [224, 224, 224]
    xs = [36, 284, 532]
    tops = [
        card(c, xs[0], 142, widths[0], 142, "07 | Shipping and cancellations", "Rates and production-stage billing"),
        card(c, xs[1], 142, widths[1], 142, "08 | Specialty work", "Separate pricing, timing, and partner terms", fill=PAPER),
        card(c, xs[2], 142, widths[2], 142, "09 | Manufacturer credits", "Partner requirements"),
    ]

    shipping = [
        "Next Day Air: $4 per job. 2 Day Shipping: $16 per box. Inbound shipping is complimentary.",
        "The lab selects the outbound method based on job flow, volume, and delivery needs.",
        "Orders cancelled after production starts are charged as an uncut; unstarted orders are not charged.",
    ]
    specialty = [
        "Specialty, outsourced, out-of-range, or vendor-directed orders may use separate policies.",
        "Customer service will confirm applicable cost and estimated lead time before work proceeds.",
        "Ask which authorization, return, and documentation requirements apply.",
    ]
    credits = [
        "Manufacturer or outside-lab credits must meet that partner's requirements.",
        "A vendor may require returned lenses even when standard Artisan AR handling does not.",
        "Credits require all requested returns and documentation.",
    ]
    for column, items in enumerate((shipping, specialty, credits)):
        for item in items:
            tops[column] = bullet(c, item, xs[column] + 18, tops[column], widths[column] - 36, small=True)
            tops[column] -= 4

    rounded_rect(c, 36, 51, 458, 77, ALERT_BG, colors.HexColor("#E6BDB5"), 14)
    c.setFillColor(ALERT)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(54, 108, "CHEMISTRIE CLIP - QUICK POLICY NOTE")
    para(c, "Confirmed manufacturer or laboratory defects must be reported within 30 days of the ship date. There are no warranties or remake policies for scratches, breakage, or loss. Cancellations and returns are not accepted because Chemistrie Clip is a customized product.", 54, 96, 422, style("chem_quick", 7.5, 9.7, NAVY))

    c.setFillColor(INK)
    c.roundRect(510, 51, 246, 77, 14, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(528, 108, "POLICY SUPPORT")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(528, 87, "Need policy confirmation?")
    c.setFont("Helvetica-Bold", 8.3)
    c.setFillColor(GOLD)
    c.drawString(528, 67, "customerservice@artisanlabnetwork.com")
    c.linkURL("mailto:customerservice@artisanlabnetwork.com", (528, 61, 740, 78), relative=0)
    footer(c, 3)


def build(output_path):
    output_path.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(
        str(output_path),
        pagesize=(PAGE_W, PAGE_H),
        pageCompression=1,
        invariant=1,
    )
    c.setTitle("Artisan Policies Guide")
    c.setAuthor("Artisan Lab Network")
    c.setSubject("Policies for warranties, remakes, frames, shipping, Chemistrie Clip, specialty work, and support")
    c.setKeywords("Artisan Lab Network, policies, warranty, remake, Chemistrie Clip, shipping")

    for drawer in (draw_cover, draw_warranties, draw_operations):
        drawer(c)
        c.showPage()
    c.save()


def main():
    for output in OUTPUTS:
        build(output)
        print(output)


if __name__ == "__main__":
    main()
