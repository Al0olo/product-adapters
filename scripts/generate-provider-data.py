#!/usr/bin/env python3
import json
import random

# Product templates
products_base = [
    ("Gaming Laptop Pro", "High-performance gaming laptop with RTX 4080", 2499.99),
    ("Wireless Gaming Mouse", "Ergonomic wireless mouse for gaming", 89.99),
    ("Mechanical Keyboard", "RGB mechanical keyboard with Cherry MX switches", 159.99),
    ("4K Monitor 32\"", "Ultra HD gaming monitor with 144Hz refresh rate", 599.99),
    ("Gaming Chair", "Ergonomic gaming chair with lumbar support", 349.99),
    ("USB-C Hub", "7-in-1 USB-C hub with HDMI and Ethernet", 49.99),
    ("Webcam HD", "1080p HD webcam with auto-focus", 79.99),
    ("Bluetooth Headset", "Noise-cancelling Bluetooth headset", 129.99),
    ("External SSD 1TB", "Portable external SSD with 1TB storage", 149.99),
    ("Graphics Tablet", "Digital drawing tablet for artists", 199.99),
    ("Smart Watch", "Fitness smart watch with heart rate monitor", 249.99),
    ("Wireless Earbuds", "True wireless earbuds with charging case", 99.99),
    ("USB Microphone", "Professional USB condenser microphone", 119.99),
    ("Laptop Stand", "Adjustable aluminum laptop stand", 39.99),
    ("Portable Charger", "20000mAh portable power bank", 44.99),
    ("RGB Mouse Pad", "Extended RGB gaming mouse pad", 34.99),
    ("Cable Management", "Cable management kit for desk setup", 19.99),
    ("Phone Holder", "Adjustable phone holder with wireless charging", 29.99),
    ("LED Desk Lamp", "Smart LED desk lamp with USB charging", 54.99),
    ("Bluetooth Speaker", "Portable Bluetooth speaker with bass boost", 69.99),
]

# Generate Provider 1 data (Nested structure with snake_case)
def generate_provider1():
    items = []
    for i in range(50):
        product = products_base[i % len(products_base)]
        items.append({
            "product_id": f"prod-1-{str(i+1).zfill(3)}",
            "product_name": f"{product[0]} {['Pro', 'Elite', 'Premium', 'Ultra', ''][i % 5]}".strip(),
            "product_desc": product[1],
            "pricing": {
                "amount": round(product[2] * random.uniform(0.9, 1.1), 2),
                "currency_code": "USD"
            },
            "stock": {
                "in_stock": random.choice([True, True, True, False]),
                "quantity": random.randint(0, 100)
            },
            "last_modified": "2025-09-30T10:30:00Z"
        })
    
    return {
        "metadata": {
            "provider": "TechStore API",
            "version": "2.0",
            "timestamp": "2025-09-30T10:30:00Z"
        },
        "catalog": {
            "items": items
        }
    }

# Generate Provider 2 data (Flat array with camelCase)
def generate_provider2():
    products = []
    for i in range(50):
        product = products_base[i % len(products_base)]
        products.append({
            "itemId": f"prod-2-{str(i+1).zfill(3)}",
            "title": f"{product[0]} {['Plus', 'Max', 'Deluxe', 'Standard', ''][i % 5]}".strip(),
            "details": product[1],
            "cost": round(product[2] * random.uniform(0.85, 1.15), 2),
            "currencyType": "USD",
            "isAvailable": random.choice([True, True, True, False]),
            "updatedAt": "2025-09-30T10:30:00Z"
        })
    
    return products

# Generate Provider 3 data (Wrapper with data array and UPPERCASE keys)
def generate_provider3():
    data = []
    for i in range(50):
        product = products_base[i % len(products_base)]
        data.append({
            "ID": f"prod-3-{str(i+1).zfill(3)}",
            "NAME": f"{product[0]} {['Advanced', 'Limited', 'Edition', 'Special', ''][i % 5]}".strip(),
            "DESCRIPTION": product[1],
            "PRICE": round(product[2] * random.uniform(0.95, 1.05), 2),
            "CURRENCY": "USD",
            "AVAILABLE": random.choice([True, True, True, False]),
            "LAST_UPDATE": "2025-09-30T10:30:00Z"
        })
    
    return {
        "success": True,
        "count": 50,
        "data": data
    }

# Write files
with open('/Users/al0olo/Documents/product-price-aggregator/providers/provider-1/db.json', 'w') as f:
    json.dump(generate_provider1(), f, indent=2)

with open('/Users/al0olo/Documents/product-price-aggregator/providers/provider-2/db.json', 'w') as f:
    json.dump(generate_provider2(), f, indent=2)

with open('/Users/al0olo/Documents/product-price-aggregator/providers/provider-3/db.json', 'w') as f:
    json.dump(generate_provider3(), f, indent=2)

print("✅ Generated provider data with different structures:")
print("  - Provider 1: Nested structure with snake_case (metadata.catalog.items)")
print("  - Provider 2: Flat array with camelCase")
print("  - Provider 3: Wrapper with UPPERCASE keys (success.count.data)")

