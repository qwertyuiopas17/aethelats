import requests
url = 'http://127.0.0.1:8000/detect-role'
files = {'file': ('test.pdf', open('test.pdf', 'rb'), 'application/pdf')}
resp = requests.post(url, files=files)
print('Status:', resp.status_code)
print('Response:', resp.text)
