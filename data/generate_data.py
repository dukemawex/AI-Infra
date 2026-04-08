"""Generate infra_data.csv, infra_data.json (400 rows) and 20 NGO reports.

Fields per spec:
  id, type, latitude, longitude, install_date, last_maintenance,
  status, usage_level

Logic:
  - Older systems  → higher probability of non-functional status
  - Missing maintenance → higher probability of degraded/non-functional
  - High usage      → faster degradation (shifts status toward worse)

Outputs (relative to this script's directory):
  infra_data.csv
  infra_data.json
  reports/report_001.txt … report_020.txt
"""

import csv
import json
import os
import random
import uuid
from datetime import date, timedelta

random.seed(42)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ASSET_TYPES = ["borehole", "solar_panel", "water_tank"]

# Nigeria geographic bounds (degrees)
LAT_MIN, LAT_MAX = 4.0, 14.0
LON_MIN, LON_MAX = 2.7, 14.7

INSTALL_START = date(2015, 1, 1)
INSTALL_END = date(2024, 12, 31)
REFERENCE_DATE = date(2025, 1, 1)   # "today" for age calculations

STATUSES = ["functional", "degraded", "non-functional"]
USAGE_LEVELS = ["low", "medium", "high"]

# Nigerian states with representative towns/LGAs for reports
NIGERIAN_LOCATIONS = [
    ("Kano", "Kano State", 12.0022, 8.5920),
    ("Kaduna", "Kaduna State", 10.5105, 7.4165),
    ("Maiduguri", "Borno State", 11.8311, 13.1510),
    ("Sokoto", "Sokoto State", 13.0059, 5.2476),
    ("Zaria", "Kaduna State", 11.0855, 7.7199),
    ("Gusau", "Zamfara State", 12.1704, 6.6640),
    ("Birnin Kebbi", "Kebbi State", 12.4596, 4.1974),
    ("Dutse", "Jigawa State", 11.7668, 9.3446),
    ("Damaturu", "Yobe State", 11.7479, 11.9609),
    ("Jalingo", "Taraba State", 8.8996, 11.3704),
    ("Gombe", "Gombe State", 10.2896, 11.1673),
    ("Bauchi", "Bauchi State", 10.3105, 9.8462),
    ("Jos", "Plateau State", 9.8965, 8.8583),
    ("Minna", "Niger State", 9.6139, 6.5569),
    ("Ilorin", "Kwara State", 8.4966, 4.5421),
    ("Lokoja", "Kogi State", 7.8036, 6.7337),
    ("Lafia", "Nasarawa State", 8.4940, 8.5130),
    ("Makurdi", "Benue State", 7.7337, 8.5373),
    ("Enugu", "Enugu State", 6.4584, 7.5464),
    ("Abakaliki", "Ebonyi State", 6.3249, 8.1137),
]

NGO_ORGS = [
    ("WaterAid Nigeria", "Field Engineer Aminu Bello"),
    ("Rural Water Initiative", "Programme Officer Hauwa Musa"),
    ("SolarAccess Africa", "Technical Lead Chukwuemeka Obi"),
    ("UNICEF WASH Nigeria", "WASH Specialist Fatima Yusuf"),
    ("Catholic Relief Services", "Infrastructure Manager Peter Adeyemi"),
    ("Action Against Hunger", "Water Engineer Blessing Nwosu"),
    ("Oxfam Nigeria", "Logistics Officer Musa Danjuma"),
    ("Save the Children", "Field Coordinator Ngozi Eze"),
    ("IRC Nigeria", "WASH Officer Ibrahim Garba"),
    ("Plan International", "Engineer Zainab Abubakar"),
]

