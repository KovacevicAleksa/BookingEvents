autocannon -c 100 -d 5 -H "Authorization: Bearer ey...bw" http://localhost:8081/view/events
Running 5s test @ http://localhost:8081/view/events
100 connections

# Autocannon Test Results

## Latency

| Date      | Stat    | 2.5%   | 50%     | 97.5%   | 99%     | Avg       | Stdev     | Max     |
| --------- | ------- | ------ | ------- | ------- | ------- | --------- | --------- | ------- |
| 21.8.2024 | Latency | 374 ms | 1972 ms | 2966 ms | 3360 ms | 1778.5 ms | 739.71 ms | 3494 ms |

## Requests Per Second

| Date      | Stat    | 1%  | 2.5% | 50% | 97.5% | Avg  | Stdev | Min |
| --------- | ------- | --- | ---- | --- | ----- | ---- | ----- | --- |
| 21.8.2024 | Req/Sec | 15  | 15   | 42  | 86    | 41.4 | 24.93 | 15  |

## Bytes Per Second

| Date      | Stat      | 1%      | 2.5%    | 50%    | 97.5%  | Avg    | Stdev  | Min     |
| --------- | --------- | ------- | ------- | ------ | ------ | ------ | ------ | ------- |
| 21.8.2024 | Bytes/Sec | 92.8 kB | 92.8 kB | 260 kB | 532 kB | 256 kB | 154 kB | 92.8 kB |

## Summary

| Date      | Total Requests |
| --------- | -------------- |
| 21.8.2024 | 307            |
