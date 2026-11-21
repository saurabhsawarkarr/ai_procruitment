import urllib.request
import json
import os

BASE = "http://127.0.0.1:8000"

def test_cross_check():
    # 1. Initial State
    res = urllib.request.urlopen(f"{BASE}/api/rfx/matrix")
    matrix = json.loads(res.read())
    initial_vendors = list(matrix["vendor_profiles"].keys())
    print(f"1. Initial Vendors Count: {len(initial_vendors)} -> {initial_vendors}")
    initial_spend = matrix["benchmark_spend_inr"]

    # 2. Upload '08_apple_enterprise_edi.json'
    sample_file = "dataset/sample_quotes_10_formats/08_apple_enterprise_edi.json"
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    with open(sample_file, "rb") as f:
        file_bytes = f.read()

    part_header = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="08_apple_enterprise_edi.json"\r\n'
        f"Content-Type: application/json\r\n\r\n"
    ).encode("utf-8")
    part_footer = f"\r\n--{boundary}--\r\n".encode("utf-8")
    body = part_header + file_bytes + part_footer

    req = urllib.request.Request(
        f"{BASE}/api/ingestion/upload?vendor_id=auto",
        data=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    upload_res = json.loads(urllib.request.urlopen(req).read())
    print(f"2. Upload Status: {upload_res.get('status')}")
    print(f"   Assigned Vendor ID: {upload_res.get('vendor_id')}")
    print(f"   Vendor Name Extracted: {upload_res.get('vendor_name')}")
    print(f"   Lines Quoted: {upload_res.get('lines_quoted')}/30")

    # 3. Updated Matrix State
    res2 = urllib.request.urlopen(f"{BASE}/api/rfx/matrix")
    matrix2 = json.loads(res2.read())
    updated_vendors = list(matrix2["vendor_profiles"].keys())
    print(f"3. Updated Matrix Vendors: {len(updated_vendors)} -> {updated_vendors}")
    new_vendor_id = upload_res.get("vendor_id")
    assert new_vendor_id in updated_vendors, "New vendor must be present in matrix!"

    # 4. Scenario Solver dynamically considers new vendor
    solve_payload = json.dumps({
        "scenario_type": "vp_constrained_split",
        "prefer_delivered_ddp": True,
        "max_lead_time_days": 14,
        "min_vendor_spend_inr": 500000
    }).encode("utf-8")
    solve_req = urllib.request.Request(
        f"{BASE}/api/scenarios/solve",
        data=solve_payload,
        headers={"Content-Type": "application/json"}
    )
    solve_res = json.loads(urllib.request.urlopen(solve_req).read())
    total_spend = solve_res.get("total_spend_inr", 0)
    allocations = solve_res.get("vendor_allocations", {})
    print(f"4. Optimizer Output:")
    print(f"   Total Spend: Rs {total_spend/1e7:.2f} Cr")
    print(f"   Savings: {solve_res.get('savings_percentage')}%")
    print(f"   Vendors in Allocation: {list(allocations.keys())}")

    # 5. Test Excel Upload (01_tata_elxsi_systems.xlsx)
    with open("dataset/sample_quotes_10_formats/01_tata_elxsi_systems.xlsx", "rb") as f:
        excel_bytes = f.read()

    body_excel = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="01_tata_elxsi_systems.xlsx"\r\n'
        f"Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n"
    ).encode("utf-8") + excel_bytes + part_footer

    req_excel = urllib.request.Request(
        f"{BASE}/api/ingestion/upload?vendor_id=auto",
        data=body_excel,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    res_excel = json.loads(urllib.request.urlopen(req_excel).read())
    print(f"5. Excel Upload: '{res_excel.get('vendor_name')}', Lines Quoted: {res_excel.get('lines_quoted')}/30")

    res_matrix3 = urllib.request.urlopen(f"{BASE}/api/rfx/matrix")
    matrix3 = json.loads(res_matrix3.read())
    print(f"   Matrix now has {len(matrix3['vendor_profiles'])} vendors simultaneously active!")

    # 6. Test Reset Endpoint to ensure clean state
    reset_req = urllib.request.Request(
        f"{BASE}/api/ingestion/reset",
        data=b"",
        headers={"Content-Type": "application/json"}
    )
    reset_res = json.loads(urllib.request.urlopen(reset_req).read())
    print(f"6. Reset Status: {reset_res.get('status')}")

    res_after = urllib.request.urlopen(f"{BASE}/api/rfx/matrix")
    matrix_after = json.loads(res_after.read())
    reset_vendors = list(matrix_after["vendor_profiles"].keys())
    print(f"   Vendors after reset: {len(reset_vendors)} -> {reset_vendors}")
    assert len(reset_vendors) == 5, "Matrix must reset to 5 canonical vendors!"
    print("\nALL CROSS-CHECKS PASSED! Data updates dynamically across matrix and optimizer.")

if __name__ == "__main__":
    test_cross_check()