REPORT_DATES = [
    date(2023, 1, 18), date(2023, 2, 7), date(2023, 3, 22), date(2023, 4, 11),
    date(2023, 5, 30), date(2023, 6, 15), date(2023, 7, 9), date(2023, 8, 24),
    date(2023, 9, 5), date(2023, 10, 17), date(2023, 11, 1), date(2023, 12, 13),
    date(2024, 1, 8), date(2024, 2, 20), date(2024, 3, 14), date(2024, 4, 3),
    date(2024, 5, 25), date(2024, 6, 11), date(2024, 7, 30), date(2024, 8, 6),
]


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def compute_status(install_date: date, last_maintenance, usage_level: str) -> str:
    """
    Determine status using degradation logic:
      - Age factor: assets installed before 2018 have higher failure probability.
      - Maintenance gap: no maintenance or >3-year gap raises degradation risk.
      - Usage factor: high usage shifts probability toward worse status.
    """
    age_years = (REFERENCE_DATE - install_date).days / 365.25

    # Base weights [functional, degraded, non-functional]
    weights = [0.70, 0.20, 0.10]

    # Age adjustment: each year beyond 5 adds 3% chance of non-functional
    extra_age = max(0, age_years - 5)
    weights[0] -= extra_age * 0.03
    weights[2] += extra_age * 0.03

    # Maintenance adjustment
    if last_maintenance is None:
        # No maintenance ever → significant degradation risk
        weights[0] -= 0.25
        weights[1] += 0.10
        weights[2] += 0.15
    else:
        gap_years = (REFERENCE_DATE - last_maintenance).days / 365.25
        if gap_years > 3:
            weights[0] -= 0.20
            weights[1] += 0.10
            weights[2] += 0.10
        elif gap_years > 1.5:
            weights[0] -= 0.10
            weights[1] += 0.07
            weights[2] += 0.03

    # Usage adjustment
    if usage_level == "high":
        weights[0] -= 0.10
        weights[1] += 0.05
        weights[2] += 0.05
    elif usage_level == "medium":
        weights[0] -= 0.03
        weights[1] += 0.02
        weights[2] += 0.01

    # Clamp weights to [0.02, 1]
    weights = [max(0.02, w) for w in weights]
    total = sum(weights)
    weights = [w / total for w in weights]

    return random.choices(STATUSES, weights=weights)[0]


# ---------------------------------------------------------------------------
# Record generation
# ---------------------------------------------------------------------------

def generate_record() -> dict:
    asset_id = str(uuid.uuid4())
    asset_type = random.choice(ASSET_TYPES)

    latitude = round(random.uniform(LAT_MIN, LAT_MAX), 6)
    longitude = round(random.uniform(LON_MIN, LON_MAX), 6)

    install_date = random_date(INSTALL_START, INSTALL_END)

    # ~20% of assets have never received maintenance
    if random.random() < 0.20:
        last_maintenance = None
    else:
        maint_start = install_date + timedelta(days=60)
        maint_end = min(install_date + timedelta(days=3650), INSTALL_END)
        if maint_start >= maint_end:
            last_maintenance = None
        else:
            last_maintenance = random_date(maint_start, maint_end)

    usage_level = random.choices(USAGE_LEVELS, weights=[0.30, 0.45, 0.25])[0]
    status = compute_status(install_date, last_maintenance, usage_level)

    return {
        "id": asset_id,
        "type": asset_type,
        "latitude": latitude,
        "longitude": longitude,
        "install_date": install_date.isoformat(),
        "last_maintenance": last_maintenance.isoformat() if last_maintenance else None,
        "status": status,
        "usage_level": usage_level,
    }


# ---------------------------------------------------------------------------
# NGO report generation
# ---------------------------------------------------------------------------

