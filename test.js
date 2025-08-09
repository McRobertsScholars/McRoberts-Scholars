(async () => {
    const fetch = (await import('node-fetch')).default;

    const API_URL = "https://eufipgiuvvqtgfrgqpnq.supabase.co/rest/v1/resources";
    const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZmlwZ2l1dnZxdGdmcmdxcG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1Nzg4MTUsImV4cCI6MjA1NTE1NDgxNX0.cpYXFdF1FffEnoPG_ZL6RDXSRdzvoX6cKKd6md4lcHA";

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "apikey": API_KEY,
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Success! Here’s the data:", data);
    } catch (error) {
        console.error("❌ Error fetching data:", error.message);
    }
})();
