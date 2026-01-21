import qrcode
import os
import csv

# Configuration
BASE_URL = "https://goodrunss.com/c/"
OUTPUT_DIR = "./qr_codes"
BATCH_SIZE = 100 # Generating 100 for test, strategy calls for 50k

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def generate_qr(venue_id, name):
    url = f"{BASE_URL}{venue_id}"
    img = qrcode.make(url)
    filename = f"{OUTPUT_DIR}/{name}_{venue_id}.png"
    img.save(filename)
    print(f"Generated: {filename} -> {url}")

# Mock Database of Venues (In prod, this would read from Firebase/Postgres)
venues = [
    {"id": "court_1", "name": "Grand_Park_1"},
    {"id": "court_2", "name": "Grand_Park_2"},
    {"id": "court_3", "name": "Venice_Beach_1"},
    {"id": "court_4", "name": "Venice_Beach_2"},
    {"id": "court_5", "name": "Rucker_Park_Main"},
]

print(f"--- Starting Batch Generation for {len(venues)} Venues ---")

for venue in venues:
    generate_qr(venue["id"], venue["name"])

print(f"--- Complete. QRs saved in {OUTPUT_DIR} ---")
