function f(e){return new Promise((t,n)=>{new Promise((o,a)=>{const i=setInterval(()=>{const r=[];for(const s of e){const l=document.querySelectorAll(s);r.push(l&&l.length>0?Array.from(l):null)}r.indexOf(null)===-1&&o({id:i,data:r})},20)}).then(({id:o,data:a})=>{clearInterval(o),t(a)})})}function w(e){const t=document.createElement("script");t.src=chrome.runtime.getURL(e),t.type="module",t.onload=()=>t.remove(),(document.head||document.documentElement).append(t)}function c(e){return u(window.getComputedStyle(e).top)}function u(e){return Number.parseFloat(e.replace("px",""))}function T(e,t){for(const n of e)f([n]).then(([o])=>{const a=o[0];new MutationObserver(function(r){r.forEach(function(s){(s.type==="childList"||s.type==="attributes")&&t()})}).observe(a,{childList:!0,attributes:!0})})}const S="/task/2997$4767.htmld";function A(){f(["[data-automation-id=entriesContainer]",'[label="Worked / Scheduled difference"]']).then(([e,t])=>{var n,o;if(e[0],console.log("removed tags"),t){let a=[],i,r,s,l=!0;for(const d of t){l&&(i=window.getComputedStyle(d).height,r=window.getComputedStyle(d).top);let h=(n=d.getAttribute("aria-label"))==null?void 0:n.split("|").pop();(o=d.parentElement)==null||o.removeChild(d);let p=document.querySelectorAll(`button[aria-label*="${h}"]`);if(p.length===0)return;let b=Array.from(p).sort((y,v)=>c(y)-c(v));l&&(s=u(r??"0")+u(i??"0"),s=c(b[0])-s,l=!1),a.push(...b)}for(const d of a)d.style.top=`${c(d)-u(i??"0")-(s??0)}px`}})}function C(){chrome.runtime.sendMessage({type:"request",data:{action:"working_hours"}}).then(e=>{e!==null&&(console.log((e.data.difference/(1e3*60*60)).toFixed(2)),f([`[data-automation-id=calendarWeek] [data-automation-id*="calendarDateCell"][aria-label*="${e.data.date.formatted}"] [data-automation-id="calendarDateHoursAccumulationLabel"]`]).then(([t])=>{const n=t[0],o=(e.data.totalForToday+e.data.difference/(1e3*60*60)).toFixed(2);n.innerHTML!==`Hours: ${o}`&&(n.innerHTML=`Hours: ${o}`)}))})}function m(){A(),C()}function E(){const e="responseDataPass",t="responseData",n=document.createElement("div");n.setAttribute("id",e),document.body.appendChild(n),new MutationObserver(function(a){a.forEach(function(i){if(i.type=="attributes"){const r=i.target.getAttribute(t);chrome.runtime.sendMessage({type:"response",data:r})}})}).observe(n,{attributes:!0})}function H(){window.addEventListener("popstate",e=>{var t,n;if(e.target){const o=e.target,a=document.querySelectorAll('[label="Worked / Scheduled difference"]');((n=(t=o==null?void 0:o.location)==null?void 0:t.href)!=null&&n.includes(S)||a.length>0)&&(m(),g())}})}function g(){T(["[data-automation-id=entriesContainer]","[id*=wd-Calendar]"],()=>{m()})}w("js/request-patch.js");H();g();window.addEventListener("load",()=>{E(),m()});
