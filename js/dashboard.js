
renderShell({active:'dashboard',title:'University Dashboard',subtitle:'Institution-wide academic, financial and operational overview'});
const errorMsg=document.getElementById('errorMsg'),statRow=document.getElementById('statRow');
function statBlock(label,count,href){return `<div class="stat-block"><a href="${href}"><div class="stat-number">${count}</div><div class="stat-label">${label}</div></a></div>`}
async function loadCounts(){try{
 const [d,p,c,f,s,se,e,u]=await Promise.all([getDepartments(),getPrograms(),getCourses(),getFaculty(),getStudents(),getSections(),getEnrollments(),getUniversitySummary()]);
 const x=u.data;statRow.innerHTML=[
 statBlock('Departments',d.data.length,'departments.html'),statBlock('Programs',p.data.length,'programs.html'),
 statBlock('Courses',c.data.length,'courses.html'),statBlock('Faculty',f.data.length,'faculty.html'),
 statBlock('Students',s.data.length,'students.html'),statBlock('Active Sections',se.data.length,'sections.html'),
 statBlock('Enrollments',e.data.length,'enrollments.html'),statBlock('Pending Admissions',x.pending_applications,'modules.html?module=admissions')
 ].join('');
 document.getElementById('financeOverview').innerHTML=`<div class="card-grid"><div class="module-card"><h3>Total invoiced</h3><p>${x.invoice_total.toLocaleString()} (currency configured by institution)</p></div><div class="module-card"><h3>Total collected</h3><p>${x.paid_total.toLocaleString()}</p></div><div class="module-card"><h3>Receivable</h3><p>${x.receivable.toLocaleString()}</p></div><div class="module-card"><h3>Recorded expenses</h3><p>${x.expenses.toLocaleString()}</p></div></div>`;
}catch(e){errorMsg.textContent=e.message;errorMsg.style.display='block'}}
loadCounts();
