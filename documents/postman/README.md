# Postman Setup

## Files
- `Distributed-Rate-Limiter.postman_collection.json`
- `Distributed-Rate-Limiter.local.postman_environment.json`

## Import
1. Open Postman.
2. Import both files from this folder.
3. Select environment: `Distributed Rate Limiter - Local`.

## Run Order
1. `Auth / Login`
2. `Auth / Current Admin (/me)`
3. `Dashboard / Dashboard View`
4. `Rate Limiter / Check Limit (Sliding Window)`
5. `Health / Actuator Prometheus`

## Notes
- `Auth / Login` sets session cookie; run it first.
- Update environment variable `apiKey` with a real API key before running `Check Limit`.