def _issue_text(rec: dict, loc_name: str) -> str:
    """Generate a realistic issue description based on asset status."""
    t = rec["type"]
    s = rec["status"]
    u = rec["usage_level"]
    install_yr = rec["install_date"][:4]
    lat = rec["latitude"]
    lon = rec["longitude"]
    asset_id_short = rec["id"][:8].upper()

    location_line = f"GPS: {lat:.4f}°N, {lon:.4f}°E — {loc_name}"

    if t == "borehole":
        asset_desc = f"Hand-pump borehole (installed {install_yr})"
        if s == "functional":
            issue = (
                "Borehole operating within expected parameters. "
                "Pump rod shows minor surface corrosion consistent with age. "
                "Water quality tests: coliform absent, turbidity within WHO limits. "
                f"Usage classified as {u}; serving estimated {random.randint(200, 800)} people daily."
            )
            maint_note = "Preventive greasing of pump head completed during visit. Next service due in 12 months."
        elif s == "degraded":
            issue = (
                "Pump stroke output reduced by approximately 30–40% compared to installation baseline. "
                f"{'Sand intrusion observed in water samples. ' if random.random() > 0.5 else 'Leakage detected at pump head seal. '}"
                f"{'High usage has accelerated wear on internal rods. ' if u == 'high' else ''}"
                f"Community of ~{random.randint(300, 900)} people partially relying on unsafe surface sources."
            )
            maint_note = (
                "Last maintenance was over 18 months ago. "
                "Recommend full pump overhaul within 60 days."
            )
        else:  # non-functional
            issue = (
                "Borehole completely non-operational. "
                f"{'Pump cylinder cracked — no water yield. ' if random.random() > 0.5 else 'Rising main collapsed — borehole inaccessible. '}"
                f"Installed in {install_yr}; {'no maintenance recorded in asset register' if rec['last_maintenance'] is None else 'last maintenance over 3 years ago'}. "
                f"Approximately {random.randint(400, 1200)} residents now walking >4 km to nearest water point."
            )
            maint_note = (
                "Emergency rehabilitation or full replacement required. "
                "Estimated cost: USD {:,}.".format(random.randint(4000, 12000))
            )

    elif t == "solar_panel":
        capacity = round(random.uniform(2.0, 25.0), 1)
        asset_desc = f"Solar PV system ({capacity} kW, installed {install_yr})"
        if s == "functional":
            issue = (
                f"System generating at {random.randint(88, 97)}% of rated capacity. "
                "Panels clean; no shading issues detected. "
                f"Battery bank at {random.randint(80, 95)}% state of health. "
                f"Inverter logs show no fault codes in past 90 days. "
                f"Usage level: {u}."
            )
            maint_note = "Panel cleaning and connection torque-check performed. System monitoring app online."
        elif s == "degraded":
            issue = (
                f"Output reduced to approximately {random.randint(50, 72)}% of rated capacity. "
                f"{'Two panels exhibit micro-cracking from thermal stress. ' if random.random() > 0.4 else 'Battery storage capacity degraded to ~60% of original. '}"
                f"{'High consumption load causing premature battery cycling. ' if u == 'high' else ''}"
                "Intermittent power cuts affecting connected services."
            )
            maint_note = (
                "Maintenance last performed over 2 years ago. "
                "Panel inspection and battery replacement scoping required within 45 days."
            )
        else:
            issue = (
                "System completely offline. "
                f"{'Inverter failure — no AC output. ' if random.random() > 0.5 else 'Battery bank fully discharged and will not hold charge. '}"
                f"{'Theft of charge controller reported to local police. ' if random.random() > 0.7 else ''}"
                f"Installed in {install_yr}; significant age-related component wear. "
                "Community facility (clinic / school) without power."
            )
            maint_note = (
                "Full system replacement assessment needed. "
                "Estimated replacement cost: USD {:,}.".format(random.randint(5000, 20000))
            )

    else:  # water_tank
        vol = random.randint(5, 50) * 1000
        asset_desc = f"Elevated water storage tank ({vol:,} L, installed {install_yr})"
        if s == "functional":
            issue = (
                f"Tank structure sound; no visible cracks or leaks. "
                f"Current fill level: {random.randint(60, 95)}%. "
                f"Float valve operating correctly. Serving {random.randint(200, 700)} households. "
                f"Usage level {u}."
            )
            maint_note = "Internal inspection and chlorination performed during visit. Next inspection in 6 months."
        elif s == "degraded":
            issue = (
                f"Tank losing approximately {random.randint(5, 20)}% daily volume through identified seam leak. "
                f"{'Algal growth present on inner walls — chlorine dosing inadequate. ' if random.random() > 0.5 else 'Overflow pipe blocked causing periodic spillage and wastage. '}"
                f"{'High demand rate exceeding inflow capacity during peak hours. ' if u == 'high' else ''}"
                "Structural support pillar shows surface spalling."
            )
            maint_note = (
                "Maintenance overdue. Re-sealing and structural inspection required within 30 days. "
                "Temporary repair applied to stop immediate leak."
            )
        else:
            issue = (
                "Tank out of service. "
                f"{'Base slab cracked — risk of structural collapse. ' if random.random() > 0.5 else 'Roof hatch missing; open-top contamination risk. '}"
                f"{'Tank has not been maintained since installation in {install_yr}. ' if rec['last_maintenance'] is None else 'Extended period without maintenance compounded deterioration. '}"
                f"Community of ~{random.randint(300, 1000)} without piped storage."
            )
            maint_note = (
                "Decommissioning and replacement recommended. "
                "Estimated cost: USD {:,}.".format(random.randint(3000, 9000))
            )

    return asset_desc, location_line, issue, maint_note, asset_id_short


