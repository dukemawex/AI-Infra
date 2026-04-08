"""Generate infrastructure.csv and infrastructure.json with 400+ records."""
import random
import json
import csv
from datetime import date, timedelta

random.seed(42)

REGIONS = [
    "Nairobi", "Kampala", "Dar es Salaam", "Kigali", "Addis Ababa",
    "Juba", "Lusaka", "Harare", "Lilongwe", "Maputo",
    "Bujumbura", "Asmara", "Djibouti City", "Mogadishu", "Antananarivo",
    "Dodoma", "Entebbe", "Mwanza", "Kisumu", "Mombasa",
]

STATUSES = ["operational", "degraded", "critical", "offline"]
STATUS_WEIGHTS = [0.50, 0.25, 0.15, 0.10]
USAGE_LEVELS = ["low", "medium", "high"]
USAGE_WEIGHTS = [0.30, 0.45, 0.25]


def random_date(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, delta))


def generate_record(index: int) -> dict:
    asset_id = f"ASSET-{index:04d}"
    asset_type = random.choice(["borehole", "solar_system"])
    region = random.choice(REGIONS)

    # Realistic East/Central Africa coordinates
    lat = round(random.uniform(-5.0, 15.0), 6)
    lon = round(random.uniform(25.0, 45.0), 6)

    install_start = date(2005, 1, 1)
    install_end = date(2022, 12, 31)
    install_date = random_date(install_start, install_end)

    maint_start = install_date + timedelta(days=30)
    maint_end = date(2023, 12, 31)
    last_maintenance = random_date(maint_start, maint_end)

    status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]
    usage_level = random.choices(USAGE_LEVELS, weights=USAGE_WEIGHTS)[0]

    depth_m = random.randint(20, 120) if asset_type == "borehole" else None
    capacity_kw = round(random.uniform(1.5, 50.0), 2) if asset_type == "solar_system" else None

    return {
        "id": asset_id,
        "type": asset_type,
        "lat": lat,
        "lon": lon,
        "install_date": install_date.isoformat(),
        "last_maintenance": last_maintenance.isoformat(),
        "status": status,
        "usage_level": usage_level,
        "region": region,
        "depth_m": depth_m,
        "capacity_kw": capacity_kw,
    }


def main():
    records = [generate_record(i + 1) for i in range(420)]

    # Write CSV
    csv_path = "infrastructure.csv"
    fieldnames = [
        "id", "type", "lat", "lon", "install_date", "last_maintenance",
        "status", "usage_level", "region", "depth_m", "capacity_kw",
    ]
    with open(csv_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Wrote {len(records)} records to {csv_path}")

    # Write JSON
    json_path = "infrastructure.json"
    with open(json_path, "w") as f:
        json.dump(records, f, indent=2)
    print(f"Wrote {len(records)} records to {json_path}")


if __name__ == "__main__":
    main()
