export async function onRequestPost(context) {
    const { env } = context;

    try {
        if (!env.DAILY_API_KEY) {
            return new Response(JSON.stringify({ error: 'Server configuration error: DAILY_API_KEY not set.' }), { 
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const roomOptions = {
            properties: {
                exp: Math.round(Date.now() / 1000) + 3600 * 2, // 2 hours from now
                max_participants: 10,
                enable_chat: true,
                enable_screenshare: true
            }
        };

        const response = await fetch('https://api.daily.co/v1/rooms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${env.DAILY_API_KEY}`
            },
            body: JSON.stringify(roomOptions)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Daily API error: ${response.status} ${errorText}`);
        }

        const roomData = await response.json();

        return new Response(JSON.stringify({ 
            success: true, 
            url: roomData.url, 
            name: roomData.name 
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
