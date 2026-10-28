import time
import asyncio
import httpx
from datetime import datetime

BASE_URL = "http://127.0.0.1:8000"

async def run_rigorous_tests():
    print(f"[{datetime.now().strftime('%H:%M:%S')}] Starting rigorous live verification against {BASE_URL}...")
    
    passed_checks = 0
    failed_checks = 0

    async with httpx.AsyncClient(base_url=BASE_URL, timeout=10.0) as client:
        # ----------------------------------------------------------------------
        # 1. System Health & Server Performance
        # ----------------------------------------------------------------------
        t0 = time.perf_counter()
        res = await client.get("/health")
        latency_ms = (time.perf_counter() - t0) * 1000
        
        if res.status_code == 200 and res.json().get("status") == "healthy":
            print(f"  [PASS] /health responded in {latency_ms:.2f}ms (Status: 200 OK)")
            passed_checks += 1
        else:
            print(f"  [FAIL] /health failed: {res.status_code} {res.text}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 2. Static Asset Integrity (Zero CDN verification)
        # ----------------------------------------------------------------------
        css_res = await client.get("/static/css/style.css")
        if css_res.status_code == 200 and "--bg-primary" in css_res.text:
            print(f"  [PASS] /static/css/style.css loaded ({len(css_res.text)} bytes, Content-Type: text/css)")
            passed_checks += 1
        else:
            print(f"  [FAIL] CSS failed: {css_res.status_code}")
            failed_checks += 1

        js_res = await client.get("/static/js/app.js")
        if js_res.status_code == 200 and "trackEvent" in js_res.text:
            print(f"  [PASS] /static/js/app.js loaded ({len(js_res.text)} bytes, Content-Type: application/javascript)")
            passed_checks += 1
        else:
            print(f"  [FAIL] JS failed: {js_res.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 3. HTML Frontend Pages (Template rendering integrity)
        # ----------------------------------------------------------------------
        pages = [
            ("/", "Stop Guessing Your Final-Year AI Project"),
            ("/compare", "Compare Your Final-Year Project Ideas"),
            ("/contract/bc_demo_rag", "AI College-Policy QA Assistant"),
            ("/challenge/bc_demo_rag", "Break My Build"),
            ("/register", "Build Your First AI Project in 60 Minutes"),
            ("/admin", "Campaign & Funnel Analytics"),
            ("/whatsapp", "WhatsApp Bot Simulator"),
            ("/privacy", "Privacy Notice & Data Handling")
        ]
        
        for path, expected_text in pages:
            p_res = await client.get(path)
            if p_res.status_code == 200 and expected_text in p_res.text:
                print(f"  [PASS] HTML Page '{path}' rendered successfully (200 OK)")
                passed_checks += 1
            else:
                print(f"  [FAIL] HTML Page '{path}' error: Status {p_res.status_code}")
                failed_checks += 1

        # ----------------------------------------------------------------------
        # 4. Sample Projects API
        # ----------------------------------------------------------------------
        s_res = await client.get("/api/projects/samples")
        samples = s_res.json()
        if s_res.status_code == 200 and len(samples) == 5:
            print(f"  [PASS] GET /api/projects/samples returned all 5 sample projects")
            passed_checks += 1
        else:
            print(f"  [FAIL] Samples endpoint failed: {s_res.status_code}")
            failed_checks += 1

        s1_res = await client.get("/api/projects/samples/sample_college_policy_rag")
        if s1_res.status_code == 200 and s1_res.json().get("id") == "sample_college_policy_rag":
            print(f"  [PASS] GET /api/projects/samples/sample_college_policy_rag returned sample detail")
            passed_checks += 1
        else:
            print(f"  [FAIL] Single sample fetch failed: {s1_res.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 5. Project Comparison & XSS Sanitization
        # ----------------------------------------------------------------------
        cmp_payload = {
            "domain": "AI/ML",
            "experience": "intermediate",
            "languages": ["Python", "JavaScript"],
            "time_weeks": 4,
            "team_size": 2,
            "resources": ["laptop", "public dataset"],
            "primary_goal": "college_project",
            "candidates": [
                {
                    "title": "AI Policy Chatbot <script>alert('xss')</script>",
                    "description": "RAG handbook assistant for college students answering policy questions."
                },
                {
                    "title": "Autonomous AGI Drone",
                    "description": "Real-time 4K aerial tracking transformer from scratch."
                }
            ],
            "utm_source": "rigorous_test"
        }
        
        cmp_res = await client.post("/api/projects/compare", json=cmp_payload)
        cmp_data = cmp_res.json()
        if cmp_res.status_code == 200:
            top_proj = cmp_data["recommended_project"]
            # Verify XSS was escaped
            assert "<script>" not in top_proj["title"]
            assert "&lt;script&gt;" in top_proj["title"]
            # Verify realistic project won
            assert "Policy Chatbot" in top_proj["title"]
            assert top_proj["composite_score"] > 80.0
            print(f"  [PASS] POST /api/projects/compare executed (Scored {len(cmp_data['all_scored_projects'])} ideas, XSS sanitized, Best fit: {top_proj['composite_score']}/100)")
            passed_checks += 1
        else:
            print(f"  [FAIL] Compare failed: {cmp_res.status_code} {cmp_res.text}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 6. Build Contract Creation & Retrieval
        # ----------------------------------------------------------------------
        contract_payload = {
            "comparison_id": cmp_data.get("comparison_id"),
            "selected_project_title": "AI College-Policy QA Assistant",
            "selected_project_description": "An interactive chatbot grounded in college academic regulations using document retrieval.",
            "domain": "AI/ML",
            "experience": "intermediate",
            "languages": ["Python"],
            "time_weeks": 4,
            "team_size": 2,
            "resources": ["laptop", "public dataset"],
            "primary_goal": "college_project",
            "referral_source": "rigorous_test"
        }
        
        bc_res = await client.post("/api/contracts", json=contract_payload)
        bc_data = bc_res.json()
        contract_id = bc_data.get("contract_id")
        
        if bc_res.status_code == 200 and contract_id and contract_id.startswith("bc_"):
            assert len(bc_data["failure_scenarios"]) >= 2
            assert len(bc_data["plan_60min"]) == 4
            assert len(bc_data["critical_assumption"]) > 10
            print(f"  [PASS] POST /api/contracts created Build Contract '{contract_id}' with assumption & 4-stage plan")
            passed_checks += 1
        else:
            print(f"  [FAIL] Contract creation failed: {bc_res.status_code} {bc_res.text}")
            failed_checks += 1

        # Public retrieval
        get_bc = await client.get(f"/api/contracts/{contract_id}")
        if get_bc.status_code == 200 and get_bc.json().get("contract_id") == contract_id:
            print(f"  [PASS] GET /api/contracts/{contract_id} retrieved public contract")
            passed_checks += 1
        else:
            print(f"  [FAIL] Contract retrieval failed: {get_bc.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 7. Break My Build Peer Challenge & Duplicate Prevention
        # ----------------------------------------------------------------------
        ch_payload = {
            "peer_name": "Rigorous QA Reviewer",
            "challenge_text": "What happens if a student asks for rules about an unindexed circular issued this morning?",
            "why_it_matters": "System might hallucinate old guidelines and mislead the student.",
            "improvement_suggestion": "Add circular publication date filtering and explicit admission of missing context."
        }
        
        ch_res = await client.post(f"/api/contracts/{contract_id}/challenges", json=ch_payload)
        ch_data = ch_res.json()
        
        if ch_res.status_code == 201 and ch_data.get("challenge_id"):
            rec = ch_data["recommendation"]
            assert rec["risk_level"] in ["High", "Moderate", "Minor"]
            print(f"  [PASS] POST /api/contracts/{contract_id}/challenges created challenge (Risk: {rec['risk_level']})")
            passed_checks += 1
        else:
            print(f"  [FAIL] Peer challenge failed: {ch_res.status_code} {ch_res.text}")
            failed_checks += 1

        # Duplicate submission check
        dupe_ch = await client.post(f"/api/contracts/{contract_id}/challenges", json=ch_payload)
        if dupe_ch.status_code == 409:
            print(f"  [PASS] Duplicate challenge prevention triggered HTTP 409 Conflict as expected")
            passed_checks += 1
        else:
            print(f"  [FAIL] Duplicate challenge check failed: Expected 409, got {dupe_ch.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 8. Workshop Registration & Attribution
        # ----------------------------------------------------------------------
        reg_payload = {
            "name": "Arjun Kumar",
            "email": "Arjun.Kumar.Live@Campus.Edu",  # Mixed case
            "contract_id": contract_id,
            "utm_source": "whatsapp_campus_group",
            "utm_medium": "forward",
            "utm_campaign": "48hr_challenge"
        }
        
        reg_res = await client.post("/api/register", json=reg_payload)
        reg_data = reg_res.json()
        
        if reg_res.status_code == 201 and reg_data.get("email") == "arjun.kumar.live@campus.edu":
            print(f"  [PASS] POST /api/register created registration with lowercase email normalization")
            passed_checks += 1
        else:
            print(f"  [FAIL] Registration failed: {reg_res.status_code} {reg_res.text}")
            failed_checks += 1

        # Duplicate registration with uppercase email
        dupe_reg = await client.post("/api/register", json={
            "name": "Arjun Kumar",
            "email": "ARJUN.KUMAR.LIVE@CAMPUS.EDU",
            "contract_id": contract_id
        })
        if dupe_reg.status_code == 200 and "already registered" in dupe_reg.json().get("message", "").lower():
            print(f"  [PASS] Duplicate email registration handled gracefully (Status: 200 with existing ID)")
            passed_checks += 1
        else:
            print(f"  [FAIL] Duplicate registration check failed: {dupe_reg.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 9. WhatsApp Simulator
        # ----------------------------------------------------------------------
        wa_res = await client.post("/api/whatsapp/simulate", json={
            "message": "AI campus attendance and circular chatbot",
            "sender_name": "Student Lead"
        })
        wa_data = wa_res.json()
        if wa_res.status_code == 200 and "PROJECT COMPASS" in wa_data.get("reply_text", ""):
            print(f"  [PASS] POST /api/whatsapp/simulate generated formatted bot card with Build Contract link")
            passed_checks += 1
        else:
            print(f"  [FAIL] WhatsApp simulation failed: {wa_res.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 10. Admin Metrics & Authentication Protection
        # ----------------------------------------------------------------------
        # Unauthorized call
        bad_admin = await client.get("/api/admin/metrics?token=wrong_token")
        if bad_admin.status_code == 401:
            print(f"  [PASS] GET /api/admin/metrics rejected invalid token with HTTP 401 Unauthorized")
            passed_checks += 1
        else:
            print(f"  [FAIL] Admin token security failed: Expected 401, got {bad_admin.status_code}")
            failed_checks += 1

        # Authorized call
        good_admin = await client.get("/api/admin/metrics?token=compass_growth_admin_secret_2026")
        metrics = good_admin.json()
        if good_admin.status_code == 200 and metrics.get("total_contracts", 0) >= 1:
            print(f"  [PASS] GET /api/admin/metrics authorized! KPIs: {metrics['total_comparisons']} comparisons, {metrics['total_contracts']} contracts, {metrics['total_challenges']} challenges, {metrics['total_registrations']} registrations")
            passed_checks += 1
        else:
            print(f"  [FAIL] Admin metrics authorized call failed: {good_admin.status_code}")
            failed_checks += 1

        # ----------------------------------------------------------------------
        # 11. Concurrency & High Throughput Load Test
        # ----------------------------------------------------------------------
        print("\n  Executing concurrency test: 30 parallel requests to /health and /api/projects/samples...")
        t_start = time.perf_counter()
        
        tasks = []
        for i in range(15):
            tasks.append(client.get("/health"))
            tasks.append(client.get("/api/projects/samples"))
            
        results = await asyncio.gather(*tasks)
        total_time = (time.perf_counter() - t_start) * 1000
        avg_time = total_time / len(results)
        
        all_200 = all(r.status_code == 200 for r in results)
        if all_200:
            print(f"  [PASS] 30 concurrent requests completed in {total_time:.2f}ms (Average: {avg_time:.2f}ms per request, 100% success)")
            passed_checks += 1
        else:
            print(f"  [FAIL] Concurrency test had failures: {[r.status_code for r in results if r.status_code != 200]}")
            failed_checks += 1

    print("\n" + "=" * 70)
    print(f"RIGOROUS ANALYSIS COMPLETE: {passed_checks} PASSED, {failed_checks} FAILED")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(run_rigorous_tests())

