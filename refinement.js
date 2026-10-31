'use strict';
/* Presentation and session controls. Wagers never escalate automatically. */
const wheelDisc=document.createElement('div');
wheelDisc.className='wheel-disc'; gameWheel.prepend(wheelDisc);
let wheelRotation=0;
function rouletteTarget(number){return -(wheelOrder.indexOf(number)+.5)*360/37;}
async function animateRoulette(number){
  const target=((rouletteTarget(number)%360)+360)%360;
  wheelRotation+=1800+((target-wheelRotation%360+360)%360);
  wheelDisc.style.transition=(motionOff||reducedMotion.matches)?'none':'transform 2.45s cubic-bezier(.12,.7,.1,1)';
  wheelDisc.style.transform=`rotate(${wheelRotation}deg)`;
  gameWheel.dataset.result=String(number);
  await pause(2500);
}
const tableWager=betZones.get('blackjack');
$('blackjack').querySelector('.scene').append(tableWager.zone);
tableWager.zone.classList.add('table-wager');
tableWager.zone.querySelector('.bet-zone-copy span').textContent='YOUR WAGER';
const initialRefreshBetZone=refreshBetZone;
refreshBetZone=function(id){initialRefreshBetZone(id);if(id==='blackjack')tableWager.zone.classList.toggle('wager-active',active)};
// Buttons and input cannot alter the wager of a live hand.
const refinedButtons=setButtons;
setButtons=function(){refinedButtons();$('bj-bet').disabled=active||autoRunning;tableWager.clear.disabled=active||autoRunning;$('reset').disabled=active||arcadeBusy||autoRunning;};
setButtons();refreshBetZone('blackjack');
const resultBanner=document.createElement('div');resultBanner.className='round-result';resultBanner.setAttribute('role','status');resultBanner.hidden=true;
$('blackjack').querySelector('.controls').before(resultBanner);
const refinedFinish=finish;
finish=function(message,payout){if(!active)return;const wager=stake;refinedFinish(message,payout);resultBanner.hidden=false;resultBanner.replaceChildren();const heading=document.createElement('strong');heading.textContent=message;const detail=document.createElement('span');detail.textContent=`Wager ${fmt(wager)} · Returned ${fmt(payout)} · Net ${payout-wager>=0?'+':''}${fmt(payout-wager)}. Select DEAL CARDS for the next hand.`;resultBanner.append(heading,detail);};
const refinedDeal=$('deal').onclick;
$('deal').onclick=function(){if(active||arcadeBusy)return;resultBanner.hidden=true;return refinedDeal.call(this)};
for(const id of ['bj-message','roulette-message','slot-message'])$(id).setAttribute('aria-live','polite');
// Only animate newly dealt cards, not every previously rendered card.
let previousCards={player:[],dealer:[]};
const refinedRender=renderBJ;
renderBJ=function(hide){refinedRender(hide);for(const side of ['player','dealer']){const values=(side==='player'?player:dealer).map((c,i)=>hide&&side==='dealer'&&i===1?'back':c.r+c.s);document.querySelectorAll('#'+side+'-cards .card').forEach((el,i)=>{if(previousCards[side][i]===values[i])el.style.animation='none'});previousCards[side]=values;}};
// Controls are captured once at start and remain unchanged for a session.
const autoOptions=document.createElement('div');autoOptions.className='auto-options';
autoOptions.innerHTML='<label>BLACKJACK: STAND AT <select id="auto-stand">'+[12,13,14,15,16,17,18,19,20,21].map(n=>`<option ${n===17?'selected':''}>${n}</option>`).join('')+'</select></label><label>LOSS LIMIT <input id="auto-loss-limit" type="number" min="0" step="1" value="200"></label><label>PROFIT TARGET <input id="auto-profit-target" type="number" min="0" step="1" value="200"></label><small>Fixed wager each round. Limits use net session chips; 0 disables a limit. Blackjack does not auto split or double. A threshold is your chosen rule, not an optimal strategy.</small>';
autoPanel.append(autoOptions);
autoStatus('Choose a table, place your wager, then start auto play.');
runAuto=async function(){
  if(autoRunning||!canStartAuto())return;
  const threshold=Number($('auto-stand').value),lossLimit=Number($('auto-loss-limit').value),profitTarget=Number($('auto-profit-target').value);
  if(![lossLimit,profitTarget].every(n=>Number.isSafeInteger(n)&&n>=0)){autoStatus('Limits must be nonnegative whole numbers.');return;}
  autoGame=current;autoCancel=false;const token=++autoToken,total=Number($('auto-rounds').value),stopOnWin=$('auto-win').checked,startBalance=balance;
  const wager=autoGame==='roulette'?boardStake():Number($(activeBetId()).value);
  setAutoState(true);autoOptions.querySelectorAll('input,select').forEach(el=>el.disabled=true);
  let played=0,reason='Round limit reached';
  try{
    for(let round=1;round<=total;round++){
      if(autoCancel||current!==autoGame||token!==autoToken){reason='Stopped';break;}
      if(wager>balance){reason='Not enough chips for the next wager';break;}
      const net=balance-startBalance;
      // Do not start a round whose possible loss exceeds the remaining budget.
      if(lossLimit&&net-wager < -lossLimit){reason='Loss budget reached';break;}
      if(profitTarget&&net>=profitTarget){reason='Profit target reached';break;}
      const before=balance;autoStatus(`Round ${round}/${total} · wager ${fmt(wager)} · session ${net>=0?'+':''}${fmt(net)}`);
      if(autoGame==='blackjack'){
        $('bj-bet').value=String(wager);$('deal').onclick();await pause(500);
        while(active){if(score(player)<threshold)$('hit').onclick();else $('stand').onclick();await pause(450);}
      }else if(autoGame==='roulette')await $('spin-wheel').onclick();else{ $('s-bet').value=String(wager);await $('spin-slots').onclick(); }
      played++;
      // Celebration is nonblocking.
      if(stopOnWin&&balance>before){reason='Stopped after a win';break;}
      if(autoCancel){reason='Stopped after completing the round';break;}
      await pause(650);
    }
  }catch(error){reason='Stopped after an unexpected error';console.error(error);}
  finally{setAutoState(false);autoOptions.querySelectorAll('input,select').forEach(el=>el.disabled=false);autoGame=null;saveGame();autoStatus(`${reason} · ${played} rounds · session ${balance-startBalance>=0?'+':''}${fmt(balance-startBalance)}`);}
};
$('auto-start').onclick=runAuto;
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAuto('Stopping after this round because the game is in the background.');});
ruleText.blackjack=ruleText.blackjack.replace('Auto play hits below 17 and stands on 17 or more; it does not split or double.','Auto play hits below your selected stand threshold. It does not split or double. The loss limit is checked before wagering; the profit target is checked between rounds. These controls do not change the odds.');
// Pause/menu keeps the live hand intact and stops new automatic rounds.
const menu=document.createElement('dialog');menu.id='pause-menu';menu.innerHTML='<h2>MITCHY RICH</h2><p>The casino of Mitchell’s Angels</p><button id="resume-game" class="primary">RESUME GAME</button><button id="menu-leaderboard" class="leaderboard-button">★ LEADERBOARD</button><button id="menu-rules">TABLE RULES</button><button id="menu-music">TOGGLE MUSIC</button>';
document.body.append(menu);const menuButton=document.createElement('button');menuButton.textContent='MENU / PAUSE';menuButton.className='icon';menuButton.onclick=()=>{stopAuto();if('speechSynthesis'in window)speechSynthesis.cancel();menu.showModal();};document.querySelector('.header-right').append(menuButton);
$('resume-game').onclick=()=>menu.close();$('menu-rules').onclick=()=>{menu.close();$('rules').click()};$('menu-music').onclick=()=>audioButton.click();
// High-water mark is stored independently, so a new game never erases it.
let highCash=Math.max(balance,Number(localStorage.getItem('mitchy-high-cash'))||0);
let localScores;try{localScores=JSON.parse(localStorage.getItem('mitchy-scores')||'[]');if(!Array.isArray(localScores))localScores=[];}catch{localScores=[];}
const leaderboard=document.createElement('aside');leaderboard.className='leaderboard';leaderboard.id='leaderboard';leaderboard.innerHTML='<h2>★ HIGH ROLLERS</h2><p>MOST CASH HELD</p><ol id="leaderboard-list"></ol><strong id="personal-best"></strong><label>YOUR NAME<input id="score-name" maxlength="24" autocomplete="nickname" placeholder="Enter your name"></label><button id="save-score" class="primary">SAVE MY BEST</button><small id="leaderboard-status">Local scoreboard — shared sync is not configured.</small>';
document.body.append(leaderboard);$('score-name').value=localStorage.getItem('mitchy-player-name')||'';
function renderLeaderboard(){
  $('personal-best').textContent='YOUR BEST: '+fmt(highCash);$('leaderboard-list').replaceChildren();
  for(const entry of localScores.filter(x=>typeof x.name==='string'&&Number.isSafeInteger(x.score)).sort((a,b)=>b.score-a.score).slice(0,10)){const li=document.createElement('li');const label=document.createElement('span');label.textContent=entry.name;const value=document.createElement('b');value.textContent=fmt(entry.score);li.append(label,value);$('leaderboard-list').append(li);}
}
const highUpdate=updateBalance;updateBalance=function(){highUpdate();if(balance>highCash){highCash=balance;localStorage.setItem('mitchy-high-cash',String(highCash));}renderLeaderboard();};
$('save-score').onclick=()=>{const name=$('score-name').value.trim();if(!name){$('leaderboard-status').textContent='Enter your name first.';return;}localStorage.setItem('mitchy-player-name',name);const old=localScores.find(x=>x.name.toLowerCase()===name.toLowerCase());if(old)old.score=Math.max(old.score,highCash);else localScores.push({name,score:highCash});localStorage.setItem('mitchy-scores',JSON.stringify(localScores));renderLeaderboard();$('leaderboard-status').textContent='Saved on this device. Shared sync is not configured.';};
function openLeaderboard(){if(menu.open)menu.close();leaderboard.scrollIntoView({behavior:'smooth',block:'center'});$('score-name').focus();}
const leaderboardButton=document.createElement('button');leaderboardButton.className='leaderboard-button';leaderboardButton.textContent='★ LEADERBOARD';leaderboardButton.onclick=openLeaderboard;document.querySelector('.header-right').append(leaderboardButton);$('menu-leaderboard').onclick=openLeaderboard;renderLeaderboard();
// Persist the already-drawn result before animation. Reload cannot lose or reroll a wager.
function beginPendingRound(finalBalance,game){localStorage.setItem('mitchy-pending-round',JSON.stringify({balance:finalBalance,game}));}
function completePendingRound(){saveGame();localStorage.removeItem('mitchy-pending-round');}
try{const pending=JSON.parse(localStorage.getItem('mitchy-pending-round')||'null');if(pending&&Number.isSafeInteger(pending.balance)&&pending.balance>=0){balance=pending.balance;updateBalance();saveGame();localStorage.removeItem('mitchy-pending-round');const message=pending.game==='roulette'?$('roulette-message'):$('slot-message');message.textContent='Previous round recovered. Your result is included in your balance.';}}catch(error){console.warn('Round recovery unavailable',error);}
// Optional shared service: no GitHub credential is ever sent to the client.
const sharedEndpoint=window.MITCHY_LEADERBOARD_URL;
async function syncSharedScores(submission){
  if(!sharedEndpoint)return;
  try{const response=await fetch(sharedEndpoint,{method:submission?'POST':'GET',headers:submission?{'Content-Type':'application/json'}:undefined,body:submission?JSON.stringify(submission):undefined,signal:AbortSignal.timeout(12000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Shared leaderboard unavailable');if(!Array.isArray(data))throw Error('Invalid scoreboard response');localScores=data.filter(x=>typeof x.name==='string'&&Number.isSafeInteger(x.score)&&x.score>=0);renderLeaderboard();$('leaderboard-status').textContent='Shared friends leaderboard · synced';}catch(error){$('leaderboard-status').textContent=error.message+' · local best is saved.';}
}
if(sharedEndpoint){const localSave=$('save-score').onclick;$('save-score').onclick=async()=>{localSave();const name=$('score-name').value.trim();if(!name)return;$('save-score').disabled=true;try{await syncSharedScores({name,score:highCash});}finally{$('save-score').disabled=false;}};syncSharedScores();setInterval(()=>{if(!document.hidden)syncSharedScores();},60000);}
// A celebration never holds up the next hand or automatic session.
pause=async function(ms){return new Promise(resolve=>setTimeout(resolve,(motionOff||reducedMotion.matches)?0:ms));};

