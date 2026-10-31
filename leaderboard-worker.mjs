/* Optional Cloudflare Worker. Secrets stay here, NEVER in the browser. */
export default {
  async fetch(request, env) {
    const origin=request.headers.get('Origin');
    const allowed=env.GAME_ORIGIN || 'https://gelatofreeze.github.io';
    const headers={'Content-Type':'application/json','Access-Control-Allow-Origin':allowed,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Cache-Control':'no-store','Vary':'Origin'};
    const respond=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
    if(origin&&origin!==allowed)return respond({error:'Origin not allowed'},403);
    if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
    if(!['GET','POST'].includes(request.method))return respond({error:'Method not allowed'},405);
    if(!env.GITHUB_TOKEN)return respond({error:'Shared scoreboard is not configured'},503);
    const url='https://api.github.com/repos/gelatofreeze/mitchy-rich-casino/contents/leaderboard.json';
    const githubHeaders={Authorization:'Bearer '+env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'MitchyRich-Leaderboard'};
    const read=async()=>{const response=await fetch(url,{headers:githubHeaders});if(response.status===404)return {scores:[],sha:undefined};if(!response.ok)throw Error('GitHub unavailable');const file=await response.json();return {sha:file.sha,scores:JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(file.content.replace(/\s/g,'')),c=>c.charCodeAt(0))))};};
    try {
      if(request.method==='GET')return respond((await read()).scores);
      if(Number(request.headers.get('Content-Length')||0)>1024)return respond({error:'Request too large'},413);
      const body=await request.text();if(body.length>1024)return respond({error:'Request too large'},413);
      let value;try{value=JSON.parse(body)}catch{return respond({error:'Invalid JSON'},400)}
      const name=typeof value.name==='string'?value.name.trim():'';
      if(!/^[\p{L}\p{N} ._-]{1,24}$/u.test(name)||!Number.isSafeInteger(value.score)||value.score<0||value.score>1e9)return respond({error:'Use a name of 1–24 characters and a whole-number score up to one billion'},400);
      const names=(env.PLAYER_NAMES||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
      if(names.length!==3)return respond({error:'The host must configure three player names'},503);
      if(!names.includes(name.toLowerCase()))return respond({error:'This board is for the three configured friends'},403);
      for(let attempt=0;attempt<3;attempt++){
        const file=await read();const old=file.scores.find(s=>s.name.toLowerCase()===name.toLowerCase());
        if(old&&old.score>=value.score)return respond(file.scores);
        if(old)old.score=value.score;else file.scores.push({name,score:value.score});
        file.scores.sort((a,b)=>b.score-a.score);
        const bytes=new TextEncoder().encode(JSON.stringify(file.scores,null,2)+'\n');
        const content=btoa(Array.from(bytes,b=>String.fromCharCode(b)).join(''));
        const response=await fetch(url,{method:'PUT',headers:{...githubHeaders,'Content-Type':'application/json'},body:JSON.stringify({message:'Update friends leaderboard',content,...(file.sha?{sha:file.sha}:{})})});
        if(response.ok)return respond(file.scores);
        if(response.status!==409)throw Error('Score could not be saved');
      }
      return respond({error:'Another score was updated at the same time. Please retry.'},409);
    }catch{return respond({error:'Score service unavailable. Your local best is still saved.'},502);}
  }
};
