/* Studyly exam-management expansion.
   All additions are client-side demonstration modules using localStorage.
   Existing modules, scenic backgrounds and their rotation logic are left intact. */
(function(){
"use strict";
const K={
 schedules:"studyly_exam_schedules",attendance:"studyly_attendance_records",
 assignments:"studyly_assignments",submissions:"studyly_assignment_submissions",
 syllabus:"studyly_syllabus_progress",revision:"studyly_revision_items",
 notices:"studyly_exam_notices",reeval:"studyly_reevaluation_requests",
 approvals:"studyly_exam_approvals",calendar:"studyly_academic_calendar",
 bookmarks:"studyly_question_bookmarks",irregularities:"studyly_exam_irregularities",
 questionBank:"studyly_question_bank",notifications:"studyly_notifications",
 evalLog:"studyly_manual_evaluation_log"
};
const read=k=>{try{return JSON.parse(localStorage.getItem(k)||"[]")}catch(e){return[]}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const safe=s=>typeof esc==="function"?esc(s):String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const me=()=>session||{username:"Student",role:"student"};
const isStaff=()=>me().role==="admin"||me().role==="principal";
const isPrincipal=()=>me().role==="principal";
const dateText=d=>d?new Date(d+"T00:00:00").toLocaleDateString():"Not set";
const box=(title,body,extra="")=>`<section class="card em-card ${extra}"><div class="section-head"><h3>${title}</h3></div>${body}</section>`;
const empty=t=>`<div class="em-empty">${t}</div>`;
const table=(heads,rows)=>`<div class="em-table-wrap"><table class="em-table"><thead><tr>${heads.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${rows.length?rows.join(""):`<tr><td colspan="${heads.length}">No records available.</td></tr>`}</tbody></table></div>`;
const field=(label,id,type="text",placeholder="",required=true)=>`<label class="em-field">${label}<input id="${id}" type="${type}" placeholder="${placeholder}" ${required?"required":""}></label>`;
const selectField=(label,id,options)=>`<label class="em-field">${label}<select id="${id}">${options.map(o=>`<option value="${safe(o.value)}">${safe(o.label)}</option>`).join("")}</select></label>`;
const button=(text,action,cls="secondary")=>`<button type="button" class="${cls}" onclick="${action}">${text}</button>`;
function notify(text,target="all"){
 const a=read(K.notifications);a.push({id:uid(),text,for:target,at:new Date().toISOString(),read:false});write(K.notifications,a);
}
function exams(){return read("studyly_exams")}
function users(){return read("studyly_users")}
function results(){return read("studyly_results")}
function currentStudent(){return me().username}
function userRows(){return users().filter(u=>u.role==="student")}
function statusPill(t){const s=String(t||"Pending");return `<span class="em-status">${safe(s)}</span>`}
function formCard(title,formId,fields,submitText){return box(title,`<form id="${formId}" class="em-form">${fields.join("")}<button class="primary" type="submit">${submitText}</button></form>`)}
function downloadCSV(filename,rows){
 const csv=rows.map(r=>r.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
function addAudit(text){if(typeof activity==="function")activity(text)}
function setUpForm(id,fn){const f=document.getElementById(id);if(f)f.onsubmit=e=>{e.preventDefault();fn(f)}}
function value(id){return document.getElementById(id)?.value?.trim()||""}
function makeNotice(text,target="all"){notify(text,target);addAudit("Published examination notice: "+text)}
function studentNoticeList(){
 const list=read(K.notifications).filter(n=>n.for==="all"||n.for===currentStudent()).slice().reverse();
 return list.map(n=>`<div class="em-notice"><div>${safe(n.text)}</div><small>${new Date(n.at).toLocaleString()}</small></div>`).join("")||empty("No notifications yet.");
}

/* STUDENT: Exam center, attempt history, mock practice and bookmarks. */
views.studentExamCenter=()=>{
 const all=exams().filter(x=>x.published),schedule=read(K.schedules).filter(s=>all.some(e=>e.id===s.examId));
 const mine=results().filter(r=>r.student===currentStudent()).slice().reverse();
 const rows=all.map(e=>`<tr><td>${safe(e.title)}</td><td>${safe(e.subject)}</td><td>${e.duration} min</td><td>${(e.questions||[]).length}</td><td>${button("Start exam",`takeExam('${e.id}')`,"primary")}</td></tr>`);
 const history=mine.slice(0,10).map(r=>`<tr><td>${safe(r.title)}</td><td>${safe(r.subject)}</td><td>${r.score}/${r.total}</td><td>${r.percent}%</td><td>${new Date(r.at).toLocaleDateString()}</td><td>${button("Review",`emReviewAttempt('${r.id}')`)}</td></tr>`);
 const upcoming=schedule.filter(s=>new Date(s.date+"T"+(s.time||"00:00"))>=new Date()).map(s=>`<tr><td>${safe(s.title)}</td><td>${dateText(s.date)} ${safe(s.time||"")}</td><td>${safe(s.subject)}</td><td>${safe(s.duration)} min</td></tr>`);
 return `<div class="em-intro"><h2>Examination Center</h2><p>Find published examinations, scheduled assessments and your previous attempts.</p></div>
 <div class="grid g3"><div class="card"><h3>Available exams</h3><div class="metric">${all.length}</div></div><div class="card"><h3>My attempts</h3><div class="metric">${mine.length}</div></div><div class="card"><h3>Average score</h3><div class="metric accent">${mine.length?Math.round(mine.reduce((a,r)=>a+r.percent,0)/mine.length):0}%</div></div></div><br>
 ${box("Upcoming scheduled exams",table(["Exam","Date and time","Subject","Duration"],upcoming))}
 ${box("Available examinations",table(["Examination","Subject","Duration","Questions","Action"],rows))}
 ${box("Recent attempt history",table(["Assessment","Subject","Marks","Score","Date","Review"],history))}
 <div class="em-actions">${button("Export my results",`emExportMyResults()`,"secondary")}</div>`;
};
window.emReviewAttempt=function(rid){
 const r=results().find(x=>x.id===rid);if(!r||r.student!==currentStudent())return toast("Attempt not found.");
 const answers=(r.answers||[]).map((a,i)=>`<div class="em-answer"><b>Question ${i+1}: ${safe(a.question)}</b><p>Your answer: ${safe(a.answer||"No answer")}</p><small>Marks: ${a.awarded}/${a.marks}</small></div>`).join("");
 openModal(`<h2>${safe(r.title)} — Answer Review</h2><p>Score: ${r.score}/${r.total} (${r.percent}%)</p>${answers||empty("No answer-level review is stored.")}`);
};
window.emExportMyResults=function(){const r=results().filter(x=>x.student===currentStudent());downloadCSV("my-studyly-results.csv",[["Assessment","Subject","Marks","Total","Percent","Date"],...r.map(x=>[x.title,x.subject,x.score,x.total,x.percent,x.at])])};

/* STUDENT: attendance, assignments and assignment submission. */
views.studentAttendance=()=>{
 const all=read(K.attendance).filter(a=>a.student===currentStudent());
 const present=all.filter(a=>a.status==="Present").length,percent=all.length?Math.round(present/all.length*100):0;
 const rows=all.slice().reverse().map(a=>`<tr><td>${dateText(a.date)}</td><td>${safe(a.subject)}</td><td>${statusPill(a.status)}</td><td>${safe(a.note||"")}</td></tr>`);
 return `<div class="grid g3"><div class="card"><h3>Classes recorded</h3><div class="metric">${all.length}</div></div><div class="card"><h3>Present</h3><div class="metric">${present}</div></div><div class="card"><h3>Attendance</h3><div class="metric accent">${percent}%</div></div></div><br>${box("Attendance eligibility",`<p>${percent>=75?"Your recorded attendance currently meets the 75% reference threshold.":"Your recorded attendance is below the 75% reference threshold. Contact your faculty to confirm official eligibility."}</p><div class="bar"><i style="width:${percent}%"></i></div><small class="muted">This is an informational estimate based only on records entered in Studyly.</small>`)}${box("Attendance history",table(["Date","Subject","Status","Note"],rows))}`;
};
views.studentAssignments=()=>{
 const as=read(K.assignments),subs=read(K.submissions);
 const rows=as.map(a=>{const mine=subs.find(s=>s.assignmentId===a.id&&s.student===currentStudent());return `<tr><td>${safe(a.title)}</td><td>${safe(a.subject)}</td><td>${dateText(a.due)}</td><td>${statusPill(mine?mine.status:"Not submitted")}</td><td>${mine?safe(mine.feedback||"Awaiting feedback"):button("Submit",`emSubmitAssignment('${a.id}')`,"primary")}</td></tr>`});
 return box("My assignments",table(["Assignment","Subject","Due date","Status","Submission / feedback"],rows));
};
window.emSubmitAssignment=function(aid){
 const a=read(K.assignments).find(x=>x.id===aid);if(!a)return;
 openModal(`<h2>Submit assignment</h2><p>${safe(a.title)} · ${safe(a.subject)}</p><form id="emSubmitAssignmentForm" class="em-form"><label class="em-field">Your response<textarea id="emSubmissionText" rows="7" required placeholder="Write your answer or submission link"></textarea></label><button class="primary">Submit work</button></form>`);
 setUpForm("emSubmitAssignmentForm",()=>{const s=read(K.submissions);s.push({id:uid(),assignmentId:aid,student:currentStudent(),response:value("emSubmissionText"),status:"Submitted",submittedAt:new Date().toISOString(),feedback:""});write(K.submissions,s);notify("Your assignment submission was received.", "admin");closeModal();go("studentAssignments")});
};

/* STUDENT: syllabus progress, revision list, assistant and notices. */
views.studentSyllabus=()=>{
 const topics=read(K.syllabus).filter(t=>t.student===currentStudent());
 const done=topics.filter(t=>t.done).length;
 return `<div class="em-two-col">${formCard("Add syllabus topic","emSyllabusForm",[field("Subject","emSylSubject"),field("Topic / unit","emSylTopic")],"Add topic")}${box("Progress summary",`<div class="metric accent">${topics.length?Math.round(done/topics.length*100):0}%</div><p class="muted">${done} of ${topics.length} topics completed</p>`)}</div>
 ${box("My syllabus",topics.map(t=>`<div class="em-check-row"><label><input type="checkbox" ${t.done?"checked":""} onchange="emToggleSyllabus('${t.id}',this.checked)"> <b>${safe(t.subject)}</b> — ${safe(t.topic)}</label>${button("Remove",`emDeleteSyllabus('${t.id}')`)}</div>`).join("")||empty("Add topics to start tracking your syllabus."))}`;
};
setUpForm("emSyllabusForm",()=>{});
window.emToggleSyllabus=(idv,done)=>{const a=read(K.syllabus),t=a.find(x=>x.id===idv);if(t){t.done=done;write(K.syllabus,a);go("studentSyllabus")}};
window.emDeleteSyllabus=idv=>{write(K.syllabus,read(K.syllabus).filter(x=>x.id!==idv));go("studentSyllabus")};

views.studentRevision=()=>{
 const items=read(K.revision).filter(x=>x.student===currentStudent());
 const rows=items.map(x=>`<div class="em-check-row"><label><input type="checkbox" ${x.done?"checked":""} onchange="emToggleRevision('${x.id}',this.checked)"> <b>${safe(x.subject)}</b> — ${safe(x.topic)} <small>${dateText(x.date)}</small></label>${button("Remove",`emDeleteRevision('${x.id}')`)}</div>`);
 return `${formCard("Plan a revision session","emRevisionForm",[field("Subject","emRevSubject"),field("Topic","emRevTopic"),field("Revision date","emRevDate","date")],"Add revision")}${box("Revision checklist",rows.join("")||empty("No revision sessions planned."))}`;
};
window.emToggleRevision=(idv,done)=>{const a=read(K.revision),t=a.find(x=>x.id===idv);if(t){t.done=done;write(K.revision,a);go("studentRevision")}};
window.emDeleteRevision=idv=>{write(K.revision,read(K.revision).filter(x=>x.id!==idv));go("studentRevision")};

views.studentAssistant=()=>{
 const q=exams().flatMap(e=>(e.questions||[]).map(x=>({subject:e.subject,q:x.q,answer:x.answer,title:e.title})));
 const materials=read("studyly_learning_notes");
 return `<div class="em-intro"><h2>Study Assistant</h2><p>Ask for guidance about exam preparation, study planning or questions already available in your Studyly question banks.</p></div>
 ${box("Ask a study question",`<form id="emAssistantForm" class="em-form"><label class="em-field">Your question<textarea id="emAssistantQuestion" rows="3" required placeholder="For example: explain the key topics I should revise for Java"></textarea></label><button class="primary">Get study guidance</button></form><div id="emAssistantAnswer" class="em-assistant-answer"></div>`)}
 ${box("Available learning content",`<p>${q.length} question-bank entries and ${materials.length} saved learning materials are available in this browser.</p><p class="muted">This local assistant searches existing content and provides study-planning guidance. A connected AI service is required for generated subject explanations.</p>`)}`;
};
setUpForm("emAssistantForm",()=>{const query=value("emAssistantQuestion").toLowerCase();const hits=exams().flatMap(e=>(e.questions||[]).filter(q=>(e.subject+" "+q.q+" "+(q.answer||"")).toLowerCase().includes(query)||query.split(/\s+/).some(w=>w.length>3&&(q.q+" "+(q.answer||"")+" "+e.subject).toLowerCase().includes(w))).map(q=>({subject:e.subject,q:q.q,answer:q.answer}))).slice(0,5);const target=document.getElementById("emAssistantAnswer");if(target)target.innerHTML=hits.length?`<h4>Related saved questions</h4>${hits.map(h=>`<div class="em-answer"><b>${safe(h.subject)}: ${safe(h.q)}</b><p>${safe(h.answer||"No model answer stored.")}</p></div>`).join("")}`:`<p class="muted">No exact match found in the saved question bank. Try a subject name or a shorter keyword. You can also add this topic to your revision planner.`});
views.studentNotifications=()=>box("Notifications",studentNoticeList());

/* ADMIN: question bank, schedule, generator, bulk import, attempts and monitoring. */
views.adminQuestionBank=()=>{
 const bank=read(K.questionBank);
 const examQs=exams().flatMap(e=>(e.questions||[]).map(q=>({...q,subject:e.subject,examTitle:e.title})));
 const all=[...bank,...examQs];
 const rows=all.map((q,i)=>`<tr><td>${safe(q.subject||"General")}</td><td>${safe(q.type||"VSAQ")}</td><td>${safe(q.q)}</td><td>${safe(q.difficulty||"Standard")}</td><td>${q.marks||1}</td><td>${q.source||"Saved question"}</td></tr>`);
 return `${formCard("Add question to reusable bank","emQuestionForm",[field("Subject","emQSubject"),selectField("Question type","emQType",["MCQ","VSAQ","SAQ","LAQ"].map(x=>({value:x,label:x}))),field("Question","emQText"),field("Correct / model answer","emQAnswer"),field("Marks","emQMarks","number","1"),selectField("Difficulty","emQDifficulty",["Easy","Medium","Hard"].map(x=>({value:x,label:x})))],"Save question")}
 ${box("Bulk question import",`<p class="muted">Upload a CSV with columns: subject,type,question,answer,marks,difficulty. MCQ options can be included in separate option1–option4 columns.</p><label class="em-field">Choose CSV file<input id="emQuestionCSV" type="file" accept=".csv,text/csv"></label>${button("Import CSV","emImportQuestions()","primary")}`)}
 ${box("Question bank",table(["Subject","Type","Question","Difficulty","Marks","Source"],rows))}`;
};
window.emImportQuestions=function(){
 const file=document.getElementById("emQuestionCSV")?.files?.[0];if(!file)return toast("Choose a CSV file first.");
 const reader=new FileReader();reader.onload=()=>{const lines=String(reader.result).split(/\r?\n/).filter(Boolean);const headers=lines.shift().split(",").map(x=>x.trim().toLowerCase());const col=(r,n)=>r[headers.indexOf(n)]||"";
 const bank=read(K.questionBank);lines.forEach(line=>{const r=line.split(",");if(!col(r,"question"))return;bank.push({id:uid(),subject:col(r,"subject"),type:col(r,"type")||"VSAQ",q:col(r,"question"),answer:col(r,"answer"),marks:+col(r,"marks")||1,difficulty:col(r,"difficulty")||"Medium",options:[1,2,3,4].map(n=>col(r,"option"+n)).filter(Boolean),source:"CSV import"})});write(K.questionBank,bank);toast("Questions imported.");go("adminQuestionBank")};reader.readAsText(file);
};

views.adminExamTools=()=>{
 const ex=exams(),schedule=read(K.schedules),allQ=[...read(K.questionBank),...ex.flatMap(e=>(e.questions||[]).map(q=>({...q,subject:e.subject,source:e.title})))];
 const examOptions=ex.map(e=>({value:e.id,label:e.title+" — "+e.subject}));
 const schedules=schedule.slice().reverse().map(s=>`<tr><td>${safe(s.title)}</td><td>${safe(s.subject)}</td><td>${dateText(s.date)} ${safe(s.time)}</td><td>${s.duration} min</td><td>${statusPill(s.status)}</td></tr>`);
 const attemptRows=results().slice().reverse().slice(0,20).map(r=>`<tr><td>${safe(r.student)}</td><td>${safe(r.title)}</td><td>${safe(r.subject)}</td><td>${r.score}/${r.total}</td><td>${r.percent}%</td><td>${new Date(r.at).toLocaleString()}</td></tr>`);
 return `<div class="em-two-col">${formCard("Schedule an existing exam","emScheduleForm",[selectField("Exam","emScheduleExam",examOptions.length?examOptions:[{value:"",label:"Create an exam first"}]),field("Date","emScheduleDate","date"),field("Start time","emScheduleTime","time"),field("Duration (minutes)","emScheduleDuration","number","60")],"Save schedule")}
 ${box("Question paper generator",`<p class="muted">Build a draft exam from reusable questions in the question bank.</p><form id="emPaperForm" class="em-form">${field("Paper title","emPaperTitle")}${field("Subject","emPaperSubject")}${field("Number of questions","emPaperCount","number","10")}<button class="primary">Generate draft paper</button></form><p class="muted">Questions are selected from the matching subject bank. Review the draft before publishing.</p>`)}</div>
 ${box("Bulk result export",`${button("Download all exam results (CSV)","emExportResults()","secondary")} ${button("Download exam schedule (CSV)","emExportSchedules()","secondary")}`)}
 ${box("Scheduled examinations",table(["Exam","Subject","Date and time","Duration","Status"],schedules))}
 ${box("Recent exam attempts",table(["Student","Exam","Subject","Marks","Score","Submitted"],attemptRows))}`;
};
setUpForm("emScheduleForm",()=>{const e=exams().find(x=>x.id===value("emScheduleExam"));if(!e)return toast("Select an existing exam.");const s=read(K.schedules);s.push({id:uid(),examId:e.id,title:e.title,subject:e.subject,date:value("emScheduleDate"),time:value("emScheduleTime"),duration:+value("emScheduleDuration")||e.duration,status:"Scheduled",createdBy:me().username});write(K.schedules,s);addAudit("Scheduled exam "+e.title);notify("A new exam has been scheduled: "+e.title);go("adminExamTools")});
setUpForm("emPaperForm",()=>{const subject=value("emPaperSubject"),count=Math.max(1,Math.min(100,+value("emPaperCount")||10));const pool=[...read(K.questionBank),...exams().flatMap(e=>(e.questions||[]).map(q=>({...q,subject:e.subject})))].filter(q=>String(q.subject||"").toLowerCase()===subject.toLowerCase());if(!pool.length)return toast("No questions found for that subject.");const selected=pool.sort(()=>Math.random()-.5).slice(0,count);const a=exams();const draft={id:uid(),title:value("emPaperTitle"),subject,duration:60,questions:selected.map(q=>({type:q.type||"VSAQ",q:q.q,answer:q.answer||"",marks:+q.marks||1,options:q.options||[]})),published:false,approvalStatus:"Draft"};a.push(draft);write("studyly_exams",a);addAudit("Generated exam draft "+draft.title);toast("Draft exam generated. Open Exams to review it.");go("adminExamTools")});
window.emExportResults=function(){downloadCSV("studyly-exam-results.csv",[["Student","Assessment","Subject","Score","Total","Percent","Date"],...results().map(r=>[r.student,r.title,r.subject,r.score,r.total,r.percent,r.at])])};
window.emExportSchedules=function(){downloadCSV("studyly-exam-schedules.csv",[["Exam","Subject","Date","Time","Duration","Status"],...read(K.schedules).map(s=>[s.title,s.subject,s.date,s.time,s.duration,s.status])])};

/* ADMIN: attendance entry and student attendance summaries. */
views.adminAttendance=()=>{
 const roster=userRows(),subjects=[...new Set(exams().map(e=>e.subject).filter(Boolean))];
 const options=subjects.length?subjects:["General"];
 const rows=read(K.attendance).slice().reverse().slice(0,40).map(a=>`<tr><td>${safe(a.student)}</td><td>${safe(a.subject)}</td><td>${dateText(a.date)}</td><td>${safe(a.status)}</td><td>${safe(a.note||"")}</td></tr>`);
 return `${formCard("Record attendance","emAttendanceForm",[selectField("Student","emAttStudent",roster.map(u=>({value:u.username,label:u.username})).concat(roster.length?[]:[{value:"",label:"No registered students"}])),selectField("Subject","emAttSubject",options.map(x=>({value:x,label:x}))),field("Class date","emAttDate","date"),selectField("Status","emAttStatus",["Present","Absent","Late","Excused"].map(x=>({value:x,label:x}))),field("Note (optional)","emAttNote","text","",false)],"Save attendance")}
 ${box("Attendance records",table(["Student","Subject","Date","Status","Note"],rows))}`;
};
setUpForm("emAttendanceForm",()=>{const a=read(K.attendance);a.push({id:uid(),student:value("emAttStudent"),subject:value("emAttSubject"),date:value("emAttDate"),status:value("emAttStatus"),note:value("emAttNote"),markedBy:me().username});write(K.attendance,a);addAudit("Recorded attendance for "+value("emAttStudent"));notify("Attendance has been recorded for "+value("emAttStudent"),value("emAttStudent"));go("adminAttendance")});

/* ADMIN: assignment creation, review and feedback. */
views.adminAssignments=()=>{
 const subs=read(K.submissions),as=read(K.assignments);
 return `${formCard("Create assignment","emAssignmentForm",[field("Title","emAsTitle"),field("Subject","emAsSubject"),field("Due date","emAsDue","date"),`<label class="em-field">Instructions<textarea id="emAsInstructions" rows="3" required></textarea></label>`],"Publish assignment")}
 ${box("Assignments",table(["Title","Subject","Due date","Submissions"],as.map(a=>`<tr><td>${safe(a.title)}</td><td>${safe(a.subject)}</td><td>${dateText(a.due)}</td><td>${subs.filter(s=>s.assignmentId===a.id).length}</td></tr>`)))}
 ${box("Student submissions",table(["Student","Assignment","Submitted","Status","Action"],subs.map(s=>{const a=as.find(x=>x.id===s.assignmentId)||{};return `<tr><td>${safe(s.student)}</td><td>${safe(a.title||"Deleted assignment")}</td><td>${new Date(s.submittedAt).toLocaleString()}</td><td>${statusPill(s.status)}</td><td>${button("Review",`emReviewSubmission('${s.id}')`)}</td></tr>`})))}`;
};
setUpForm("emAssignmentForm",()=>{const a=read(K.assignments);a.push({id:uid(),title:value("emAsTitle"),subject:value("emAsSubject"),due:value("emAsDue"),instructions:value("emAsInstructions"),createdBy:me().username,createdAt:new Date().toISOString()});write(K.assignments,a);notify("New assignment published: "+value("emAsTitle"));addAudit("Published assignment "+value("emAsTitle"));go("adminAssignments")});
window.emReviewSubmission=function(idv){const s=read(K.submissions).find(x=>x.id===idv);if(!s)return;const a=read(K.assignments).find(x=>x.id===s.assignmentId)||{};openModal(`<h2>Review submission</h2><p><b>${safe(s.student)}</b> · ${safe(a.title||"Assignment")}</p><div class="em-answer">${safe(s.response)}</div><form id="emFeedbackForm" class="em-form"><label class="em-field">Feedback<textarea id="emFeedbackText" rows="3">${safe(s.feedback||"")}</textarea></label><label class="em-field">Marks (optional)<input id="emFeedbackMarks" type="number" min="0" max="100" value="${s.marks??""}"></label><button class="primary">Save review</button></form>`);setUpForm("emFeedbackForm",()=>{const all=read(K.submissions),x=all.find(t=>t.id===idv);x.feedback=value("emFeedbackText");x.marks=value("emFeedbackMarks")===""?null:+value("emFeedbackMarks");x.status="Reviewed";write(K.submissions,all);notify("Your assignment has been reviewed.",s.student);closeModal();go("adminAssignments")})};

/* ADMIN: evaluation review and re-evaluation requests. */
views.adminEvaluation=()=>{
 const requests=read(K.reeval),pending=requests.filter(r=>r.status==="Pending");
 const rows=requests.slice().reverse().map(r=>`<tr><td>${safe(r.student)}</td><td>${safe(r.title)}</td><td>${safe(r.reason)}</td><td>${statusPill(r.status)}</td><td>${button("Resolve",`emResolveRecheck('${r.id}')`)}</td></tr>`);
 const written=results().filter(r=>(r.answers||[]).some(a=>a.type==="SAQ"||a.type==="LAQ"));
 return `<div class="grid g3"><div class="card"><h3>Recheck requests</h3><div class="metric">${requests.length}</div></div><div class="card"><h3>Pending</h3><div class="metric">${pending.length}</div></div><div class="card"><h3>Written-answer attempts</h3><div class="metric">${written.length}</div></div></div><br>
 ${box("Re-evaluation requests",table(["Student","Assessment","Reason","Status","Action"],rows))}
 ${box("Written-answer review queue",written.map(r=>`<div class="em-answer"><b>${safe(r.student)} — ${safe(r.title)}</b><p>${safe(r.subject)} · ${r.percent}%</p>${button("Inspect answers",`emInspectWritten('${r.id}')`)}</div>`).join("")||empty("No written-answer attempts yet."))}`;
};
window.emResolveRecheck=function(idv){const r=read(K.reeval).find(x=>x.id===idv);if(!r)return;openModal(`<h2>Resolve re-evaluation</h2><p>${safe(r.student)} · ${safe(r.title)}</p><form id="emRecheckForm" class="em-form"><label class="em-field">Decision<select id="emRecheckDecision"><option>Approved</option><option>Rejected</option></select></label><label class="em-field">Response<textarea id="emRecheckResponse" rows="3" required></textarea></label><button class="primary">Save decision</button></form>`);setUpForm("emRecheckForm",()=>{const a=read(K.reeval),x=a.find(t=>t.id===idv);x.status=value("emRecheckDecision");x.response=value("emRecheckResponse");x.resolvedBy=me().username;write(K.reeval,a);notify("Your re-evaluation request was "+x.status.toLowerCase()+".",x.student);addAudit("Resolved re-evaluation request for "+x.student);closeModal();go("adminEvaluation")})};
window.emInspectWritten=function(idv){const r=results().find(x=>x.id===idv);if(!r)return;openModal(`<h2>Written answer inspection</h2><p>${safe(r.student)} · ${safe(r.title)}</p>${(r.answers||[]).map(a=>`<div class="em-answer"><b>${safe(a.question)}</b><p>${safe(a.answer)}</p><small>Current score: ${a.awarded}/${a.marks}</small></div>`).join("")}<p class="muted">This view supports inspection. Use a formal rubric and verified marking process before changing official grades.</p>`)};

/* STUDENT re-evaluation request button on existing results page, plus bookmark controls. */
const oldPerformance=views.performance;
views.performance=function(){
 let html=oldPerformance();
 if(me().role==="student"){
   const mine=results().filter(r=>r.student===currentStudent());
   const actions=mine.slice().reverse().map(r=>`<div class="em-check-row"><span>${safe(r.title)} · ${r.percent}%</span>${button("Request re-evaluation",`emRequestRecheck('${r.id}')`)}</div>`).join("");
   html+=box("Re-evaluation requests",actions||empty("No exam attempts available."));
 }
 return html;
};
window.emRequestRecheck=function(idv){const r=results().find(x=>x.id===idv&&x.student===currentStudent());if(!r)return;openModal(`<h2>Request re-evaluation</h2><p>${safe(r.title)}</p><form id="emRecheckRequestForm" class="em-form"><label class="em-field">Reason<textarea id="emRecheckReason" rows="4" required></textarea></label><button class="primary">Submit request</button></form>`);setUpForm("emRecheckRequestForm",()=>{const a=read(K.reeval);a.push({id:uid(),student:currentStudent(),resultId:idv,title:r.title,reason:value("emRecheckReason"),status:"Pending",createdAt:new Date().toISOString()});write(K.reeval,a);notify("A re-evaluation request was submitted.", "admin");closeModal();go("performance")})};

/* PRINCIPAL: approvals, institutional analytics, comparison, risk, audit and calendar. */
views.principalOversight=()=>{
 if(!isPrincipal())return empty("Principal access is required.");
 const ex=exams(),r=results(),att=read(K.attendance),approvals=read(K.approvals),requests=read(K.reeval);
 const pass=r.filter(x=>x.percent>=40).length,average=r.length?Math.round(r.reduce((a,x)=>a+x.percent,0)/r.length):0;
 const pending=approvals.filter(a=>a.status==="Pending");
 const bySubject={};r.forEach(x=>(bySubject[x.subject]??=[]).push(x.percent));
 const subjects=Object.entries(bySubject).map(([s,v])=>`<tr><td>${safe(s)}</td><td>${v.length}</td><td>${Math.round(v.reduce((a,b)=>a+b,0)/v.length)}%</td><td>${v.filter(x=>x>=40).length}</td></tr>`);
 const studentStats={};r.forEach(x=>{studentStats[x.student]??=[];studentStats[x.student].push(x.percent)});
 const risk=Object.entries(studentStats).filter(([n,v])=>v.length>=2&&v.reduce((a,b)=>a+b,0)/v.length<40);
 const calendar=read(K.calendar).slice().sort((a,b)=>a.date.localeCompare(b.date)).map(c=>`<tr><td>${dateText(c.date)}</td><td>${safe(c.title)}</td><td>${safe(c.type)}</td></tr>`);
 const approvalRows=pending.map(a=>`<tr><td>${safe(a.examTitle)}</td><td>${safe(a.subject)}</td><td>${safe(a.requestedBy)}</td><td>${statusPill(a.status)}</td><td>${button("Approve",`emApproveExam('${a.id}')`,"primary")} ${button("Reject",`emRejectExam('${a.id}')`)}</td></tr>`);
 const irregular=[...read(K.irregularities).map(i=>({...i,description:i.description||""})),...read("studyly_exam_integrity_flags").map(i=>({...i,description:i.details||i.description||"",status:i.status||"Recorded"}))].slice().reverse().map(i=>`<tr><td>${safe(i.student)}</td><td>${safe(i.exam)}</td><td>${safe(i.description)}</td><td>${statusPill(i.status)}</td></tr>`);
 return `<div class="grid g4"><div class="card"><h3>Students</h3><div class="metric">${userRows().length}</div></div><div class="card"><h3>Exams</h3><div class="metric">${ex.length}</div></div><div class="card"><h3>Result average</h3><div class="metric accent">${average}%</div></div><div class="card"><h3>Pass rate</h3><div class="metric">${r.length?Math.round(pass/r.length*100):0}%</div></div></div><br>
 ${box("Examination approval center",table(["Exam","Subject","Requested by","Status","Decision"],approvalRows))}
 ${box("Subject performance comparison",table(["Subject","Attempts","Average","Passing attempts"],subjects))}
 ${box("Academic risk indicators",`<p class="muted">Students with at least two recorded assessments and an average below 40% are flagged for review. This is an indicator, not an automated academic decision.</p>${risk.map(([n,v])=>`<div class="em-check-row"><b>${safe(n)}</b><span>Average ${Math.round(v.reduce((a,b)=>a+b,0)/v.length)}% · ${v.length} attempts</span></div>`).join("")||empty("No students currently meet this demo risk rule.")}`)}
 ${box("Attendance and eligibility overview",`<p>${att.length} attendance entries have been recorded. ${new Set(att.map(a=>a.student)).size} students have attendance records.</p>${button("Export institution report","emExportInstitutionReport()")}`)}
 ${box("Academic calendar",`${formCard("Add academic event","emCalendarForm",[field("Event title","emCalTitle"),field("Date","emCalDate","date"),selectField("Event type","emCalType",["Examination","Result publication","Re-evaluation","Academic deadline","Other"].map(x=>({value:x,label:x})))],"Add event")}${table(["Date","Event","Type"],calendar)}`)}
 ${box("Examination irregularity reports",`${formCard("Record an irregularity","emIrregularityForm",[field("Student name","emIrStudent"),field("Examination","emIrExam"),field("Description","emIrDescription")],"Record report")}${table(["Student","Exam","Description","Status"],irregular)}`)}
 ${box("Re-evaluation oversight",table(["Student","Assessment","Reason","Status"],requests.map(x=>`<tr><td>${safe(x.student)}</td><td>${safe(x.title)}</td><td>${safe(x.reason)}</td><td>${statusPill(x.status)}</td></tr>`)))}
 ${box("Faculty and examination activity",table(["Activity","User","Time"],read("studyly_activity").slice().reverse().slice(0,15).map(x=>`<tr><td>${safe(x.text)}</td><td>${safe(x.by||"")}</td><td>${new Date(x.at).toLocaleString()}</td></tr>`)))}
 ${box("Institutional reports",`${button("Download institution CSV report","emExportInstitutionReport()","primary")} ${button("Download exam irregularities","emExportIrregularities()")}`)}`;
};
window.emApproveExam=function(idv){const a=read(K.approvals),x=a.find(t=>t.id===idv);if(!x)return;x.status="Approved";x.decidedBy=me().username;x.decidedAt=new Date().toISOString();write(K.approvals,a);const es=exams(),e=es.find(t=>t.id===x.examId);if(e){e.approvalStatus="Approved";e.published=true;write("studyly_exams",es)}notify("Your examination was approved: "+x.examTitle,"admin");addAudit("Approved exam "+x.examTitle);go("principalOversight")};
window.emRejectExam=function(idv){const a=read(K.approvals),x=a.find(t=>t.id===idv);if(!x)return;x.status="Rejected";x.decidedBy=me().username;write(K.approvals,a);notify("Your examination approval request was rejected: "+x.examTitle,"admin");addAudit("Rejected exam "+x.examTitle);go("principalOversight")};
setUpForm("emCalendarForm",()=>{const a=read(K.calendar);a.push({id:uid(),title:value("emCalTitle"),date:value("emCalDate"),type:value("emCalType")});write(K.calendar,a);addAudit("Added academic calendar event "+value("emCalTitle"));go("principalOversight")});
setUpForm("emIrregularityForm",()=>{const a=read(K.irregularities);a.push({id:uid(),student:value("emIrStudent"),exam:value("emIrExam"),description:value("emIrDescription"),status:"Recorded",at:new Date().toISOString()});write(K.irregularities,a);addAudit("Recorded exam irregularity for "+value("emIrStudent"));go("principalOversight")});
window.emExportInstitutionReport=function(){downloadCSV("studyly-institution-report.csv",[["Student","Assessment","Subject","Score","Total","Percent","Date"],...results().map(x=>[x.student,x.title,x.subject,x.score,x.total,x.percent,x.at])])};
window.emExportIrregularities=function(){downloadCSV("studyly-exam-irregularities.csv",[["Student","Exam","Description","Status"],...read(K.irregularities).map(x=>[x.student,x.exam,x.description,x.status])])};

/* Exam approval submission for Admin. */
const oldAdminTools=views.adminExamTools;
views.adminExamTools=function(){
 let html=oldAdminTools();
 const pending=read(K.approvals).filter(a=>a.status==="Pending");
 const options=exams().map(e=>({value:e.id,label:e.title+" — "+e.subject}));
 html+=box("Submit an exam for Principal approval",`<form id="emApprovalForm" class="em-form">${selectField("Draft exam","emApprovalExam",options.length?options:[{value:"",label:"No exams created"}])}<button class="primary">Request approval</button></form><p class="muted">${pending.length} approval requests currently pending.</p>`);
 return html;
};
setUpForm("emApprovalForm",()=>{const e=exams().find(x=>x.id===value("emApprovalExam"));if(!e)return toast("Select an exam.");const a=read(K.approvals);if(a.some(x=>x.examId===e.id&&x.status==="Pending"))return toast("This exam is already awaiting approval.");a.push({id:uid(),examId:e.id,examTitle:e.title,subject:e.subject,requestedBy:me().username,status:"Pending",requestedAt:new Date().toISOString()});write(K.approvals,a);e.approvalStatus="Pending";write("studyly_exams",exams());notify("An examination is awaiting Principal approval: "+e.title,"principal");addAudit("Requested Principal approval for "+e.title);go("adminExamTools")});

/* Notifications and admin broadcast center are integrated into exam operations. */
const oldAdminAttendance=views.adminAttendance;
views.adminAttendance=function(){return oldAdminAttendance()+box("Exam notice center",`${formCard("Publish an examination notice","emNoticeForm",[field("Notice text","emNoticeText"),selectField("Audience","emNoticeAudience",[{value:"all",label:"All students"},{value:"admin",label:"Admin / Faculty"},{value:"principal",label:"Principal"}])],"Publish notice")}`)};
setUpForm("emNoticeForm",()=>{makeNotice(value("emNoticeText"),value("emNoticeAudience"));go("adminAttendance")});

/* Add bookmarks to exam questions for students without altering existing exam records. */
const oldStudentCenter=views.studentExamCenter;
views.studentExamCenter=function(){
 let html=oldStudentCenter();
 const myResults=results().filter(r=>r.student===currentStudent());
 const weakSubjects=[...new Set(myResults.filter(r=>r.percent<60).map(r=>r.subject))];
 const recommendations=exams().filter(e=>e.published&&(!weakSubjects.length||weakSubjects.includes(e.subject))).slice(0,4);
 html+=box("Recommended practice",recommendations.map(e=>`<div class="em-check-row"><span><b>${safe(e.subject)}</b> — ${safe(e.title)}</span>${button("Practice",`takeExam('${e.id}')`,"primary")}</div>`).join("")||empty("Complete an assessment to receive subject-based practice suggestions."));
 const qs=exams().filter(e=>e.published).flatMap(e=>(e.questions||[]).map((q,qIndex)=>({examId:e.id,exam:e.title,subject:e.subject,q:q.q,qIndex})));
 html+=box("Bookmark questions for revision",qs.slice(0,40).map((q,i)=>button("Save: "+safe(q.q.slice(0,90)),`emBookmarkQuestion('${q.examId}',${q.qIndex})`)).join("<br>")||empty("No published questions available."));
 html+=box("Saved questions",read(K.bookmarks).filter(b=>b.student===currentStudent()).map(b=>`<div class="em-answer"><b>${safe(b.subject)} — ${safe(b.question)}</b>${button("Remove",`emRemoveBookmark('${b.id}')`)}</div>`).join("")||empty("No bookmarked questions yet."));
 return html;
};
window.emBookmarkQuestion=function(examId,index){const e=exams().find(x=>x.id===examId);if(!e)return;const q=e.questions[index];if(!q)return;const a=read(K.bookmarks);if(a.some(x=>x.student===currentStudent()&&x.question===q.q))return toast("Already bookmarked.");a.push({id:uid(),student:currentStudent(),subject:e.subject,question:q.q,answer:q.answer||"",exam:e.title});write(K.bookmarks,a);toast("Question bookmarked.");go("studentExamCenter")};
window.emRemoveBookmark=idv=>{write(K.bookmarks,read(K.bookmarks).filter(x=>x.id!==idv));go("studentExamCenter")};

/* Refresh the selected page after route rendering so inline handlers are attached to the current forms. */
const originalGo=window.go;
if(typeof originalGo==="function"){
 window.go=function(p){originalGo(p);};
}

/* Hook form setup after DOM insertion using a short microtask after every route change.
   Existing go remains authoritative and background rendering is untouched. */
const routeObserver=new MutationObserver(()=>{
 const c=document.getElementById("content");if(!c)return;
 
 const forms={
  studentSyllabus:()=>setUpForm("emSyllabusForm",()=>{const a=read(K.syllabus);a.push({id:uid(),student:currentStudent(),subject:value("emSylSubject"),topic:value("emSylTopic"),done:false});write(K.syllabus,a);go("studentSyllabus")}),
  studentRevision:()=>setUpForm("emRevisionForm",()=>{const a=read(K.revision);a.push({id:uid(),student:currentStudent(),subject:value("emRevSubject"),topic:value("emRevTopic"),date:value("emRevDate"),done:false});write(K.revision,a);go("studentRevision")}),
  adminQuestionBank:()=>setUpForm("emQuestionForm",()=>{const a=read(K.questionBank);a.push({id:uid(),subject:value("emQSubject"),type:value("emQType"),q:value("emQText"),answer:value("emQAnswer"),marks:+value("emQMarks")||1,difficulty:value("emQDifficulty"),source:"Manual entry"});write(K.questionBank,a);addAudit("Added question to reusable question bank");go("adminQuestionBank")}),
  adminExamTools:()=>{
   setUpForm("emScheduleForm",()=>{const e=exams().find(x=>x.id===value("emScheduleExam"));if(!e)return toast("Select an existing exam.");const s=read(K.schedules);s.push({id:uid(),examId:e.id,title:e.title,subject:e.subject,date:value("emScheduleDate"),time:value("emScheduleTime"),duration:+value("emScheduleDuration")||e.duration,status:"Scheduled",createdBy:me().username});write(K.schedules,s);addAudit("Scheduled exam "+e.title);notify("A new exam has been scheduled: "+e.title);go("adminExamTools")});
   setUpForm("emPaperForm",()=>{const subject=value("emPaperSubject"),count=Math.max(1,Math.min(100,+value("emPaperCount")||10));const pool=[...read(K.questionBank),...exams().flatMap(e=>(e.questions||[]).map(q=>({...q,subject:e.subject})))].filter(q=>String(q.subject||"").toLowerCase()===subject.toLowerCase());if(!pool.length)return toast("No questions found for that subject.");const selected=pool.slice().sort(()=>Math.random()-.5).slice(0,count);const a=exams();const draft={id:uid(),title:value("emPaperTitle"),subject,duration:60,questions:selected.map(q=>({type:q.type||"VSAQ",q:q.q,answer:q.answer||"",marks:+q.marks||1,options:q.options||[]})),published:false,approvalStatus:"Draft"};a.push(draft);write("studyly_exams",a);addAudit("Generated exam draft "+draft.title);toast("Draft exam generated. Open Exams to review it.");go("adminExamTools")});
   setUpForm("emApprovalForm",()=>{const e=exams().find(x=>x.id===value("emApprovalExam"));if(!e)return toast("Select an exam.");const a=read(K.approvals);if(a.some(x=>x.examId===e.id&&x.status==="Pending"))return toast("This exam is already awaiting approval.");a.push({id:uid(),examId:e.id,examTitle:e.title,subject:e.subject,requestedBy:me().username,status:"Pending",requestedAt:new Date().toISOString()});write(K.approvals,a);e.approvalStatus="Pending";const es=exams();const saved=es.find(x=>x.id===e.id);if(saved)saved.approvalStatus="Pending";write("studyly_exams",es);notify("An examination is awaiting Principal approval: "+e.title,"principal");addAudit("Requested Principal approval for "+e.title);go("adminExamTools")});
  },
  adminAttendance:()=>{
   setUpForm("emAttendanceForm",()=>{const a=read(K.attendance);a.push({id:uid(),student:value("emAttStudent"),subject:value("emAttSubject"),date:value("emAttDate"),status:value("emAttStatus"),note:value("emAttNote"),markedBy:me().username});write(K.attendance,a);addAudit("Recorded attendance");notify("Attendance record updated.","all");go("adminAttendance")});
   setUpForm("emNoticeForm",()=>{makeNotice(value("emNoticeText"),value("emNoticeAudience"));go("adminAttendance")});
  },
  adminAssignments:()=>setUpForm("emAssignmentForm",()=>{const a=read(K.assignments);a.push({id:uid(),title:value("emAsTitle"),subject:value("emAsSubject"),due:value("emAsDue"),instructions:value("emAsInstructions"),createdBy:me().username});write(K.assignments,a);notify("New assignment published: "+value("emAsTitle"));addAudit("Published assignment "+value("emAsTitle"));go("adminAssignments")}),
  principalOversight:()=>{setUpForm("emCalendarForm",()=>{const a=read(K.calendar);a.push({id:uid(),title:value("emCalTitle"),date:value("emCalDate"),type:value("emCalType")});write(K.calendar,a);go("principalOversight")});setUpForm("emIrregularityForm",()=>{const a=read(K.irregularities);a.push({id:uid(),student:value("emIrStudent"),exam:value("emIrExam"),description:value("emIrDescription"),status:"Recorded"});write(K.irregularities,a);go("principalOversight")})},
  studentAssistant:()=>setUpForm("emAssistantForm",()=>{const query=value("emAssistantQuestion").toLowerCase();const hits=exams().flatMap(e=>(e.questions||[]).filter(q=>(e.subject+" "+q.q+" "+(q.answer||"")).toLowerCase().includes(query)||query.split(/\s+/).some(w=>w.length>3&&(q.q+" "+(q.answer||"")+" "+e.subject).toLowerCase().includes(w))).map(q=>({subject:e.subject,q:q.q,answer:q.answer}))).slice(0,5);const target=document.getElementById("emAssistantAnswer");if(target)target.innerHTML=hits.length?hits.map(h=>`<div class="em-answer"><b>${safe(h.subject)}: ${safe(h.q)}</b><p>${safe(h.answer||"No model answer stored.")}</p></div>`).join(""):"<p>No matching saved question found. Try a subject or shorter keyword.</p>"})
 };
 if(forms[page])forms[page]();
});
const content=document.getElementById("content");if(content)routeObserver.observe(content,{childList:true,subtree:true});
})();


/* Additional exam-integrity monitoring: staff-recorded incidents, not automated proctoring. */
(function(){
 const baseAdmin=views.adminExamTools;
 views.adminExamTools=function(){
   const html=baseAdmin();
   const reports=read("studyly_exam_integrity_flags").slice().reverse();
   const ex=exams();
   return html+
   `<section class="card em-card"><div class="section-head"><h3>Exam integrity monitoring</h3></div>
    <p class="muted">Record incidents observed during supervised examinations. This is a manual reporting tool, not automated proctoring.</p>
    <form id="emIntegrityForm" class="em-form">
      <label class="em-field">Student name<input id="emIntegrityStudent" required></label>
      <label class="em-field">Examination<select id="emIntegrityExam">${ex.map(e=>`<option value="${safe(e.title)}">${safe(e.title)}</option>`).join("")}</select></label>
      <label class="em-field">Incident type<select id="emIntegrityType"><option>Suspicious activity</option><option>Identity verification concern</option><option>Unauthorized material</option><option>Technical interruption</option><option>Other</option></select></label>
      <label class="em-field">Details<textarea id="emIntegrityDetails" rows="3" required></textarea></label>
      <button class="primary">Record incident</button>
    </form>
    ${table(["Student","Exam","Incident","Details","Date"],reports.map(x=>`<tr><td>${safe(x.student)}</td><td>${safe(x.exam)}</td><td>${safe(x.type)}</td><td>${safe(x.details)}</td><td>${new Date(x.at).toLocaleString()}</td></tr>`))}
   </section>`;
 };
 const observer=new MutationObserver(()=>{
   const f=document.getElementById("emIntegrityForm");if(!f||f.dataset.bound)return;f.dataset.bound="1";
   f.onsubmit=e=>{e.preventDefault();const a=read("studyly_exam_integrity_flags");a.push({id:Date.now().toString(36),student:document.getElementById("emIntegrityStudent").value.trim(),exam:document.getElementById("emIntegrityExam").value,type:document.getElementById("emIntegrityType").value,details:document.getElementById("emIntegrityDetails").value.trim(),at:new Date().toISOString(),reportedBy:session.username});write("studyly_exam_integrity_flags",a);activity("Recorded exam integrity incident");go("adminExamTools")};
 });
 const c=document.getElementById("content");if(c)observer.observe(c,{childList:true,subtree:true});
})();
