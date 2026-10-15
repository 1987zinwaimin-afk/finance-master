/* Finance Master monthly payroll module */
(function(){
  const payrollTabStyle=document.createElement('style');
  payrollTabStyle.textContent='.payroll-employee-tabs{display:flex;gap:10px;overflow-x:auto;padding:4px 2px 12px;margin:16px 0 8px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch}.payroll-employee-tab{flex:0 0 150px;min-width:150px;display:flex;flex-direction:column;align-items:flex-start;gap:7px;padding:14px 12px;border:1px solid var(--line);border-radius:14px;background:#fff;color:var(--text,#172033);text-align:left;scroll-snap-align:start;cursor:pointer}.payroll-employee-tab.active{border:2px solid var(--navy,#1c2b4a);background:#edf3ff;box-shadow:0 3px 12px rgba(25,48,90,.10)}.payroll-tab-avatar{font-size:20px;line-height:1.2}.payroll-tab-name{font-weight:800;line-height:1.35;overflow-wrap:anywhere}.payroll-employee-tab small{font-size:11px;color:#23836f;font-weight:750}.payroll-people{display:block;margin:8px 0 16px}.payroll-person{width:100%}';
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
      return '<tr><td>'+esc(day)+'<br><small class="sub">'+esc(weekday)+'</small></td><td><select class="payroll-status payroll-status-' + value + '" aria-label="'+esc(emp.name)+' '+esc(day)+'" onchange="setPayrollAttendance(\''+esc(emp.id)+'\',\''+day+'\',this.value,this)"><option value="unmarked" '+(value==='unmarked'?'selected':'')+'>Not marked / မမှတ်ရသေး</option><option value="present" '+(value==='present'?'selected':'')+'>Attend / အလုပ်ဆင်း</option><option value="absent" '+(value==='absent'?'selected':'')+'>Absent / ပျက်ရက်</option><option value="off" '+(value==='off'?'selected':'')+'>Day Off / နားရက်</option></select></td></tr>';
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
      '<div class="payroll-employee-tabs" role="tablist" aria-label="Select employee">'+rec.employees.map((e,i)=>'<button type="button" role="tab" aria-selected="'+(e.id===selectedEmployeeId?'true':'false')+'" class="payroll-employee-tab '+(e.id===selectedEmployeeId?'active':'')+'" onclick="selectPayrollEmployee(&quot;'+esc(e.id)+'&quot;)"><span class="payroll-tab-avatar">👤</span><span class="payroll-tab-name">'+esc(e.name)+'</span><small>'+stats(e,days).present+' attend</small></button>').join('')+'</div>'+
      '<div class="payroll-people">'+employeeCard(rec.employees.find(e=>e.id===selectedEmployeeId)||rec.employees[0],Math.max(0,rec.employees.findIndex(e=>e.id===selectedEmployeeId)),rec,days)+'</div>'+
      '<section class="panel"><div class="panelhead"><div><h2>Previous months / အရင်လစာရင်း</h2><p>Saved months remain available after you move to another month.</p></div></div><div class="tablewrap"><table><thead><tr><th>Month</th><th>Period</th><th>Employees</th><th>Total salary</th><th>Action</th></tr></thead><tbody>'+history+'</tbody></table></div></section>';
  };
  window.selectPayrollEmployee=function(id){if(!monthRecord(selectedMonth).employees.some(e=>e.id===id))return;selectedEmployeeId=id;render();};
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
