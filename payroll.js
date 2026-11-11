/* Finance Master monthly payroll module */
(function(){
  const payrollTabStyle=document.createElement('style');
  payrollTabStyle.textContent='.payroll-employee-tabs{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 12px;margin:16px 0 8px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}.payroll-employee-tab{flex:0 0 150px;min-width:150px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:14px 12px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--text,#172033);text-align:left;scroll-snap-align:start;cursor:pointer}.payroll-employee-tab.active{border:2px solid var(--navy,#1c2b4a);background:#edf3ff;box-shadow:0 3px 12px rgba(25,48,90,.10)}.payroll-tab-avatar{font-size:20px;line-height:1.2}.payroll-tab-name{font-weight:800;line-height:1.35;overflow-wrap:anywhere}.payroll-employee-tab small{font-size:11px;color:#23836f;font-weight:750}.payroll-people{display:block;margin:8px 0 16px}.payroll-person{width:100%}';

  payrollTabStyle.textContent += `
  /* Payroll page: clean mobile-first layout */
  .payroll-period{padding:20px;margin-bottom:18px}
  .payroll-period>.panelhead{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:start;gap:12px;margin:0 0 18px;min-height:0;height:auto}
  .payroll-period>.panelhead>div{min-width:0;min-height:0;height:auto;flex:none}
  .payroll-period>.panelhead>.tag{justify-self:start;align-self:start;margin:0}
  .payroll-period>.panelhead p{max-width:42ch}

  .payroll-period>.panelhead h2{font-size:19px;line-height:1.4;margin:0 0 6px}
  .payroll-period>.panelhead p{font-size:13px;line-height:1.65;color:#647188;margin:0}
  .payroll-period .formgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
  .payroll-period .field{min-width:0}
  .payroll-period .field label{display:block;font-size:13px;line-height:1.55;color:#53627a;font-weight:750;margin-bottom:7px}
  .payroll-period input,.payroll-period select{width:100%;min-width:0;min-height:48px;border-radius:13px}
  .payroll-period .notice{padding:13px 15px;border-radius:13px;line-height:1.65}
  .payroll-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 16px}
  .payroll-summary .metric{min-width:0;padding:15px;border:1px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 3px 12px rgba(20,35,61,.04)}
  .payroll-summary .metrichead{font-size:12px;line-height:1.45;color:#65738a;font-weight:700}
  .payroll-summary .metric strong{display:block;font-size:21px;line-height:1.3;color:#172743;margin-top:7px;overflow-wrap:anywhere}
  .payroll-employee-tabs{gap:9px;margin:12px 0;padding-bottom:10px}
  .payroll-employee-tab{flex-basis:145px;min-width:145px;padding:12px;border-radius:13px}
  .payroll-person{padding:17px;border-radius:18px}
  .payroll-person>.panelhead{align-items:center;gap:10px;flex-wrap:wrap}
  .payroll-person>.panelhead h2{font-size:18px;line-height:1.4}
  .payroll-person .toolbar{display:flex;flex-wrap:wrap;gap:8px}
  .payroll-person .formgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .payroll-person .field{min-width:0}
  .payroll-person input{width:100%;min-width:0}
  .payroll-stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
  .payroll-stats .metric{min-width:0;padding:12px;border-radius:13px;background:#f8f9fc}
  .payroll-stats .metrichead{font-size:11px;line-height:1.45;color:#647188}
  .payroll-stats .metric strong{font-size:18px;line-height:1.35;overflow-wrap:anywhere}
  .payroll-attendance{margin-top:14px;padding:10px;border:1px solid #dce3ed;border-radius:15px;background:#fff}
  .payroll-attendance summary{padding:13px 14px;border-radius:12px;background:#f1f4fb;color:#263d68;font-size:13px;line-height:1.5}
  .payroll-attendance .tablewrap{overflow:visible}
  .payroll-attendance table{width:100%;min-width:0;table-layout:fixed;border-collapse:separate;border-spacing:0}
  .payroll-attendance th,.payroll-attendance td{padding:11px 9px;vertical-align:middle;overflow-wrap:anywhere}
  .payroll-attendance th{font-size:11px;letter-spacing:.02em;color:#647188;background:#f5f7fb}
  .payroll-attendance td:first-child{width:39%;font-size:13px;color:#26364e}
  .payroll-attendance td:last-child{width:61%}
  .payroll-status{display:block;width:100%;min-width:0;max-width:100%;min-height:44px;padding:8px 25px 8px 9px;border-radius:11px;font-size:11px;line-height:1.35;white-space:normal}
  .payroll-status-present{border-color:#9bd5b2;background:#eaf8ef;color:#176b43}
  .payroll-status-absent{border-color:#efc5a4;background:#fff3e9;color:#98501c}
  .payroll-status-off{border-color:#b8c9ee;background:#eef3ff;color:#35558e}
  .payroll-status-unmarked{border-color:#d5dbe5;background:#f5f6f8;color:#596579}
  .payroll-period .tag{white-space:nowrap}
  @media(max-width:700px){
    .payroll-period{padding:15px;border-radius:18px}
    .payroll-period>.panelhead{
      display:flex!important;flex-direction:column!important;align-items:flex-start!important;
      justify-content:flex-start!important;align-content:flex-start!important;
      gap:12px!important;margin:0 0 18px!important;padding:0!important;
      height:auto!important;min-height:0!important;max-height:none!important;
    }
    .payroll-period>.panelhead>*{
      flex:0 0 auto!important;position:static!important;
      width:auto!important;height:auto!important;min-height:0!important;
      max-height:none!important;margin:0!important;transform:none!important;
    }
    .payroll-period>.panelhead>div{display:block!important}
    .payroll-period>.panelhead>.tag{align-self:flex-start!important}
    .payroll-period>.panelhead h2{font-size:17px}
    .payroll-period .formgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .payroll-period .field label{font-size:11px;line-height:1.5;min-height:34px}
    .payroll-period input,.payroll-period select{min-height:45px;padding:9px 10px;font-size:13px}
    .payroll-summary{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
    .payroll-summary .metric{padding:12px}
    .payroll-summary .metric strong{font-size:19px}
    .payroll-person{padding:13px}
    .payroll-person .formgrid{grid-template-columns:1fr;gap:10px}
    .payroll-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
    .payroll-attendance{padding:7px}
    .payroll-attendance table{min-width:0!important}
    .payroll-attendance td:first-child{width:36%;font-size:12px}
    .payroll-attendance td:last-child{width:64%}
    .payroll-status{font-size:10px;padding:7px 19px 7px 7px;min-height:42px}
    .payroll-person .toolbar button{flex:1 1 140px}
  }
  @media(max-width:370px){
    .payroll-period .formgrid{grid-template-columns:1fr}
    .payroll-attendance td{padding:8px 5px}
    .payroll-attendance td:first-child{width:34%}
    .payroll-attendance td:last-child{width:66%}
  }`;


  payrollTabStyle.textContent += `
  /* Compact payroll workspace */
  .payroll-period{padding:16px!important;margin:0 0 12px!important}
  .payroll-period>.panelhead{gap:8px!important;margin-bottom:12px!important}
  .payroll-period>.panelhead h2{font-size:17px!important;line-height:1.3!important}
  .payroll-period>.panelhead p{font-size:12px!important;line-height:1.45!important}
  .payroll-period .formgrid{gap:10px!important}
  .payroll-period .field label{font-size:11px!important;line-height:1.35!important;margin-bottom:5px!important;min-height:0!important}
  .payroll-period input,.payroll-period select{min-height:42px!important;padding:8px 10px!important;font-size:13px!important}
  .payroll-period .notice{padding:9px 11px!important;margin-top:10px!important;font-size:11px!important;line-height:1.45!important}
  .payroll-summary{gap:8px!important;margin:0 0 12px!important}
  .payroll-summary .metric{padding:11px 12px!important;border-radius:14px!important}
  .payroll-summary .metrichead{font-size:11px!important;line-height:1.3!important}
  .payroll-summary .metric strong{font-size:19px!important;line-height:1.2!important;margin-top:5px!important}
  .payroll-summary .sub{font-size:11px!important;margin-top:4px!important}
  .toolbar:has(button[onclick*="savePayrollMonth"]){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;margin:12px 0!important}
  .toolbar:has(button[onclick*="savePayrollMonth"]) button{width:100%!important;min-width:0!important;min-height:43px!important;padding:9px 8px!important;font-size:12px!important;line-height:1.3!important;border-radius:12px!important;white-space:normal!important}
  .payroll-employee-tabs{gap:7px!important;margin:9px 0 7px!important;padding-bottom:7px!important}
  .payroll-employee-tab{flex-basis:125px!important;min-width:125px!important;padding:9px!important;gap:5px!important}
  .payroll-person{padding:12px!important;margin-bottom:10px!important}
  .payroll-person>.panelhead{margin-bottom:10px!important}
  .payroll-person>.panelhead h2{font-size:16px!important}
  .payroll-person .formgrid{gap:9px!important}
  .payroll-person .field label{font-size:11px!important;margin-bottom:4px!important}
  .payroll-person input,.payroll-person select{min-height:41px!important;padding:8px 9px!important;font-size:13px!important}
  .payroll-stats{gap:7px!important}
  .payroll-stats .metric{padding:9px!important}
  .payroll-stats .metric strong{font-size:16px!important}
  .payroll-attendance{margin-top:10px!important;padding:7px!important}
  .payroll-attendance summary{padding:10px 11px!important;font-size:12px!important}
  .payroll-attendance th,.payroll-attendance td{padding:8px 6px!important}
  .payroll-status{min-height:38px!important;font-size:10px!important}
  @media(max-width:700px){
    .payroll-period{padding:13px!important}
    .payroll-summary .metric{padding:10px!important}
    .payroll-person{padding:10px!important}
    .toolbar:has(button[onclick*="savePayrollMonth"]){gap:7px!important}
  }
  `;

  payrollTabStyle.textContent += `
  /* Tighter spacing across all payroll blocks and controls */
  .payroll-period,.payroll-person,.payroll-people,.payroll-attendance{box-sizing:border-box}
  .payroll-period{padding:12px!important;margin-bottom:9px!important}
  .payroll-period>.panelhead{margin:0 0 9px!important;padding:0!important;gap:6px!important}
  .payroll-period>.panelhead h2{margin:0!important}
  .payroll-period .formgrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:10px!important;row-gap:8px!important;align-items:start!important;margin:0!important;padding:0!important}
  .payroll-period .field{display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:4px!important;min-width:0!important;margin:0!important;padding:0!important}
  .payroll-period .field label{display:block!important;margin:0!important;padding:0!important;min-height:0!important;line-height:1.25!important;font-size:11px!important}
  .payroll-period .field input,.payroll-period .field select{display:block!important;margin:0!important;min-height:39px!important;height:39px!important;padding:6px 9px!important;line-height:1.2!important}
  .payroll-period .notice{margin:8px 0 0!important;padding:8px 10px!important}
  .payroll-summary{gap:7px!important;margin:0 0 9px!important}
  .payroll-summary .metric{padding:9px 10px!important;min-height:0!important}
  .payroll-summary .metrichead{margin:0!important}
  .payroll-summary .metric strong{margin:4px 0 0!important}
  .toolbar:has(button[onclick*="savePayrollMonth"]){gap:6px!important;margin:8px 0!important}
  .toolbar:has(button[onclick*="savePayrollMonth"]) button{min-height:39px!important;padding:7px 6px!important}
  .payroll-employee-tabs{margin:7px 0 5px!important;padding:0 0 5px!important}
  .payroll-person{padding:10px!important;margin:0 0 8px!important}
  .payroll-person>.panelhead{margin:0 0 8px!important;padding:0!important}
  .payroll-person .formgrid{row-gap:7px!important;column-gap:8px!important}
  .payroll-person .field{margin:0!important;padding:0!important;gap:4px!important}
  .payroll-person .field label{margin:0!important;line-height:1.25!important}
  .payroll-person .field input,.payroll-person .field select{margin:0!important;min-height:38px!important;height:38px!important;padding:6px 8px!important}
  .payroll-stats{gap:6px!important}
  .payroll-stats .metric{padding:8px!important}
  .payroll-attendance{margin-top:7px!important;padding:6px!important}
  .payroll-attendance summary{padding:8px 9px!important}
  .payroll-attendance th,.payroll-attendance td{padding:6px 5px!important}
  .payroll-attendance .payroll-status{min-height:35px!important;height:auto!important;padding:6px!important}
  @media(max-width:700px){
    .payroll-period{padding:11px!important}
    .payroll-period .formgrid{row-gap:7px!important;column-gap:8px!important}
    .payroll-period .field label{font-size:10px!important}
    .payroll-summary .metric{padding:8px!important}
    .payroll-person{padding:9px!important}
  }
  `;

  payrollTabStyle.textContent += `
  .payroll-status{appearance:none;-webkit-appearance:none;display:flex!important;align-items:center;justify-content:space-between;gap:7px;text-align:left;border:1px solid #d7deea;background:#f5f7fb;color:#43516a;font-weight:750;cursor:pointer}
  .payroll-status-present{background:#e8f6ed!important;border-color:#b6dfc5!important;color:#176b43!important}
  .payroll-status-absent{background:#fff0ed!important;border-color:#f0c4bd!important;color:#a6423a!important}
  .payroll-status-off{background:#edf2fc!important;border-color:#c6d4f0!important;color:#35558e!important}
  .payroll-status-unmarked{background:#f3f5f8!important;border-color:#d9dfe8!important;color:#596579!important}
  .payroll-status-chevron{font-size:17px;line-height:1;opacity:.65}
  .payroll-status-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(12,25,46,.42);display:flex;align-items:center;justify-content:center;padding:20px}
  .payroll-status-menu{width:min(100%,360px);background:#fff;border:1px solid #e1e6ef;border-radius:20px;box-shadow:0 18px 55px rgba(12,25,46,.24);padding:14px}
  .payroll-status-menu h3{font-size:15px;color:#182944;margin:2px 4px 12px}
  .payroll-status-option{width:100%;display:flex;align-items:center;gap:12px;border:1px solid transparent;border-radius:13px;padding:12px;margin:5px 0;text-align:left;font-weight:750;background:#f5f7fa;color:#26364e}
  .payroll-status-option .dot{width:11px;height:11px;border-radius:50%;flex:none}
  .payroll-status-option.is-current{border-color:#d9bd78;background:#fffaf0}
  .payroll-status-option[data-value="present"] .dot{background:#27945c}
  .payroll-status-option[data-value="absent"] .dot{background:#c9574e}
  .payroll-status-option[data-value="off"] .dot{background:#5275b8}
  .payroll-status-option[data-value="unmarked"] .dot{background:#8a95a5}
  .payroll-status-cancel{width:100%;margin-top:7px;padding:10px;border:0;border-radius:12px;background:#172b4b;color:#fff;font-weight:750}
  `;
  document.head.appendChild(payrollTabStyle);
  const DEFAULT_PEOPLE = ['Zin Wai Min','Khom','Zin Min Thu'];
  let selectedMonth = new Date().toISOString().slice(0,7);
  let selectedEmployeeId = 'pay-0';
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const currentCurrency = rec => rec.currency || state.currency || 'THB';
  function monthRecord(month){
    if(!state.payroll || typeof state.payroll !== 'object' || Array.isArray(state.payroll)) state.payroll = {};
    if(!state.payroll[month]){
      const parts = month.split('-').map(Number);
      const startDate = new Date(parts[0], parts[1]-1, 26);
      const endDate = new Date(parts[0], parts[1], 25);
      const dateKey = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
      state.payroll[month] = {
        month:month, periodStart:dateKey(startDate), periodEnd:dateKey(endDate),
        currency:state.currency || 'THB',
        employees:DEFAULT_PEOPLE.map((name,i)=>({id:'pay-'+i,name:name,dailyRate:500,salaryOverride:'',attendance:{}})),
        updatedAt:new Date().toISOString()
      };
    }
    const rec = state.payroll[month];
    if(!Array.isArray(rec.employees)) rec.employees = [];
    DEFAULT_PEOPLE.forEach((name,i)=>{
      if(!rec.employees.some(e=>e.id==='pay-'+i)) rec.employees.push({id:'pay-'+i,name:name,dailyRate:500,salaryOverride:'',attendance:{}});
    });
    rec.employees = rec.employees.slice(0,3);
    rec.employees.forEach((e,i)=>{
      if(!e.id)e.id='pay-'+i;
      if(!e.name)e.name=DEFAULT_PEOPLE[i] || 'Employee '+(i+1);
      if(!e.attendance || typeof e.attendance!=='object')e.attendance={};
      if(e.dailyRate===undefined)e.dailyRate=500;
      if(e.salaryOverride===undefined)e.salaryOverride='';
    });
    return rec;
  }
  function daysFor(rec){
    if(!rec.periodStart || !rec.periodEnd)return [];
    const start=new Date(rec.periodStart+'T00:00:00'), end=new Date(rec.periodEnd+'T00:00:00');
    if(Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end<start)return [];
    const days=[];
    for(let d=new Date(start);d<=end && days.length<370;d.setDate(d.getDate()+1))days.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));
    return days;
  }
  function stats(emp,days){
    let present=0,absent=0,off=0,unmarked=0;
    days.forEach(day=>{const v=emp.attendance[day];if(v==='present')present++;else if(v==='absent')absent++;else if(v==='off')off++;else unmarked++;});
    const calculated=present*Math.max(0,Number(emp.dailyRate)||0);
    const override=emp.salaryOverride!=='' && emp.salaryOverride!==null && emp.salaryOverride!==undefined;
    return {present,absent,off,unmarked,calculated,override,salary:override?Math.max(0,Number(emp.salaryOverride)||0):calculated};
  }
  function money(value,currency){return new Intl.NumberFormat('en-US',{style:'currency',currency:['THB','MMK','USD','SGD'].includes(currency)?currency:'THB',maximumFractionDigits:2}).format(Number(value)||0);}
  function persist(message){
    monthRecord(selectedMonth).updatedAt=new Date().toISOString();
    save();
    if(message)toast(message);
    // Do not rebuild the whole page while a user is selecting attendance.
    // The selected dropdown remains open and the new value is already visible.
    const status=document.getElementById('saveStatus');
    if(status)status.textContent='● Saved on this device';
  }
  function employeeCard(emp,index,rec,days){
    const st=stats(emp,days), currency=currentCurrency(rec);
    const rows=days.map(day=>{
      const value=emp.attendance[day]||'unmarked';
      const weekday=new Date(day+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'});
      const labels={unmarked:'မမှတ်ရသေး',present:'အလုပ်ဆင်း',absent:'ပျက်ရက်',off:'နားရက်'};
      return '<tr><td>'+esc(day)+'<br><small class="sub">'+esc(weekday)+'</small></td><td><button type="button" class="payroll-status payroll-status-'+value+'" aria-label="'+esc(emp.name)+' '+esc(day)+'" data-employee="'+esc(emp.id)+'" data-day="'+esc(day)+'" onclick="showPayrollStatusMenu(this)"><span>'+labels[value]+'</span><span class="payroll-status-chevron">⌄</span></button></td></tr>';
    }).join('');
    return '<section class="panel payroll-person"><div class="panelhead"><div><h2>👤 '+esc(emp.name)+'</h2><p>Employee '+(index+1)+' · '+esc(selectedMonth)+'</p></div><span class="tag">'+st.present+' attend</span></div><div class="toolbar"><button type="button" class="pill" onclick="exportSelectedPayrollImage(&quot;'+esc(emp.id)+'&quot;)">🖼 Save '+esc(emp.name)+' as image</button></div><div class="formgrid"><div class="field"><label>Employee name / အမည်</label><input value="'+esc(emp.name)+'" maxlength="80" onchange="setPayrollName(\''+esc(emp.id)+'\',this.value)"></div><div class="field"><label>Daily wage / တစ်ရက်လစာ</label><input type="number" min="0" step="0.01" value="'+Number(emp.dailyRate||0)+'" onchange="setPayrollRate(\''+esc(emp.id)+'\',this.value)"></div><div class="field"><label>Manual monthly salary (optional) / သတ်မှတ်လစာ</label><input type="number" min="0" step="0.01" placeholder="Auto-calculate from attend days" value="'+(emp.salaryOverride===''?'':Number(emp.salaryOverride||0))+'" onchange="setPayrollOverride(\''+esc(emp.id)+'\',this.value)"></div><div class="field"><label>Final salary / ရမည့်လစာ</label><input readonly value="'+esc(money(st.salary,currency))+'"></div></div><div class="cards payroll-stats"><div class="metric"><div class="metrichead">Attend days / ဆင်းရက်</div><strong>'+st.present+'</strong></div><div class="metric"><div class="metrichead">Absent days / ပျက်ရက်</div><strong>'+st.absent+'</strong></div><div class="metric"><div class="metrichead">Day off / နားရက်</div><strong>'+st.off+'</strong></div><div class="metric"><div class="metrichead">Not marked / မမှတ်ရသေး</div><strong>'+st.unmarked+'</strong></div><div class="metric"><div class="metrichead">Salary / လစာ</div><strong>'+esc(money(st.salary,currency))+'</strong></div></div><details class="payroll-attendance"><summary>Attendance calendar / နေ့စဉ်အလုပ်ဆင်းရက် မှတ်ရန် ('+days.length+' days)</summary><div class="tablewrap"><table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div></details></section>';
  }
  window.payrollPage = function(){
    const rec=monthRecord(selectedMonth),days=daysFor(rec);
    const months=Object.keys(state.payroll||{}).sort().reverse();
    const monthOptions=Array.from(new Set([selectedMonth].concat(months))).sort().reverse().map(m=>'<option value="'+esc(m)+'" '+(m===selectedMonth?'selected':'')+'>'+esc(m)+'</option>').join('');
    const total=rec.employees.reduce((n,e)=>n+stats(e,days).salary,0);
    const totalPresent=rec.employees.reduce((n,e)=>n+stats(e,days).present,0);
    const totalAbsent=rec.employees.reduce((n,e)=>n+stats(e,days).absent,0);
    const history=months.length?months.map(m=>{
      const x=monthRecord(m),ds=daysFor(x),sum=x.employees.reduce((n,e)=>n+stats(e,ds).salary,0);
      return '<tr><td>'+esc(m)+'</td><td>'+esc(x.periodStart||'—')+' → '+esc(x.periodEnd||'—')+'</td><td>'+x.employees.length+'</td><td><b>'+esc(money(sum,currentCurrency(x)))+'</b></td><td><button class="pill" onclick="changePayrollMonth(\''+m+'\')">View / Edit</button></td></tr>';
    }).join(''):'<tr><td colspan="5" class="empty">No payroll history yet.</td></tr>';
    return pageHead('Monthly Payroll / လစာစာရင်း','လူ ၃ ယောက်အတွက် လစာစတင်ရက်၊ လစာပိတ်ရက်၊ အလုပ်ဆင်းရက်နှင့် လစဉ်မှတ်တမ်းကို စီမံပါ။')+
      '<section class="panel payroll-period"><div class="panelhead"><div><h2>Payroll period / လစာကာလ</h2><p>Set the salary start and closing dates for this payroll cycle. New months default to the 26th through the 25th of the next month.</p></div><span class="tag">'+months.length+' saved month(s)</span></div><div class="formgrid"><div class="field"><label>Month / လ</label><select onchange="changePayrollMonth(this.value)">'+monthOptions+'</select></div><div class="field"><label>Currency / ငွေကြေး</label><select onchange="setPayrollCurrency(this.value)"><option value="THB" '+(currentCurrency(rec)==='THB'?'selected':'')+'>THB ฿</option><option value="MMK" '+(currentCurrency(rec)==='MMK'?'selected':'')+'>MMK K</option><option value="USD" '+(currentCurrency(rec)==='USD'?'selected':'')+'>USD $</option><option value="SGD" '+(currentCurrency(rec)==='SGD'?'selected':'')+'>SGD $</option></select></div><div class="field"><label>Salary period start / လစာစတင်ရက် (ဥပမာ 26 ရက်)</label><input type="date" value="'+esc(rec.periodStart||'')+'" onchange="setPayrollPeriod(\'periodStart\',this.value)"></div><div class="field"><label>Salary closing date / လစာပိတ်ရက် (ဥပမာ နောက်လ 25 ရက်)</label><input type="date" value="'+esc(rec.periodEnd||'')+'" onchange="setPayrollPeriod(\'periodEnd\',this.value)"></div></div><div class="notice" style="margin-top:15px;margin-bottom:0"><b>Attend</b> ရက်ကို နေ့စားနှုန်းနဲ့တွက်မယ်။ <b>Absent</b> က ပျက်ရက်၊ <b>Day Off</b> က နားရက်ပါ။ Manual monthly salary ဖြည့်ထားရင် အလိုအလျောက်တွက်ချက်မှုအစား ကိုယ်တိုင်သတ်မှတ်ထားတဲ့ လစာကို အသုံးပြုမယ်။ အပြောင်းအလဲတိုင်းကို လအလိုက် သိမ်းထားမယ်။</div></section>'+
      '<div class="cards payroll-summary"><div class="metric"><div class="metrichead">Employees</div><strong>3</strong><div class="sub">Payroll team</div></div><div class="metric"><div class="metrichead">Total attend days</div><strong>'+totalPresent+'</strong></div><div class="metric"><div class="metrichead">Total absent days</div><strong>'+totalAbsent+'</strong></div><div class="metric"><div class="metrichead">Total salary</div><strong>'+esc(money(total,currentCurrency(rec)))+'</strong></div></div>'+
      '<div class="toolbar"><button class="primary" onclick="savePayrollMonth()">✓ Save this month</button><button class="pill" onclick="exportPayrollCSV()">⇩ Export payroll CSV</button><button class="pill" onclick="exportPayrollExcel()">📊 Download Excel report</button><button class="pill" onclick="exportPayrollImage()">🖼 Save attendance as image</button><button class="pill" onclick="exportSelectedPayrollImage()">👤 Save selected employee</button><button class="pill" onclick="newPayrollMonth()">＋ New month</button></div>'+
      '<section class="panel payroll-share-panel"><div class="panelhead"><div><h2>🔗 Employee Share Links / ဝန်ထမ်း Share Link</h2><p>ဝန်ထမ်းတစ်ယောက်ချင်းစီအတွက် ကိုယ်ပိုင် Link ထုတ်ပေးပါ။ ဝန်ထမ်းသည် မိမိ Attendance ကိုသာ ပြင်ဆင်နိုင်ပြီး လစာနှုန်းထားကို Owner ကသာ ထိန်းချုပ်နိုင်သည်။</p></div></div><div class="toolbar">'+rec.employees.map(e=>'<button type="button" class="pill" onclick="createPayrollShareLink(&quot;'+esc(e.id)+'&quot;)">🔗 '+esc(e.name)+' Share Link</button>').join('')+'<button type="button" class="pill" onclick="managePayrollShareLinks()">⚙ Manage Share Links</button><button type="button" class="pill" onclick="syncPayrollEmployeeAttendance()">↻ Sync employee Attendance</button></div><div id="payrollShareStatus" class="sub" aria-live="polite"></div></section>'+
      '<div class="payroll-employee-tabs" role="tablist" aria-label="Select employee">'+rec.employees.map((e,i)=>'<button type="button" role="tab" aria-selected="'+(e.id===selectedEmployeeId?'true':'false')+'" class="payroll-employee-tab '+(e.id===selectedEmployeeId?'active':'')+'" onclick="selectPayrollEmployee(&quot;'+esc(e.id)+'&quot;)"><span class="payroll-tab-avatar">👤</span><span class="payroll-tab-name">'+esc(e.name)+'</span><small>'+stats(e,days).present+' attend</small></button>').join('')+'</div>'+
      '<div class="payroll-people">'+employeeCard(rec.employees.find(e=>e.id===selectedEmployeeId)||rec.employees[0],Math.max(0,rec.employees.findIndex(e=>e.id===selectedEmployeeId)),rec,days)+'</div>'+
      '<section class="panel"><div class="panelhead"><div><h2>Previous months / အရင်လစာရင်း</h2><p>Saved months remain available after you move to another month.</p></div></div><div class="tablewrap"><table><thead><tr><th>Month</th><th>Period</th><th>Employees</th><th>Total salary</th><th>Action</th></tr></thead><tbody>'+history+'</tbody></table></div></section>';
  };

  window.createPayrollShareLink=async function(id){
    const status=document.getElementById('payrollShareStatus');const rec=monthRecord(selectedMonth);const emp=rec.employees.find(e=>e.id===id);if(!emp)return;
    try{if(!window.fmPayrollShare?.ready)throw new Error('Owner account ကို Login ဝင်ထားပါ။');status.textContent='Share Link ဖန်တီးနေပါသည်…';const url=await window.fmPayrollShare.create(emp,rec);try{await navigator.clipboard.writeText(url);status.textContent=emp.name+' အတွက် Link ကို Copy လုပ်ပြီးပါပြီ။';}catch(e){status.textContent='Link ဖန်တီးပြီးပါပြီ။ Copy လုပ်ရန် အောက်ပါ Link ကိုနှိပ်ပါ။';}const box=document.createElement('textarea');box.readOnly=true;box.value=url;box.style.cssText='width:100%;min-height:64px;margin-top:8px;padding:10px;border:1px solid #d9bd78;border-radius:10px';status.appendChild(box);box.addEventListener('click',()=>{box.select();});}catch(e){status.textContent='Share Link မဖန်တီးနိုင်ပါ: '+(e.message||e);}
  };
  window.syncPayrollEmployeeAttendance=async function(){const status=document.getElementById('payrollShareStatus');try{status.textContent='ဝန်ထမ်း Attendance ပြောင်းလဲမှုများ စစ်ဆေးနေပါသည်…';const n=await window.fmPayrollShare.syncAttendance();status.textContent=n+' ဝန်ထမ်း၏ Attendance မှတ်တမ်းကို Owner Payroll ထဲသို့ Sync လုပ်ပြီးပါပြီ။';}catch(e){status.textContent='Sync မအောင်မြင်ပါ: '+(e.message||e);}};
  window.managePayrollShareLinks=async function(){
    const status=document.getElementById('payrollShareStatus');try{const list=await window.fmPayrollShare.list();if(!list.length){status.textContent='Share Link မရှိသေးပါ။';return;}const active=list.filter(x=>x.active);const lines=active.map((x,i)=>(i+1)+'. '+x.employeeName+' · '+x.month+' · '+new URL('payroll-employee.html?token='+x.id,location.origin).href);const choice=prompt('Active Employee Share Links\\n'+lines.join('\\n')+'\\n\\nပိတ်လိုသော Link နံပါတ်ကို ရိုက်ပါ။ မပိတ်လိုပါက Cancel နှိပ်ပါ။');if(choice===null)return;const n=Number(choice);if(!Number.isInteger(n)||n<1||n>active.length)throw new Error('နံပါတ်မမှန်ပါ။');if(!confirm(active[n-1].employeeName+' ၏ Share Link ကို ပိတ်မလား။'))return;await window.fmPayrollShare.revoke(active[n-1].id);status.textContent='Share Link ပိတ်ပြီးပါပြီ။';}catch(e){status.textContent='Link စီမံခန့်ခွဲမှု မအောင်မြင်ပါ: '+(e.message||e);}
  };
\n    window.selectPayrollEmployee=function(id){if(!monthRecord(selectedMonth).employees.some(e=>e.id===id))return;selectedEmployeeId=id;render();};
  window.showPayrollStatusMenu=function(id,day,trigger){
    const current=monthRecord(selectedMonth).employees.find(e=>e.id===id)?.attendance?.[day]||'unmarked';
    const backdrop=document.createElement('div');backdrop.className='payroll-status-backdrop';
    const menu=document.createElement('div');menu.className='payroll-status-menu';menu.setAttribute('role','dialog');menu.setAttribute('aria-modal','true');
    const title=document.createElement('h3');title.textContent=day+' · အလုပ်ဆင်းအခြေအနေ';menu.appendChild(title);
    const choices=[['unmarked','မမှတ်ရသေး'],['present','အလုပ်ဆင်း'],['absent','ပျက်ရက်'],['off','နားရက်']];
    choices.forEach(([value,label])=>{
      const b=document.createElement('button');b.type='button';b.className='payroll-status-option'+(value===current?' is-current':'');b.dataset.value=value;
      const dot=document.createElement('span');dot.className='dot';const text=document.createElement('span');text.textContent=label;b.append(dot,text);
      b.addEventListener('click',()=>{window.setPayrollAttendance(id,day,value,trigger);trigger.querySelector('span:first-child').textContent=label;trigger.classList.remove('payroll-status-unmarked','payroll-status-present','payroll-status-absent','payroll-status-off');trigger.classList.add('payroll-status-'+value);backdrop.remove();});
      menu.appendChild(b);
    });
    const cancel=document.createElement('button');cancel.type='button';cancel.className='payroll-status-cancel';cancel.textContent='ပိတ်မည်';cancel.addEventListener('click',()=>backdrop.remove());menu.appendChild(cancel);
    backdrop.addEventListener('click',e=>{if(e.target===backdrop)backdrop.remove();});backdrop.appendChild(menu);document.body.appendChild(backdrop);
  };

  window.setPayrollAttendance=function(id,day,value,el){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.attendance[day]=['present','absent','off'].includes(value)?value:'';if(value==='unmarked')delete e.attendance[day];if(el){el.classList.remove('payroll-status-unmarked','payroll-status-present','payroll-status-absent','payroll-status-off');el.classList.add('payroll-status-'+(['present','absent','off'].includes(value)?value:'unmarked'));}persist();};
  window.setPayrollName=function(id,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.name=String(value||'').trim()||'Employee';persist();};
  window.setPayrollRate=function(id,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.dailyRate=Math.max(0,Number(value)||0);persist();};
  window.setPayrollOverride=function(id,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.salaryOverride=value===''?'':Math.max(0,Number(value)||0);persist();};
  window.setPayrollPeriod=function(key,value){const rec=monthRecord(selectedMonth);if(key==='periodStart')rec.periodStart=value;else if(key==='periodEnd')rec.periodEnd=value;if(rec.periodStart&&rec.periodEnd&&rec.periodEnd<rec.periodStart){toast('End date must be on or after start date');rec.periodEnd=rec.periodStart;}persist();};
  window.setPayrollCurrency=function(value){monthRecord(selectedMonth).currency=['THB','MMK','USD','SGD'].includes(value)?value:'THB';persist();};
  window.changePayrollMonth=function(value){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))return;selectedMonth=value;monthRecord(value);save();render();};
  window.newPayrollMonth=function(){const now=new Date();const def=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');const value=prompt('Enter payroll month as YYYY-MM',def);if(!value)return;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)){toast('Use YYYY-MM format');return;}selectedMonth=value;monthRecord(value);save();render();};
  window.savePayrollMonth=function(){monthRecord(selectedMonth).updatedAt=new Date().toISOString();save();toast('Payroll month saved');render();};
  window.exportSelectedPayrollImage=function(employeeId){
    const rec=monthRecord(selectedMonth);
    const emp=rec.employees.find(e=>e.id===(employeeId||selectedEmployeeId));
    if(!emp){toast('Please select an employee first');return;}
    const days=daysFor(rec),currency=currentCurrency(rec),st=stats(emp,days);
    const columns=[{label:'Date',width:150},{label:'Day',width:130},{label:'Attendance status',width:300},{label:'Daily wage',width:180},{label:'Pay counted',width:180}];
    const width=columns.reduce((n,c)=>n+c.width,0),titleHeight=135,summaryHeight=95,headerHeight=62,rowHeight=52;
    const height=titleHeight+summaryHeight+headerHeight+days.length*rowHeight+40;
    const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;
    const ctx=canvas.getContext('2d');ctx.scale(2,2);
    ctx.fillStyle='#f4f7fb';ctx.fillRect(0,0,width,height);
    ctx.fillStyle='#14213d';ctx.fillRect(0,0,width,titleHeight);
    ctx.fillStyle='#fff';ctx.font='bold 30px Arial';ctx.fillText('FINANCE MASTER — ATTENDANCE REPORT',28,42);
    ctx.font='bold 23px Arial';ctx.fillText('Employee: '+emp.name,28,80);
    ctx.font='18px Arial';ctx.fillText('Month: '+selectedMonth+' | Period: '+(rec.periodStart||'—')+' to '+(rec.periodEnd||'—'),28,110);
    let y=titleHeight;ctx.fillStyle='#fff';ctx.fillRect(0,y,width,summaryHeight);
    ctx.fillStyle='#24334e';ctx.font='bold 17px Arial';
    ctx.fillText('Attend: '+st.present+' days',24,y+27);
    ctx.fillText('Absent: '+st.absent+' days',250,y+27);
    ctx.fillText('Day Off: '+st.off+' days',480,y+27);
    ctx.fillText('Not marked: '+st.unmarked+' days',710,y+27);
    ctx.fillText('Daily wage: '+money(Number(emp.dailyRate)||0,currency)+' | Final salary: '+money(st.salary,currency),24,y+63);
    y+=summaryHeight;
    let x=0;ctx.fillStyle='#dce6f5';ctx.fillRect(0,y,width,headerHeight);
    ctx.fillStyle='#14213d';ctx.font='bold 18px Arial';
    columns.forEach(col=>{ctx.fillText(col.label,x+12,y+37);x+=col.width});
    y+=headerHeight;
    days.forEach(day=>{
      x=0;const value=emp.attendance[day]||'unmarked';
      const bg=value==='present'?'#e2f7eb':value==='off'?'#e8efff':value==='absent'?'#fff0e1':'#f0f2f6';
      const statusLabel={present:'ATTEND / အလုပ်ဆင်း',absent:'ABSENT / ပျက်ရက်',off:'DAY OFF / နားရက်',unmarked:'NOT MARKED / မမှတ်ရသေး'}[value]||'NOT MARKED';
      ctx.fillStyle=bg;ctx.fillRect(0,y,width,rowHeight);
      ctx.strokeStyle='#d6deea';ctx.beginPath();ctx.moveTo(0,y+rowHeight);ctx.lineTo(width,y+rowHeight);ctx.stroke();
      const vals=[day,new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'}),statusLabel,money(Number(emp.dailyRate)||0,currency),money(value==='present'?(Number(emp.dailyRate)||0):0,currency)];
      ctx.fillStyle='#172033';ctx.font='17px Arial';
      vals.forEach((v,j)=>{ctx.fillText(String(v),x+12,y+32);x+=columns[j].width});
      y+=rowHeight;
    });
    ctx.strokeStyle='#aebbd0';ctx.strokeRect(0,titleHeight+summaryHeight,width,headerHeight+days.length*rowHeight);
    canvas.toBlob(blob=>{
      if(!blob){toast('Could not create image. Please try again.');return;}
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='finance-master-attendance-'+emp.name.replace(/[^a-z0-9-_]+/gi,'-')+'-'+selectedMonth+'.png';
      document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
      toast('Employee attendance image saved to Downloads');
    },'image/png');
  };
  window.exportPayrollImage=function(){
    const rec=monthRecord(selectedMonth),days=daysFor(rec),currency=currentCurrency(rec);
    const employees=rec.employees;
    const columns=[{label:'Employee',width:190},{label:'Date',width:125},{label:'Day',width:110},{label:'Attendance',width:220},{label:'Daily wage',width:145},{label:'Pay counted',width:155}];
    const width=columns.reduce((n,c)=>n+c.width,0),rowHeight=44,headerHeight=62,titleHeight=112,summaryHeight=66;
    const rows=[];
    employees.forEach(emp=>days.forEach(day=>{
      const value=emp.attendance[day]||'unmarked';
      const statusLabel={present:'ATTEND / အလုပ်ဆင်း',absent:'ABSENT / ပျက်ရက်',off:'DAY OFF / နားရက်',unmarked:'NOT MARKED / မမှတ်ရသေး'}[value]||'NOT MARKED';
      rows.push({employee:emp.name,date:day,weekday:new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'short'}),status:statusLabel,value,wage:Number(emp.dailyRate)||0,pay:value==='present'?(Number(emp.dailyRate)||0):0});
    }));
    const height=titleHeight+summaryHeight+headerHeight+rows.length*rowHeight+38;
    const canvas=document.createElement('canvas');canvas.width=width*2;canvas.height=height*2;
    const ctx=canvas.getContext('2d');ctx.scale(2,2);
    ctx.fillStyle='#f4f7fb';ctx.fillRect(0,0,width,height);
    ctx.fillStyle='#14213d';ctx.fillRect(0,0,width,titleHeight);
    ctx.fillStyle='#ffffff';ctx.font='bold 30px Arial';ctx.fillText('FINANCE MASTER — ATTENDANCE REPORT',28,43);
    ctx.font='20px Arial';ctx.fillText('Payroll month: '+selectedMonth+'   |   Period: '+(rec.periodStart||'—')+' to '+(rec.periodEnd||'—'),28,78);
    ctx.font='16px Arial';ctx.fillText('Currency: '+currency+'   |   Employees: '+employees.length+'   |   Days per employee: '+days.length,28,102);
    let y=titleHeight;
    ctx.fillStyle='#ffffff';ctx.fillRect(0,y,width,summaryHeight);
    ctx.fillStyle='#24334e';ctx.font='bold 17px Arial';
    let x=22;const summaries=employees.map(emp=>{const st=stats(emp,days);return emp.name+': Attend '+st.present+' | Absent '+st.absent+' | Day Off '+st.off+' | Salary '+money(st.salary,currency)});
    summaries.forEach((line,i)=>ctx.fillText(line,x,y+24+i*21));
    y+=summaryHeight;
    x=0;ctx.fillStyle='#dce6f5';ctx.fillRect(0,y,width,headerHeight);
    ctx.font='bold 17px Arial';ctx.fillStyle='#14213d';
    columns.forEach(col=>{ctx.fillText(col.label,x+10,y+36);x+=col.width});
    y+=headerHeight;
    rows.forEach(r=>{
      x=0;
      const bg=r.value==='present'?'#e2f7eb':r.value==='off'?'#e8efff':r.value==='absent'?'#fff0e1':'#f0f2f6';
      ctx.fillStyle=bg;ctx.fillRect(0,y,width,rowHeight);
      ctx.strokeStyle='#d6deea';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,y+rowHeight);ctx.lineTo(width,y+rowHeight);ctx.stroke();
      const vals=[r.employee,r.date,r.weekday,r.status,money(r.wage,currency),money(r.pay,currency)];
      ctx.font='15px Arial';ctx.fillStyle='#172033';
      vals.forEach((v,j)=>{const max=columns[j].width-18;let label=String(v);while(ctx.measureText(label).width>max&&label.length>3)label=label.slice(0,-2)+'…';ctx.fillText(label,x+9,y+27);x+=columns[j].width});
      y+=rowHeight;
    });
    ctx.strokeStyle='#aebbd0';ctx.lineWidth=1;ctx.strokeRect(0,titleHeight+summaryHeight,width,headerHeight+rows.length*rowHeight);
    canvas.toBlob(blob=>{
      if(!blob){toast('Could not create image. Please try again.');return;}
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='finance-master-attendance-'+selectedMonth+'.png';
      document.body.appendChild(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),2000);
      toast('Attendance image saved to Downloads');
    },'image/png');
  };
  window.exportPayrollExcel=function(){
    const rec=monthRecord(selectedMonth),days=daysFor(rec),currency=currentCurrency(rec);
    const xmlEsc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    const cell=(value,type)=>'<Cell><Data ss:Type="'+(type||((typeof value==='number')?'Number':'String'))+'">'+xmlEsc(value)+'</Data></Cell>';
    const row=items=>'<Row>'+items.map(x=>Array.isArray(x)?cell(x[0],x[1]):cell(x)).join('')+'</Row>';
    const details=[row(['Month','Employee','Date','Weekday','Attendance status','Daily wage','Currency','Daily pay counted'])];
    const summaries=[row(['Month','Employee','Period start','Period end','Currency','Daily wage','Attend days','Absent days','Day off','Not marked days','Calculated salary','Manual salary','Final salary'])];
    rec.employees.forEach(emp=>{
      const st=stats(emp,days);
      days.forEach(day=>{
        const statusValue=emp.attendance[day]||'unmarked';
        const statusLabel={present:'Attend / အလုပ်ဆင်း',absent:'Absent / ပျက်ရက်',off:'Day Off / နားရက်',unmarked:'Not marked / မမှတ်ရသေး'}[statusValue]||'Not marked / မမှတ်ရသေး';
        const weekday=new Date(day+'T00:00:00').toLocaleDateString('en-US',{weekday:'long'});
        details.push(row([selectedMonth,emp.name,day,weekday,statusLabel,Number(emp.dailyRate)||0,currency,statusValue==='present'?(Number(emp.dailyRate)||0):0]));
      });
      summaries.push(row([selectedMonth,emp.name,rec.periodStart||'',rec.periodEnd||'',currency,Number(emp.dailyRate)||0,st.present,st.absent,st.off,st.unmarked,st.calculated,emp.salaryOverride===''?'':Number(emp.salaryOverride),st.salary]));
    });
    const sheet=(name,rows)=>'<Worksheet ss:Name="'+name+'"><Table>'+rows.join('')+'</Table></Worksheet>';
    const workbook='<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+sheet('Attendance Details',details)+sheet('Salary Summary',summaries)+'</Workbook>';
    const blob=new Blob(['\ufeff',workbook],{type:'application/vnd.ms-excel;charset=utf-8'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='finance-master-attendance-'+selectedMonth+'.xls';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    toast('Excel attendance report downloaded');
  };
  window.exportPayrollCSV=function(){const rec=monthRecord(selectedMonth),days=daysFor(rec);const rows=[['Month','Period Start','Period End','Employee','Currency','Daily Wage','Attend Days','Absent Days','Day Off','Calculated Salary','Manual Salary','Final Salary','Not Marked Days']];rec.employees.forEach(e=>{const st=stats(e,days);rows.push([selectedMonth,rec.periodStart,rec.periodEnd,e.name,currentCurrency(rec),e.dailyRate,st.present,st.absent,st.off,st.calculated,e.salaryOverride,st.salary,st.unmarked]);});const csv=rows.map(row=>row.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='finance-master-payroll-'+selectedMonth+'.csv';a.click();URL.revokeObjectURL(url);};
})();
