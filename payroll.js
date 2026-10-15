/* Finance Master monthly payroll module */
(function(){
  const DEFAULT_PEOPLE = ['Zin Wai Min','Khom','Zin Min Thu'];
  let selectedMonth = new Date().toISOString().slice(0,7);
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
    let present=0,absent=0,off=0;
    days.forEach(day=>{const v=emp.attendance[day]||'off';if(v==='present')present++;else if(v==='absent')absent++;else off++;});
    const calculated=present*Math.max(0,Number(emp.dailyRate)||0);
    const override=emp.salaryOverride!=='' && emp.salaryOverride!==null && emp.salaryOverride!==undefined;
    return {present,absent,off,calculated,override,salary:override?Math.max(0,Number(emp.salaryOverride)||0):calculated};
  }
  function money(value,currency){return new Intl.NumberFormat('en-US',{style:'currency',currency:['THB','MMK','USD','SGD'].includes(currency)?currency:'THB',maximumFractionDigits:2}).format(Number(value)||0);}
  function persist(message){
    monthRecord(selectedMonth).updatedAt=new Date().toISOString();
    save();
    if(message)toast(message);
    render();
  }
  function employeeCard(emp,index,rec,days){
    const st=stats(emp,days), currency=currentCurrency(rec);
    const rows=days.map(day=>{
      const value=emp.attendance[day]||'off';
      const weekday=new Date(day+'T00:00:00').toLocaleDateString(undefined,{weekday:'short'});
      return '<tr><td>'+esc(day)+'<br><small class="sub">'+esc(weekday)+'</small></td><td><select class="payroll-status" aria-label="'+esc(emp.name)+' '+esc(day)+'" onchange="setPayrollAttendance(\''+esc(emp.id)+'\',\''+day+'\',this.value)"><option value="present" '+(value==='present'?'selected':'')+'>Attend / အလုပ်ဆင်း</option><option value="absent" '+(value==='absent'?'selected':'')+'>Absent / ပျက်ရက်</option><option value="off" '+(value==='off'?'selected':'')+'>Day Off / နားရက်</option></select></td></tr>';
    }).join('');
    return '<section class="panel payroll-person"><div class="panelhead"><div><h2>👤 '+esc(emp.name)+'</h2><p>Employee '+(index+1)+' · '+esc(selectedMonth)+'</p></div><span class="tag">'+st.present+' attend</span></div><div class="formgrid"><div class="field"><label>Employee name / အမည်</label><input value="'+esc(emp.name)+'" maxlength="80" onchange="setPayrollName(\''+esc(emp.id)+'\',this.value)"></div><div class="field"><label>Daily wage / တစ်ရက်လစာ</label><input type="number" min="0" step="0.01" value="'+Number(emp.dailyRate||0)+'" onchange="setPayrollRate(\''+esc(emp.id)+'\',this.value)"></div><div class="field"><label>Manual monthly salary (optional) / သတ်မှတ်လစာ</label><input type="number" min="0" step="0.01" placeholder="Auto-calculate from attend days" value="'+(emp.salaryOverride===''?'':Number(emp.salaryOverride||0))+'" onchange="setPayrollOverride(\''+esc(emp.id)+'\',this.value)"></div><div class="field"><label>Final salary / ရမည့်လစာ</label><input readonly value="'+esc(money(st.salary,currency))+'"></div></div><div class="cards payroll-stats"><div class="metric"><div class="metrichead">Attend days / ဆင်းရက်</div><strong>'+st.present+'</strong></div><div class="metric"><div class="metrichead">Absent days / ပျက်ရက်</div><strong>'+st.absent+'</strong></div><div class="metric"><div class="metrichead">Day off / နားရက်</div><strong>'+st.off+'</strong></div><div class="metric"><div class="metrichead">Salary / လစာ</div><strong>'+esc(money(st.salary,currency))+'</strong></div></div><details class="payroll-attendance"><summary>Attendance calendar / နေ့စဉ်အလုပ်ဆင်းရက် မှတ်ရန် ('+days.length+' days)</summary><div class="tablewrap"><table><thead><tr><th>Date</th><th>Status</th></tr></thead><tbody>'+rows+'</tbody></table></div></details></section>';
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
      '<div class="toolbar"><button class="primary" onclick="savePayrollMonth()">✓ Save this month</button><button class="pill" onclick="exportPayrollCSV()">⇩ Export payroll CSV</button><button class="pill" onclick="newPayrollMonth()">＋ New month</button></div>'+
      '<div class="payroll-people">'+rec.employees.map((e,i)=>employeeCard(e,i,rec,days)).join('')+'</div>'+
      '<section class="panel"><div class="panelhead"><div><h2>Previous months / အရင်လစာရင်း</h2><p>Saved months remain available after you move to another month.</p></div></div><div class="tablewrap"><table><thead><tr><th>Month</th><th>Period</th><th>Employees</th><th>Total salary</th><th>Action</th></tr></thead><tbody>'+history+'</tbody></table></div></section>';
  };
  window.setPayrollAttendance=function(id,day,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.attendance[day]=['present','absent','off'].includes(value)?value:'off';persist();};
  window.setPayrollName=function(id,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.name=String(value||'').trim()||'Employee';persist();};
  window.setPayrollRate=function(id,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.dailyRate=Math.max(0,Number(value)||0);persist();};
  window.setPayrollOverride=function(id,value){const e=monthRecord(selectedMonth).employees.find(x=>x.id===id);if(!e)return;e.salaryOverride=value===''?'':Math.max(0,Number(value)||0);persist();};
  window.setPayrollPeriod=function(key,value){const rec=monthRecord(selectedMonth);if(key==='periodStart')rec.periodStart=value;else if(key==='periodEnd')rec.periodEnd=value;if(rec.periodStart&&rec.periodEnd&&rec.periodEnd<rec.periodStart){toast('End date must be on or after start date');rec.periodEnd=rec.periodStart;}persist();};
  window.setPayrollCurrency=function(value){monthRecord(selectedMonth).currency=['THB','MMK','USD','SGD'].includes(value)?value:'THB';persist();};
  window.changePayrollMonth=function(value){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value))return;selectedMonth=value;monthRecord(value);save();render();};
  window.newPayrollMonth=function(){const now=new Date();const def=now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');const value=prompt('Enter payroll month as YYYY-MM',def);if(!value)return;if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)){toast('Use YYYY-MM format');return;}selectedMonth=value;monthRecord(value);save();render();};
  window.savePayrollMonth=function(){monthRecord(selectedMonth).updatedAt=new Date().toISOString();save();toast('Payroll month saved');render();};
  window.exportPayrollCSV=function(){const rec=monthRecord(selectedMonth),days=daysFor(rec);const rows=[['Month','Period Start','Period End','Employee','Currency','Daily Wage','Attend Days','Absent Days','Day Off','Calculated Salary','Manual Salary','Final Salary']];rec.employees.forEach(e=>{const st=stats(e,days);rows.push([selectedMonth,rec.periodStart,rec.periodEnd,e.name,currentCurrency(rec),e.dailyRate,st.present,st.absent,st.off,st.calculated,e.salaryOverride,st.salary]);});const csv=rows.map(row=>row.map(v=>'"'+String(v==null?'':v).replace(/"/g,'""')+'"').join(',')).join('\r\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='finance-master-payroll-'+selectedMonth+'.csv';a.click();URL.revokeObjectURL(url);};
})();
