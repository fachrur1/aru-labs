export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const password = request.headers.get('X-Editor-Password');
        
        if (!env.EDITOR_PASSWORD) {
            return new Response(JSON.stringify({ error: 'Server configuration error: EDITOR_PASSWORD not set.' }), { status: 500 });
        }

        if (password !== env.EDITOR_PASSWORD) {
            return new Response(JSON.stringify({ error: 'Unauthorized: Invalid password' }), { status: 401 });
        }

        if (!env.GITHUB_TOKEN) {
            return new Response(JSON.stringify({ error: 'Server configuration error: GITHUB_TOKEN not set.' }), { status: 500 });
        }

        const body = await request.json();
        const contentData = body.contentData;
        const imagesData = body.imagesData;

        if (!contentData && !imagesData) {
            return new Response(JSON.stringify({ error: 'No data provided' }), { status: 400 });
        }

        const files = {};
        if (contentData) {
            const dataStr = JSON.stringify(contentData, null, 2);
            files['content/data.json'] = dataStr;
            files['public/api/data.json'] = dataStr;
        }
        
        if (imagesData) {
            const imgStr = JSON.stringify(imagesData, null, 2);
            files['content/images.json'] = imgStr;
            files['public/api/images.json'] = imgStr;
        }

        // GitHub API Config
        const owner = 'fachrur1';
        const repo = 'aru-labs';
        const branch = 'main';
        const token = env.GITHUB_TOKEN;

        const headers = {
            'Authorization': `Bearer ${token}`,
            'User-Agent': 'Cloudflare-Pages-Editor',
            'Accept': 'application/vnd.github.v3+json'
        };

        // 1. Get current branch reference
        const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, { headers });
        if (!refRes.ok) throw new Error('Failed to fetch branch reference');
        const refData = await refRes.json();
        const latestCommitSha = refData.object.sha;

        // 2. Get the commit tree
        const commitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits/${latestCommitSha}`, { headers });
        if (!commitRes.ok) throw new Error('Failed to fetch latest commit');
        const commitData = await commitRes.json();
        const baseTreeSha = commitData.tree.sha;

        // 3. Create blobs for each file
        const tree = [];
        for (const [path, content] of Object.entries(files)) {
            const blobRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ content, encoding: 'utf-8' })
            });
            if (!blobRes.ok) throw new Error(`Failed to create blob for ${path}`);
            const blobData = await blobRes.json();
            tree.push({
                path,
                mode: '100644',
                type: 'blob',
                sha: blobData.sha
            });
        }

        // 4. Create new tree
        const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ base_tree: baseTreeSha, tree })
        });
        if (!treeRes.ok) throw new Error('Failed to create tree');
        const treeData = await treeRes.json();

        // 5. Create new commit
        const newCommitRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/commits`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                message: 'Auto-save from Live Editor',
                tree: treeData.sha,
                parents: [latestCommitSha]
            })
        });
        if (!newCommitRes.ok) throw new Error('Failed to create commit');
        const newCommitData = await newCommitRes.json();

        // 6. Update reference
        const updateRefRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ sha: newCommitData.sha, force: false })
        });
        if (!updateRefRes.ok) throw new Error('Failed to update branch reference');

        return new Response(JSON.stringify({ success: true, message: 'Saved successfully to GitHub' }), {
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
}
