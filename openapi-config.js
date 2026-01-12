module.exports = {
    environments: [
        { url: "http://localhost:3000/api/v1", description: "Local Dev" },
        { url: "https://api.staging.example.com", description: "Staging" }
    ],
    requestInterceptor: (req) => {
        console.log("Request Intercepted:", req);
        // Example: Add an Authorization header
        // req.headers['Authorization'] = 'Bearer my-token';
        return req;
    },
    responseInterceptor: (res) => {
        console.log("Response Intercepted:", res);
        return res;
    }
}
