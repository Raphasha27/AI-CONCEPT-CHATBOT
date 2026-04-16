import asyncio
import aiohttp
import time
import statistics

async def fetch(session, url):
    async with session.get(url) as response:
        return response.status, await response.read()

async def run_stress_test(base_url, requests_count=100):
    print(f"🚀 Initializing SizweOS Sovereign Stress Test...")
    print(f"📍 Target: {base_url}")
    print(f"📦 Total Requests: {requests_count}")
    
    start_time = time.perf_counter()
    latencies = []
    
    async with aiohttp.ClientSession() as session:
        tasks = []
        for _ in range(requests_count):
            tasks.append(fetch(session, f"{base_url}/health"))
            tasks.append(fetch(session, f"{base_url}/"))
        
        results = await asyncio.gather(*tasks)
        
    end_time = time.perf_counter()
    duration = end_time - start_time
    
    success_count = sum(1 for status, _ in results if status == 200)
    failed_count = len(results) - success_count
    
    print("\n" + "="*40)
    print("📊 SIZWE OS PERFORMANCE REPORT")
    print("="*40)
    print(f"Status: {'✅ SCALABLE' if failed_count == 0 else '⚠️ UNSTABLE'}")
    print(f"Total Completed: {len(results)}")
    print(f"Success: {success_count}")
    print(f"Failed: {failed_count}")
    print(f"Total Duration: {duration:.4f}s")
    print(f"Req/sec: {len(results)/duration:.2f}")
    print("="*40)

if __name__ == "__main__":
    # Assuming the server will be running on port 8000
    try:
        asyncio.run(run_stress_test("http://localhost:8000"))
    except Exception as e:
        print(f"❌ Test Failed: Could not connect to SizweOS API. Ensure the server is running.")
