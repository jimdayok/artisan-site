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


def bullet(c, text, x, top, width, small=False, color=GOLD_DARK):
    radius = 1.8
    c.setFillColor(color)
    c.circle(x + 3, top - 5.3, radius, fill=1, stroke=0)
    return para(
        c,
        text,
        x + 11,
        top,
        width - 11,
        STYLES["bullet_small" if small else "bullet"],
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
    c.roundRect(28, 516, PAGE_W - 56, 68, 18, fill=1, stroke=0)

    logo_path = ROOT / "public" / "aln-white-logo.png"
    c.drawImage(ImageReader(opaque_image(logo_path, INK, page_num)), 46, 525, width=102, height=48, preserveAspectRatio=True, anchor="c")

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(173, 562, eyebrow.upper())
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 23)
    c.drawString(173, 538, title)
    c.setFillColor(colors.HexColor("#D9D4CE"))
    c.setFont("Helvetica", 8.4)
    c.drawString(173, 523, subtitle)

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawRightString(PAGE_W - 48, 559, f"POLICIES GUIDE  |  2026  |  PAGE {page_num} OF 4")


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
    c.roundRect(28, 451, PAGE_W - 56, 48, 14, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(46, 481, "USE THIS GUIDE")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11.2)
    c.drawString(46, 465, "Confirm the product, timing, original order details, and reason before submitting a policy request.")
    c.setFont("Helvetica", 6.9)
    c.setFillColor(colors.HexColor("#D9D4CE"))
    c.drawString(46, 455, "Final eligibility and credit approval remain subject to lab review and applicable vendor terms.")

    gap = 10
    card_w = (PAGE_W - 72 - (3 * gap)) / 4
    metric_card(c, 36, 362, card_w, "30 DAYS", "Lab error window", "Measured from the order ship date")
    metric_card(c, 36 + card_w + gap, 362, card_w, "1 YEAR", "Doctor redo window", "One eligible non-adapt change")
    metric_card(c, 36 + 2 * (card_w + gap), 362, card_w, "$4 / $16", "Outbound shipping", "Next Day Air / 2 Day Shipping")
    metric_card(c, 36 + 3 * (card_w + gap), 362, card_w, "30 DAYS", "Chemistrie defect policy", "Manufacturer or laboratory defects only")

    left_top = card(c, 36, 133, 350, 211, "Guide map", "Four pages, organized for quick decisions")
    sections = [
        "Page 1 - timelines, rates, and section map",
        "Page 2 - AR, scratch, doctor redos, and lab error remakes",
        "Page 3 - Chemistrie Clip, frames, and multiple-pair terms",
        "Page 4 - shipping, cancellations, VSP, specialty work, credits, and support",
    ]
    top = left_top
    for item in sections:
        top = bullet(c, item, 54, top, 314)
        top -= 8

    right_top = card(c, 404, 133, 352, 211, "Critical exceptions", "Set expectations before the order is placed", fill=PAPER)
    critical = [
        "Chemistrie Clip: no warranty or remake coverage for scratches, breakage, or loss.",
        "Chemistrie Clip: cancellations and returns are not accepted because the product is customized.",
        "Patient-owned frames are processed at the practice's risk and are not guaranteed by the lab.",
        "VSP Unity and outside-manufacturer programs can require separate authorization, returns, or documentation.",
    ]
    top = right_top
    for item in critical:
        top = bullet(c, item, 422, top, 316, color=ALERT)
        top -= 7

    c.setFillColor(INK)
    c.roundRect(36, 52, PAGE_W - 72, 62, 14, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(54, 92, "POLICY SUPPORT")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(54, 70, "customerservice@artisanlabnetwork.com")
    c.setFont("Helvetica", 8)
    c.setFillColor(colors.HexColor("#D9D4CE"))
    c.drawRightString(PAGE_W - 54, 79, "Contact customer service before submitting when timing, product, vendor, or eligibility is unclear.")
    c.linkURL("mailto:customerservice@artisanlabnetwork.com", (54, 65, 330, 87), relative=0)
    footer(c, 1)


def draw_warranties(c):
    header(
        c,
        2,
        "Coverage and remake policies",
        "Warranties, Redos, and Lab Errors",
        "Use the original invoice, ship date, product details, and reason to identify the correct policy path.",
    )

    top = card(c, 36, 53, 354, 445, "01 | AR and scratch", "Coverage terms by treatment", fill=WHITE)
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
    c.roundRect(54, 96, 318, 267, 10, fill=1, stroke=0)
    row_y = 346
    for idx, (label, value) in enumerate(rows):
        if idx:
            c.setStrokeColor(LINE)
            c.setLineWidth(0.5)
            c.line(64, row_y + 8, 362, row_y + 8)
        para(c, label, 64, row_y, 210, STYLES["table_label"])
        para(c, value, 274, row_y, 86, STYLES["table_value"])
        row_y -= 23

    c.setFillColor(ALERT_BG)
    c.setStrokeColor(colors.HexColor("#E6BDB5"))
    c.roundRect(54, 68, 318, 20, 7, fill=1, stroke=1)
    c.setFont("Helvetica-Bold", 7.2)
    c.setFillColor(ALERT)
    c.drawString(64, 75, "CHEMISTRIE CLIP SCRATCHES ARE NOT COVERED. FULL PRODUCT POLICY: PAGE 3.")

    top = card(c, 408, 291, 348, 207, "02 | Doctor redo and non-adapt", "One eligible patient-driven change within the first year")
    doctor_items = [
        "Eligible changes may include design, power, PD, prism, frame, segment height, or another patient non-adapt element.",
        "Submit updated order details, patient initials, and the reason for the change.",
        "For an upgrade to a higher-priced product, the original invoice is credited and the new order is invoiced when shipped.",
        "Unity VSP doctor redos follow their separate 6-month coverage window.",
    ]
    for item in doctor_items:
        top = bullet(c, item, 426, top, 312, small=True)
        top -= 6

    top = card(c, 408, 53, 348, 222, "03 | Lab error remake process", "No-charge processing for a valid lab error reported on time", fill=PAPER)
    lab_items = [
        "A valid lab error request must be received within 30 days of the date the order shipped.",
        "Include a clear reason and the original order details so the lab can evaluate the request.",
        "If the request does not evaluate as a valid lab error, the customer's one-time remake is used.",
        "Return the lenses when requested for inspection and quality control.",
        "Requests outside the 30-day window require additional review and are not automatically eligible.",
    ]
    for item in lab_items:
        top = bullet(c, item, 426, top, 312, small=True)
        top -= 6
    footer(c, 2)


def draw_chemistrie_and_frames(c):
    header(
        c,
        3,
        "Customized products and frame responsibility",
        "Chemistrie Clip, Frames, and Additional Pairs",
        "Confirm customized-product terms and frame responsibility before placing or processing the order.",
    )

    c.setFillColor(NAVY)
    c.setStrokeColor(GOLD)
    c.setLineWidth(1.2)
    c.roundRect(36, 298, 720, 200, 18, fill=1, stroke=1)
    chem_logo = ROOT / "public" / "chemistrie-logo.png"
    c.drawImage(ImageReader(opaque_image(chem_logo, NAVY, 33)), 56, 452, width=146, height=23, preserveAspectRatio=True)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(56, 432, "04 | CUSTOMIZED-PRODUCT POLICY")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(56, 405, "Chemistrie Clip Policies")
    c.setFillColor(colors.HexColor("#D9D4CE"))
    c.setFont("Helvetica", 8.5)
    c.drawString(56, 389, "Each clip is customized for the patient's frame. Verify the order and set expectations before production.")

    callouts = [
        ("30-DAY DEFECT POLICY", "Confirmed manufacturer or laboratory defects must be reported within 30 days of the order's ship date.", SUCCESS_BG, SUCCESS),
        ("NO DAMAGE OR LOSS COVERAGE", "There are no warranties or remake policies for scratches, breakage, or loss.", ALERT_BG, ALERT),
        ("FINAL CUSTOM ORDER", "Cancellations and returns are not accepted because Chemistrie Clip is a customized product.", ALERT_BG, ALERT),
    ]
    callout_w = 218
    for idx, (label, body, fill, ink) in enumerate(callouts):
        x = 54 + idx * (callout_w + 14)
        c.setFillColor(fill)
        c.setStrokeColor(fill)
        c.roundRect(x, 318, callout_w, 57, 10, fill=1, stroke=1)
        c.setFillColor(ink)
        c.setFont("Helvetica-Bold", 6.8)
        c.drawString(x + 11, 358, label)
        para(c, body, x + 11, 349, callout_w - 22, style(f"chem_{idx}", 7.2, 9.2, NAVY))

    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(56, 307, "ORDERING NOTES: No multiple-pair discount. Retrofit magnets are $40 when applicable. Contact customer service before ordering if terms are unclear.")

    top = card(c, 36, 53, 350, 227, "05 | Frame policy", "Manifest, suitability, and patient-owned frame responsibility")
    frame_items = [
        "A frame replacement request must include the frame manifest available on the Practice Resources page.",
        "PAL may decline a frame that is prone to damage or unsuitable for the prescription and lens order.",
        "Patient-owned frames are processed at the practice's risk. The lab is not liable for breakage during handling or processing.",
        "For orders more than 30 days old, patient-owned frames are not warranted or guaranteed; the practice is responsible for replacement if breakage occurs.",
    ]
    for item in frame_items:
        top = bullet(c, item, 54, top, 314, small=True)
        top -= 7

    top = card(c, 404, 53, 352, 227, "06 | Multiple-pair program", "Eligible additional pairs ordered within 30 days", fill=PAPER)
    pair_items = [
        "Additional pairs purchased within 30 days of the original pair may receive 50% off the lesser-priced invoice.",
        "Each eligible pair must include AR treatment or polarization.",
        "There is no limit to the number of eligible additional lens pairs unless account-specific terms state otherwise.",
        "Neurolens, Chemistrie Clip, specialty jobs, and account-specific programs may be excluded or follow separate rules.",
    ]
    for item in pair_items:
        top = bullet(c, item, 422, top, 316, small=True)
        top -= 7
    footer(c, 3)


def draw_operations(c):
    header(
        c,
        4,
        "Operations, partner programs, and support",
        "Shipping, Specialty Work, Credits, and Next Steps",
        "Outside programs may add authorization, return, documentation, pricing, or lead-time requirements.",
    )

    widths = [224, 224, 224]
    xs = [36, 284, 532]
    tops = []
    tops.append(card(c, xs[0], 244, widths[0], 254, "07 | Shipping and cancellations", "Rates and production-stage billing"))
    tops.append(card(c, xs[1], 244, widths[1], 254, "08 | VSP and specialty work", "Separate program and partner requirements", fill=PAPER))
    tops.append(card(c, xs[2], 244, widths[2], 254, "09 | Manufacturer credits", "Returns and documentation may be required"))

    shipping = [
        "Next Day Air: $4 per job.",
        "2 Day Shipping: $16 per box.",
        "Inbound shipping is complimentary.",
        "The lab selects the outbound method based on job flow, volume, and delivery needs.",
        "A standard order cancelled after production starts is charged as an uncut; an unstarted standard order is not charged.",
        "Chemistrie Clip is customized and cannot be cancelled or returned.",
    ]
    for item in shipping:
        tops[0] = bullet(c, item, xs[0] + 18, tops[0], widths[0] - 36, small=True)
        tops[0] -= 5

    specialty = [
        "Unity VSP doctor redos have a 6-month coverage window.",
        "A new VSP authorization may be required for a Unity non-adapt reimbursement.",
        "Specialty, outsourced, out-of-range, or vendor-directed orders may use separate pricing, timing, and partner-lab policies.",
        "Customer service will confirm the applicable cost and estimated lead time before specialty work proceeds.",
    ]
    for item in specialty:
        tops[1] = bullet(c, item, xs[1] + 18, tops[1], widths[1] - 36, small=True)
        tops[1] -= 7

    credits = [
        "Manufacturer or outside-lab warranty credits must meet that partner's requirements.",
        "A vendor may require returned lenses even when standard Artisan AR handling does not.",
        "Neurolens refund requests require returned lenses.",
        "Credit cannot be finalized until required returns and documentation are complete.",
        "Ask customer service which policy controls when standard and vendor terms differ.",
    ]
    for item in credits:
        tops[2] = bullet(c, item, xs[2] + 18, tops[2], widths[2] - 36, small=True)
        tops[2] -= 6

    top = card(c, 36, 62, 458, 164, "Submission checklist", "Include the information needed for a clear, timely review", fill=WHITE)
    checklist = [
        "Original order or invoice number, patient initials, and ship date",
        "Product, lens design, treatment, frame, and applicable vendor or payer program",
        "Clear reason for the request and the exact change or defect being reported",
        "Updated prescription or measurements when the request is a doctor redo or non-adapt",
        "Photos, frame manifest, return authorization, lenses, or other documentation when requested",
    ]
    left_items = checklist[:3]
    right_items = checklist[3:]
    left_top = top
    right_top = top
    for item in left_items:
        left_top = bullet(c, item, 54, left_top, 205, small=True, color=SUCCESS)
        left_top -= 6
    for item in right_items:
        right_top = bullet(c, item, 270, right_top, 206, small=True, color=SUCCESS)
        right_top -= 7

    c.setFillColor(INK)
    c.roundRect(510, 62, 246, 164, 16, fill=1, stroke=0)
    c.setFillColor(GOLD)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(528, 200, "SUPPORT AND CONFIDENTIALITY")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(528, 177, "Need policy confirmation?")
    para(c, "Contact customer service before submitting when eligibility, vendor terms, returns, or timing are unclear.", 528, 163, 210, style("support_body", 8, 10.8, colors.HexColor("#D9D4CE")))
    c.setFont("Helvetica-Bold", 9.3)
    c.setFillColor(GOLD)
    c.drawString(528, 116, "customerservice@artisanlabnetwork.com")
    para(c, "Pricing, program terms, and customer-specific policy tools are confidential and should remain within the authorized practice team.", 528, 99, 210, style("confidential", 7.1, 9.1, colors.HexColor("#D9D4CE")))
    c.linkURL("mailto:customerservice@artisanlabnetwork.com", (528, 110, 740, 126), relative=0)
    footer(c, 4)


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

    for drawer in (draw_cover, draw_warranties, draw_chemistrie_and_frames, draw_operations):
        drawer(c)
        c.showPage()
    c.save()


def main():
    for output in OUTPUTS:
        build(output)
        print(output)


if __name__ == "__main__":
    main()
