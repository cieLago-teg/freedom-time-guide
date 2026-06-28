import os
for k in ("HTTP_PROXY", "HTTPS_PROXY", "http_proxy", "https_proxy"):
    os.environ.pop(k, None)
import urllib.request, urllib.error
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
for path in ["/api/nonexistent-for-404-test", "/api/import/csv/preview"]:
    try:
        r = opener.open(f"http://127.0.0.1:8766{path}", timeout=3)
        body = r.read()[:120].decode("utf-8", "ignore")
        print(f"  [{r.status}] {path}  CT={r.headers.get('content-type')}  body[:120]={body!r}")
    except urllib.error.HTTPError as e:
        body = e.read()[:120].decode("utf-8", "ignore")
        print(f"  [{e.code}] {path}  body[:120]={body!r}")