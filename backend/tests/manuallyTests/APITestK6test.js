import http from 'k6/http';
import { check, sleep } from 'k6';


export const options = {
    scenarios: {
        test_scenario: { //300 req in 10 sec
            executor: 'constant-arrival-rate', // Maintain a constant request rate
            rate: 30,                         // Target 30 iterations per second
            timeUnit: '1s',                   // Rate defined per second
            duration: '10s',                  // Total test duration
            preAllocatedVUs: 50,              // Preallocate 50 virtual users
            maxVUs: 50,                       // Set a maximum of 50 virtual users
        },
    },
};

export default function () {
    const url = 'http://localhost:8081/accounts'; // Endpoint to test
    const params = {
        headers: {
            'Authorization': 'Bearer ...'  // Bearer token for authorization
        },
    };

    // Make GET request to the endpoint with authorization header
    const res = http.get(url, params);
    
    // Check response for status code 200 and response time under 1000ms
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time is less than 1000ms': (r) => r.timings.duration < 1000,  // Adjusted to 1000 ms
    });
    
    sleep(1); // Pause for 1 second between iterations
}