def generate_report(report_num: int, records: list) -> str:
    loc = NIGERIAN_LOCATIONS[report_num % len(NIGERIAN_LOCATIONS)]
    loc_name, state, base_lat, base_lon = loc
    org, author = NGO_ORGS[report_num % len(NGO_ORGS)]
    report_date = REPORT_DATES[report_num]

    # Pick 3–5 assets whose coordinates are loosely in this region
    sample_size = random.randint(3, 5)
    sample = random.sample(records, sample_size)

    lines = [
        f"NGO FIELD REPORT — RURAL INFRASTRUCTURE ASSESSMENT",
        f"Report ID: RPT-{report_num + 1:03d}",
        f"Date: {report_date.isoformat()}",
        f"Organization: {org}",
        f"Reporting Officer: {author}",
        f"Region: {loc_name}, {state}, Nigeria",
        "",
        "EXECUTIVE SUMMARY",
        "=================",
        (
            f"Field assessment mission to {loc_name} and surrounding LGAs in {state}. "
            f"{sample_size} infrastructure assets inspected over "
            f"{random.randint(3, 7)} days. Mission focus: water access and energy "
            "infrastructure serving rural and peri-urban communities."
        ),
        "",
        "SITE ASSESSMENTS",
        "================",
    ]

    status_counts = {"functional": 0, "degraded": 0, "non-functional": 0}

    for i, rec in enumerate(sample, start=1):
        asset_desc, loc_line, issue, maint_note, short_id = _issue_text(rec, loc_name)
        status_counts[rec["status"]] += 1
        maint_display = rec["last_maintenance"] if rec["last_maintenance"] else "No record"

        lines += [
            "",
            f"Site {i}: {asset_desc} [ID: {short_id}…]",
            f"Location: {loc_line}",
            f"Asset Type: {rec['type'].replace('_', ' ').title()}",
            f"Install Date: {rec['install_date']}",
            f"Last Maintenance: {maint_display}",
            f"Current Status: {rec['status'].upper()}",
            f"Usage Level: {rec['usage_level'].capitalize()}",
            "",
            "Issue Description:",
            f"  {issue}",
            "",
            "Maintenance History:",
            f"  {maint_note}",
        ]

    # Summary
    total = len(sample)
    lines += [
        "",
        "SUMMARY STATISTICS",
        "==================",
        f"Assets inspected: {total}",
        f"  Functional:     {status_counts['functional']} ({100*status_counts['functional']//total}%)",
        f"  Degraded:       {status_counts['degraded']} ({100*status_counts['degraded']//total}%)",
        f"  Non-functional: {status_counts['non-functional']} ({100*status_counts['non-functional']//total}%)",
        "",
        "RECOMMENDATIONS",
        "===============",
    ]

    recs_list = []
    for i, rec in enumerate(sample, start=1):
        short_id = rec["id"][:8].upper()
        if rec["status"] == "non-functional":
            recs_list.append(f"  {i}. [{short_id}…] URGENT: Full rehabilitation or replacement required immediately.")
        elif rec["status"] == "degraded":
            recs_list.append(f"  {i}. [{short_id}…] Schedule maintenance within 30–60 days to prevent failure.")
        else:
            recs_list.append(f"  {i}. [{short_id}…] Continue routine monitoring. Next service in 12 months.")

    lines += recs_list
    lines += [
        "",
        "Report prepared by: " + author,
        "Organization: " + org,
        "Date submitted: " + report_date.isoformat(),
    ]

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # --- Generate 400 records ---
    records = [generate_record() for _ in range(400)]

    # Write CSV
    csv_path = os.path.join(script_dir, "infra_data.csv")
    fieldnames = ["id", "type", "latitude", "longitude",
                  "install_date", "last_maintenance", "status", "usage_level"]
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Wrote {len(records)} records to {csv_path}")

    # Write JSON
    json_path = os.path.join(script_dir, "infra_data.json")
    with open(json_path, "w") as f:
        json.dump(records, f, indent=2)
    print(f"Wrote {len(records)} records to {json_path}")

    # --- Generate 20 NGO reports ---
    reports_dir = os.path.join(script_dir, "reports")
    os.makedirs(reports_dir, exist_ok=True)

    for i in range(20):
        report_text = generate_report(i, records)
        report_path = os.path.join(reports_dir, f"report_{i + 1:03d}.txt")
        with open(report_path, "w") as f:
            f.write(report_text)
        print(f"Wrote {report_path}")

    print("Done.")


if __name__ == "__main__":
    main()
