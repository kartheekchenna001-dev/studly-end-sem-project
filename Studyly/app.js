const STORE={
 users:"studyly_users", exams:"studyly_exams", quizzes:"studyly_quizzes",
 results:"studyly_results", submissions:"studyly_submissions", planner:"studyly_planner",
 activity:"studyly_activity", videos:"studyly_videos_meta", learningNotes:"studyly_learning_notes", autoDaily:"studyly_auto_daily"
};
const get=k=>JSON.parse(localStorage.getItem(k)||"[]");
const set=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const id=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const toast=s=>{const t=document.getElementById("toast");t.textContent=s;t.style.cssText="position:fixed;right:18px;bottom:18px;padding:12px 16px;border-radius:10px;background:#11182b;border:1px solid #43e8ff55;z-index:99";setTimeout(()=>t.style.cssText="",2600)};
const openModal=html=>{document.getElementById("modalContent").innerHTML=html;document.getElementById("modal").classList.remove("hidden")};
const closeModal=()=>{if(typeof stopRetroSession==="function"&&gameRuntime)stopRetroSession();document.getElementById("modal").classList.add("hidden")};
document.getElementById("closeModal").onclick=closeModal;
let role="student", session={username:"Student",role:"student"}, page="dashboard";

// Local demo authentication. For production, move authentication and role provisioning to a trusted server.
const AUTH_STORE="studyly_auth_accounts";
const authAccounts=()=>JSON.parse(localStorage.getItem(AUTH_STORE)||"[]");
const saveAuthAccounts=accounts=>localStorage.setItem(AUTH_STORE,JSON.stringify(accounts));
const normalizeEmail=email=>String(email||"").trim().toLowerCase();
async function passwordDigest(password){
 const bytes=new TextEncoder().encode(String(password));
 const digest=await crypto.subtle.digest("SHA-256",bytes);
 return Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,"0")).join("");
}
function authMessage(message){toast(message);}
function showAuthView(view){
 const loginView=document.getElementById("authLoginView"),registerView=document.getElementById("authRegisterView");
 loginView?.classList.toggle("hidden",view!=="login");registerView?.classList.toggle("hidden",view!=="register");
 document.getElementById("showLoginTab")?.classList.toggle("active",view==="login");
 document.getElementById("showRegisterTab")?.classList.toggle("active",view==="register");
}
function togglePassword(id,button){const input=document.getElementById(id);if(!input)return;const reveal=input.type==="password";input.type=reveal?"text":"password";button.textContent=reveal?"Hide":"Show";}
async function registerStudent(){
 const name=document.getElementById("registerName").value.trim();
 const email=normalizeEmail(document.getElementById("registerEmail").value);
 const password=document.getElementById("registerPassword").value;
 const confirm=document.getElementById("registerConfirm").value;
 if(name.length<2)return authMessage("Please enter your full name.");
 if(password.length<8)return authMessage("Password must contain at least 8 characters.");
 if(password!==confirm)return authMessage("Passwords do not match.");
 const accounts=authAccounts();if(accounts.some(a=>a.email===email))return authMessage("An account with this email already exists.");
 accounts.push({id:id(),name,email,passwordHash:await passwordDigest(password),role:"student",createdAt:new Date().toISOString()});saveAuthAccounts(accounts);
 const users=get(STORE.users);if(!users.some(u=>normalizeEmail(u.email)===email)){users.push({id:id(),username:name,email,role:"student"});set(STORE.users,users);}
 document.getElementById("loginEmail").value=email;document.getElementById("loginPassword").value="";document.getElementById("registerPassword").value="";document.getElementById("registerConfirm").value="";
 showAuthView("login");authMessage("Student account created. Please sign in.");
}
async function login(){
 const email=normalizeEmail(document.getElementById("loginEmail").value),password=document.getElementById("loginPassword").value;
 if(!email||!password)return authMessage("Enter your email and password.");
 const account=authAccounts().find(a=>a.email===email);
 if(!account)return authMessage("No account found for this email. Create a student account first.");
 if(account.passwordHash!==await passwordDigest(password))return authMessage("Incorrect email or password.");
 // Role keywords are checked only after the registered account password is verified.
 // This is a local project-demo mechanism, not secure role-based authentication.
 const credential=password.toLowerCase();
 let accessRole=account.role==="principal"||account.role==="admin"?account.role:"student";
 if(credential.includes("principal")||credential.includes("principle")) accessRole="principal";
 else if(credential.includes("admin")) accessRole="admin";
 session={username:account.name,role:accessRole,email:account.email};
 sessionStorage.setItem("studyly_session",JSON.stringify(session));showApp();
}
function logout(){
 sessionStorage.removeItem("studyly_session");
 session={username:"Student",role:"student"};
 document.getElementById("appScreen").classList.add("hidden");
 document.getElementById("loginScreen").classList.remove("hidden");
 document.body.classList.remove("nav-open");
}
function navItems(){
 if(session.role==="student")return [
 ["dashboard","⌂","Dashboard"],["exams","📝","Exams"],["studentExamCenter","","Exam Center"],["studentAttendance","","My Attendance"],["studentAssignments","","Assignments"],["studentSyllabus","","Syllabus Tracker"],["studentRevision","","Revision Planner"],["studentAssistant","","Study Assistant"],["studentNotifications","","Notifications"],["quizzes","🤖","AI Quizzes"],["games","🎮","Games"],["videos","🎬","Videos"],
 ["materials","📚","Notes & Papers"],["planner","📅","Study Planner"],["performance","📈","My Performance"]];
 return [
 ["dashboard","⌂","Dashboard"],["exams","📝","Exams"],["adminExamTools","","Exam Operations"],["adminAttendance","","Attendance"],["adminAssignments","","Assignments"],["adminEvaluation","","Evaluation & Recheck"],["adminQuestionBank","","Question Bank"],["ai","📷","AI Quiz Generator"],
 ["review","🧠","AI Review Queue"],["studentManagement","👩‍🎓","Student Management"],["games","🎮","Games"],["videos","🎬","Videos"],["materials","📚","Notes & Papers"],["planner","📅","Study Planner"],["performance","📊","Performance"],
 ...(session.role==="principal"?[[ "principalOversight","","Principal Oversight"],[ "users","👥","Users"],["activity","⚡","Activity"],["reports","📊","Principal Reports"]]:[])
 ];
}
function renderNav(){
 document.getElementById("nav").innerHTML=navItems().map(([idv,icon,label])=>
   `<button type="button" aria-current="${page===idv?"page":"false"}" class="${page===idv?"active":""}" onclick="go('${idv}')"><span class="nav-mark" aria-hidden="true"></span><span>${label}</span></button>`).join("");
}
function showApp(){
 document.getElementById("loginScreen")?.classList.add("hidden");
 document.getElementById("appScreen").classList.remove("hidden");
 document.getElementById("roleText").textContent=session.role==="principal"?"Principal":session.role==="admin"?"Admin / Faculty":"Student";
 document.getElementById("profileName").textContent=session.username;
 document.getElementById("profileRole").textContent=session.role.toUpperCase();
 document.getElementById("avatar").textContent=session.username.slice(0,1).toUpperCase();
 const pn=document.getElementById("profileNameInput"), ms=document.getElementById("modeSwitch");
 if(pn)pn.value=session.username; if(ms)ms.value=session.role;
 renderNav();go("dashboard");
}
function go(p){ensureDailyAutoQuizzes();page=p;renderNav();const titles={
 dashboard:["Dashboard","Studyly command center"],exams:[session.role==="student"?"Exams":"Exam Planner",session.role==="student"?"Take your published exams":"Create exams and manage question banks"],
 quizzes:["AI Quizzes","Approved AI-generated quizzes"],games:["Games","Play 100 progressive levels"],videos:["Videos","Admin and Principal learning videos"],ai:["AI Quiz Generator","Create drafts from pictures"],
 review:["AI Review Queue","Inspect, remodel, approve or reject AI questions"],
 materials:["Notes & Research Papers","Submit, review and publish study material"],
 planner:["Study Planner","Track your study tasks"],performance:["Performance Analytics","Student and subject performance"],
 users:["Users","Principal access to users"],activity:["Activity","System-wide activity"],reports:["Principal Reports","Institution-wide student rankings and performance"],
 studentManagement:["Student Management","Manage student names, marks and pass/fail results"],
 studentExamCenter:["Exam Center","Upcoming examinations, mock practice and exam history"],
 studentAttendance:["My Attendance","Review your recorded attendance and examination eligibility"],
 studentAssignments:["Assignments","View deadlines and submit your academic work"],
 studentSyllabus:["Syllabus Tracker","Track topics completed and topics to revise"],
 studentRevision:["Revision Planner","Build a focused revision checklist from your subjects"],
 studentAssistant:["Study Assistant","Get study guidance from your saved subjects and materials"],
 studentNotifications:["Notifications","Examination notices, deadlines and academic updates"],
 adminExamTools:["Exam Operations","Schedule examinations, generate papers and monitor attempts"],
 adminAttendance:["Attendance Management","Record attendance and review eligibility"],
 adminAssignments:["Assignment Management","Create assignments and review student submissions"],
 adminEvaluation:["Evaluation & Recheck","Review written answers and manage re-evaluation requests"],
 adminQuestionBank:["Question Bank","Organize reusable questions and import question sets"],
 principalOversight:["Principal Oversight","Institution-wide examination approvals, analytics and academic risk"]
 };document.getElementById("pageTitle").textContent=titles[p][0];document.getElementById("pageSubtitle").textContent=titles[p][1];document.getElementById("content").innerHTML=views[p]();if(p==="studentManagement"&&typeof window.renderReactStudentManagement==="function"){window.renderReactStudentManagement(document.getElementById("reactStudentManagementRoot"),session.role);}}
function avg(rows){return rows.length?Math.round(rows.reduce((a,b)=>a+b.percent,0)/rows.length):0}
const views={};

views.dashboard=()=>{
 const users=get(STORE.users),ex=get(STORE.exams),qu=get(STORE.quizzes),r=get(STORE.results),s=get(STORE.submissions);
 if(session.role==="student")return `<div class="hero"><h2>Welcome back, ${esc(session.username)} 👋</h2><p class="muted">Study, practice and track your progress.</p></div><br><div class="grid g4">
 <div class="card"><h3>Published Exams</h3><div class="metric">${ex.filter(x=>x.published).length}</div></div>
 <div class="card"><h3>AI Quizzes</h3><div class="metric">${qu.filter(x=>x.status==="published").length}</div></div>
 <div class="card"><h3>My Attempts</h3><div class="metric">${r.filter(x=>x.student===session.username).length}</div></div>
 <div class="card"><h3>Average</h3><div class="metric accent">${avg(r.filter(x=>x.student===session.username))}%</div></div>
 </div><br>${studentQuizCards()}`;
 return `<div class="hero"><h2>${session.role==="principal"?"👑 Principal Command Center":"Admin Control Center"}</h2><p class="muted">Monitor content, approvals, exams, AI quizzes and student performance.</p></div><br>
 <div class="grid g4"><div class="card"><h3>Students</h3><div class="metric">${users.length}</div></div><div class="card"><h3>Exams</h3><div class="metric">${ex.length}</div></div><div class="card"><h3>AI Quizzes</h3><div class="metric">${qu.length}</div></div><div class="card"><h3>Pending</h3><div class="metric yellow">${qu.filter(x=>x.status==="pending").length+s.filter(x=>x.status==="pending").length}</div></div></div><br>
 <div class="grid g2"><div class="card"><h3>Overall Average</h3><div class="metric accent">${avg(r)}%</div><div class="bar"><i style="width:${avg(r)}%"></i></div></div><div class="card"><h3>System</h3><p class="green">● Operational</p><p class="muted">AI review, material publishing and performance analytics are active.</p></div></div>`;
};

function studentQuizCards(){
 const qs=get(STORE.quizzes).filter(x=>x.status==="published").slice(-4).reverse();
 return `<div class="card"><div class="section-head"><h2>Latest AI Quizzes</h2><button class="secondary" onclick="go('quizzes')">View all</button></div>
 ${qs.length?qs.map(q=>`<div class="task"><div><b>${esc(q.title)}</b><br><small class="muted">${esc(q.subject)} · ${q.questions.length} questions</small></div><button class="primary" onclick="takeQuiz('${q.id}')">Start</button></div>`).join(""):'<div class="empty">No published quizzes yet.</div>'}</div>`;
}

views.exams=()=>session.role==="student"?`
<div class="hero"><h2>📝 Available Exams</h2><p class="muted">Choose a published exam. Your timer starts when you begin.</p></div><br>
<div class="grid g2">${get(STORE.exams).filter(x=>x.published).map(x=>`<div class="card"><h3>${esc(x.title)}</h3><p class="muted">${esc(x.subject)} · ${x.questions.length} questions · ${x.duration} min · ${x.totalMarks??x.questions.reduce((a,q)=>a+(+q.marks||1),0)} marks</p><button class="primary" onclick="takeExam('${x.id}')">Start Exam</button></div>`).join("")||'<div class="empty">No published exams.</div>'}</div>`
:`<div class="hero"><h2>📝 Exam Planner & Question Bank</h2><p class="muted">Create exams, build question banks by type, set marks and duration, then publish when ready.</p></div>
<div class="grid g3">
 <div class="card"><small class="muted">TOTAL EXAMS</small><div class="metric">${get(STORE.exams).length}</div></div>
 <div class="card"><small class="muted">PUBLISHED</small><div class="metric">${get(STORE.exams).filter(x=>x.published).length}</div></div>
 <div class="card"><small class="muted">QUESTION BANK</small><div class="metric">${get(STORE.exams).reduce((n,x)=>n+x.questions.length,0)}</div></div>
</div><br>
<div class="section-head"><h2>Manage Exams</h2><button class="primary" onclick="newExam()">＋ Create Exam</button></div>
<div class="grid g2">${get(STORE.exams).map(x=>{const marks=x.questions.reduce((n,q)=>n+(+q.marks||1),0);return `<div class="card"><div class="section-head"><div><h3>${esc(x.title)}</h3><small class="muted">${esc(x.subject)}</small></div><span class="badge ${x.published?"success":"pending"}">${x.published?"Published":"Draft"}</span></div><div class="grid g3"><div><b>${x.questions.length}</b><small class="muted">Questions</small></div><div><b>${marks}</b><small class="muted">Total marks</small></div><div><b>${x.duration}m</b><small class="muted">Duration</small></div></div><br><div class="actions"><button class="primary" onclick="editExam('${x.id}')">Manage Question Bank</button><button class="secondary" onclick="toggleExamPublish('${x.id}')">${x.published?"Unpublish":"Publish"}</button><button class="danger" onclick="deleteExam('${x.id}')">Delete</button></div></div>`}).join("")||'<div class="empty">No exams created yet.</div>'}</div>`;

function newExam(){
 openModal(`<h2>Create Exam</h2><form id="examForm" class="stack"><label>Exam title</label><input id="et" required placeholder="e.g. Data Structures Midterm"><label>Subject</label><input id="es" required placeholder="Subject"><label>Custom duration (minutes)</label><input id="ed" type="number" min="1" max="600" value="30" required><button class="primary">Create Exam & Open Question Bank</button></form>`);
 document.getElementById("examForm").onsubmit=e=>{e.preventDefault();const a=get(STORE.exams),x={id:id(),title:document.getElementById("et").value.trim(),subject:document.getElementById("es").value.trim(),duration:+document.getElementById("ed").value,questions:[],published:false};a.push(x);set(STORE.exams,a);activity("Created exam "+x.title);closeModal();editExam(x.id)};
}
function editExam(i){
 const a=get(STORE.exams),x=a.find(q=>q.id===i);if(!x)return;
 const qs=x.questions||[],marks=qs.reduce((n,q)=>n+(+q.marks||1),0);
 openModal(`<div class="section-head"><div><h2>${esc(x.title)}</h2><p class="muted">${esc(x.subject)} · ${x.duration} minutes</p></div><button class="secondary" onclick="closeModal()">Close</button></div>
 <div class="grid g3"><div class="card"><b>${qs.length}</b><small class="muted">Total questions</small></div><div class="card"><b>${marks}</b><small class="muted">Total marks</small></div><div class="card"><b>${qs.filter(q=>q.type==="MCQ").length}</b><small class="muted">MCQs</small></div></div>
 <form id="examDetailsForm"><div class="grid g3"><div><label>Exam title</label><input id="editExamTitle" value="${esc(x.title)}" required></div><div><label>Subject</label><input id="editExamSubject" value="${esc(x.subject)}" required></div><div><label>Duration (minutes)</label><input id="editExamDuration" type="number" min="1" max="600" value="${x.duration}" required></div></div><button class="secondary">Save Exam Details</button></form>
 <form id="questionForm"><h3>Add question</h3><label>Question type</label><select id="qType"><option>MCQ</option><option>VSAQ</option><option>SAQ</option><option>LAQ</option></select><label>Question</label><textarea id="qText" required rows="3" placeholder="Enter question"></textarea><div id="mcqOptions"><label>Option A</label><input id="optA" placeholder="Option A"><label>Option B</label><input id="optB" placeholder="Option B"><label>Option C</label><input id="optC" placeholder="Option C"><label>Option D</label><input id="optD" placeholder="Option D"></div><label>Correct answer / model answer</label><textarea id="qAnswer" rows="2" placeholder="Correct option text or model answer"></textarea><label>Marks</label><input id="qMarks" type="number" min="1" value="1" required><button class="primary">＋ Add to Question Bank</button></form>
 <hr><div class="section-head"><h3>Question Bank (${qs.length})</h3><button class="danger" onclick="clearExamQuestions('${i}')">Clear Question Bank</button></div>
 ${qs.map((q,n)=>`<div class="task"><div style="min-width:0;flex:1"><b>${n+1}. [${esc(q.type)} · ${+q.marks||1} marks]</b><br>${esc(q.q)}<br><small class="muted">${q.type==="MCQ"?(q.options||[]).map(esc).join(" · "):"Model answer: "+esc(q.answer||"Not set")}</small></div><button class="danger" onclick="deleteExamQuestion('${i}','${q.id}')">Delete</button></div>`).join("")||'<div class="empty">No questions added yet.</div>'}
 <div class="actions"><button class="success" onclick="publishExam('${i}')">Publish Exam</button></div>`);
 document.getElementById("examDetailsForm").onsubmit=e=>{e.preventDefault();const list=get(STORE.exams),exam=list.find(z=>z.id===i);exam.title=document.getElementById("editExamTitle").value.trim();exam.subject=document.getElementById("editExamSubject").value.trim();exam.duration=+document.getElementById("editExamDuration").value||30;exam.published=false;set(STORE.exams,list);editExam(i)};
 const type=document.getElementById("qType"),opts=document.getElementById("mcqOptions");type.onchange=()=>opts.style.display=type.value==="MCQ"?"block":"none";opts.style.display="block";
 document.getElementById("questionForm").onsubmit=e=>{e.preventDefault();const type=document.getElementById("qType").value;const options=["optA","optB","optC","optD"].map(k=>document.getElementById(k).value.trim()).filter(Boolean);if(type==="MCQ"&&options.length<2)return toast("Enter at least two MCQ options.");const question={id:id(),type,q:document.getElementById("qText").value.trim(),answer:document.getElementById("qAnswer").value.trim(),marks:+document.getElementById("qMarks").value||1,options};const list=get(STORE.exams),exam=list.find(z=>z.id===i);exam.questions.push(question);exam.published=false;set(STORE.exams,list);editExam(i)};
}
function updateExamDuration(i){const v=prompt("Enter exam duration in minutes:");if(v===null)return;const n=Number(v);if(!Number.isInteger(n)||n<1||n>600)return toast("Enter a duration from 1 to 600 minutes.");const a=get(STORE.exams),x=a.find(q=>q.id===i);x.duration=n;set(STORE.exams,a);editExam(i)}
function deleteExamQuestion(i,qid){const a=get(STORE.exams),x=a.find(q=>q.id===i);x.questions=x.questions.filter(q=>q.id!==qid);set(STORE.exams,a);editExam(i)}
function clearExamQuestions(i){if(!confirm("Clear every question from this exam?"))return;const a=get(STORE.exams),x=a.find(q=>q.id===i);x.questions=[];x.published=false;set(STORE.exams,a);editExam(i)}
function toggleExamPublish(i){const a=get(STORE.exams),x=a.find(q=>q.id===i);x.published=!x.published;set(STORE.exams,a);go("exams")}
function deleteExam(i){if(!confirm("Delete this exam and its question bank?"))return;set(STORE.exams,get(STORE.exams).filter(q=>q.id!==i));go("exams")}
function publishExam(i){const a=get(STORE.exams),x=a.find(q=>q.id===i);if(!x.questions.length)return toast("Add at least one question before publishing.");x.totalMarks=x.questions.reduce((n,q)=>n+(+q.marks||1),0);x.published=true;set(STORE.exams,a);activity("Published exam "+x.title);closeModal();go("exams")}

views.ai=()=>{
 if(session.role==="student")return `<div class="empty">AI Quiz Generator is available to Admin/Faculty.</div>`;
 return `<div class="hero"><h2>📷 AI Quiz Generator</h2><p class="muted">Upload a photo of notes/textbook material. OCR extracts the page and creates a reviewable quiz draft. It is never published automatically.</p></div><br>
 <div class="grid g2"><div class="card"><form id="aiForm"><input id="aiExam" required placeholder="Exam name"><input id="aiSubject" required placeholder="Subject"><input id="aiTopic" placeholder="Topic"><select id="aiDifficulty"><option>Easy</option><option selected>Medium</option><option>Hard</option></select><select id="aiCount"><option>5</option><option selected>10</option><option>15</option><option>20</option></select>
 <div class="dropzone">📸 Upload page / notes<input id="aiFile" required type="file" accept="image/*"><img id="aiPreview" class="preview hidden"></div><button class="primary">Generate Draft</button></form></div>
 <div class="card"><h3>Workflow</h3><div class="task">📷 Image → OCR</div><div class="task">🤖 Generate questions</div><div class="task">🧠 Admin review</div><div class="task">✏️ Remodel / alternate</div><div class="task">✅ Approve</div><div class="task">📢 Publish to students</div><p class="muted">For real LLM generation, connect this UI to a secure backend/API. Do not expose secret API keys in frontend code.</p></div></div>`;
};

document.addEventListener("change",e=>{
 if(e.target.id==="aiFile"&&e.target.files[0]){const img=document.getElementById("aiPreview");img.src=URL.createObjectURL(e.target.files[0]);img.classList.remove("hidden")}
});

document.addEventListener("submit",async e=>{
 if(e.target.id!=="aiForm")return;
 e.preventDefault();
 const f=document.getElementById("aiFile").files[0];
 toast("Reading the picture…");
 let text="";
 try{const r=await Tesseract.recognize(f,"eng");text=r.data.text||""}catch(_){}
 const words=(text.match(/[A-Za-z][A-Za-z0-9-]{3,}/g)||[]).slice(0,80);
 const n=+document.getElementById("aiCount").value;
 const topic=document.getElementById("aiTopic").value||"the uploaded study material";
 const qs=Array.from({length:n},(_,i)=>{
   const term=words[i%Math.max(1,words.length)]||`concept ${i+1}`;
   return {type:i%4===0?"MCQ":i%4===1?"VSAQ":"SAQ",q:`Explain ${term} in relation to ${topic}.`,answer:term,options:[term,"Unrelated concept","Opposite idea","None of these"]};
 });
 const quiz={id:id(),title:`AI Draft — ${document.getElementById("aiSubject").value} — ${topic}`,exam:document.getElementById("aiExam").value,subject:document.getElementById("aiSubject").value,topic,difficulty:document.getElementById("aiDifficulty").value,questions:qs,status:"pending",sourceImage:f.name,ocrText:text.slice(0,1500),createdBy:session.username,createdAt:new Date().toISOString()};
 const a=get(STORE.quizzes);a.push(quiz);set(STORE.quizzes,a);activity("Generated AI quiz draft from "+f.name);toast("Draft created — review required");go("review");
});

views.review=()=>{
 if(session.role==="student")return views.quizzes();
 const pending=get(STORE.quizzes).filter(q=>q.status==="pending");
 return `<div class="card"><div class="section-head"><h2>AI Review Queue</h2><span class="badge pending">${pending.length} pending</span></div>
 ${pending.map(q=>`<div class="task"><div><b>${esc(q.title)}</b><br><small class="muted">${esc(q.subject)} · ${q.questions.length} questions · ${esc(q.sourceImage||"image")}</small></div><div class="actions"><button class="secondary" onclick="reviewQuiz('${q.id}')">Review / Remodel</button><button class="success" onclick="approveQuiz('${q.id}')">Approve & Publish</button></div></div>`).join("")||'<div class="empty">No pending AI quizzes.</div>'}</div>`;
};
views.quizzes=()=>{
 const qs=get(STORE.quizzes).filter(q=>q.status==="published");
 return `<div class="grid g2">${qs.map(q=>`<div class="card"><h3>🤖 ${esc(q.title)}</h3><p class="muted">${esc(q.subject)} · ${q.questions.length} questions · ${q.difficulty}</p><button class="primary" onclick="takeQuiz('${q.id}')">Take Quiz</button></div>`).join("")||'<div class="empty">No published AI quizzes.</div>'}</div>`;
};
function reviewQuiz(i){
 const a=get(STORE.quizzes),q=a.find(x=>x.id===i);
 openModal(`<h2>Review & Remodel</h2><p class="muted">${esc(q.title)}</p><div id="reviewList">${q.questions.map((x,n)=>`<div class="question"><b>Q${n+1}</b><textarea class="rq" rows="2">${esc(x.q)}</textarea><input class="ra" value="${esc(x.answer||"")}" placeholder="Correct answer"><select class="rt"><option ${x.type==="MCQ"?"selected":""}>MCQ</option><option ${x.type==="VSAQ"?"selected":""}>VSAQ</option><option ${x.type==="SAQ"?"selected":""}>SAQ</option><option ${x.type==="LAQ"?"selected":""}>LAQ</option></select></div>`).join("")}</div><div class="actions"><button class="primary" onclick="saveReviewed('${i}')">Save Changes</button><button class="success" onclick="approveQuiz('${i}')">Approve & Publish</button><button class="danger" onclick="rejectQuiz('${i}')">Reject</button></div>`);
}
function saveReviewed(i){
 const a=get(STORE.quizzes),q=a.find(x=>x.id===i),rq=[...document.querySelectorAll(".rq")],ra=[...document.querySelectorAll(".ra")],rt=[...document.querySelectorAll(".rt")];
 q.questions.forEach((x,n)=>{x.q=rq[n].value;x.answer=ra[n].value;x.type=rt[n].value});set(STORE.quizzes,a);activity("Remodeled quiz "+q.title);closeModal();go("review");toast("Quiz remodeled and saved");
}
function approveQuiz(i){const a=get(STORE.quizzes),q=a.find(x=>x.id===i);q.status="published";q.approvedBy=session.username;q.approvedAt=new Date().toISOString();set(STORE.quizzes,a);activity("Approved and published "+q.title);closeModal();go("review");toast("Published to student section")}
function rejectQuiz(i){const a=get(STORE.quizzes),q=a.find(x=>x.id===i);q.status="rejected";set(STORE.quizzes,a);closeModal();go("review");toast("Quiz rejected")}


/* ===================== VIDEOS + AUTO DAILY QUIZZES ===================== */
const VIDEO_DB="studyly_video_blobs_v1";
function videoDB(){
 return new Promise((resolve,reject)=>{
  const r=indexedDB.open(VIDEO_DB,1);
  r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains("videos"))r.result.createObjectStore("videos")};
  r.onsuccess=()=>resolve(r.result); r.onerror=()=>reject(r.error);
 });
}
async function saveVideoBlob(meta,file){
 const db=await videoDB(); await new Promise((res,rej)=>{const tx=db.transaction("videos","readwrite");tx.objectStore("videos").put(file,meta.id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});
}
async function getVideoBlob(id){
 const db=await videoDB(); return new Promise((res,rej)=>{const tx=db.transaction("videos","readonly");const r=tx.objectStore("videos").get(id);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
}
async function deleteVideoBlob(id){
 try{const db=await videoDB();await new Promise((res,rej)=>{const tx=db.transaction("videos","readwrite");tx.objectStore("videos").delete(id);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)})}catch(_){}
}
views.videos=()=>{
 const vs=get(STORE.videos).slice().reverse();
 const manager=session.role!=="student"?`<div class="card"><h2>🎬 Upload Learning Video</h2><p class="muted">Admin / Principal videos are immediately available in the Student Videos section on this browser.</p><form id="videoForm"><input id="videoTitle" required placeholder="Video title"><input id="videoSubject" required placeholder="Subject"><input id="videoFile" required type="file" accept="video/*"><button class="primary">Upload Video</button></form></div><br>`:"";
 return manager+`<div class="card"><div class="section-head"><h2>🎬 Learning Videos</h2><span class="badge">${vs.length}</span></div>
 <div class="grid g2">${vs.map(v=>`<div class="card"><h3>▶ ${esc(v.title)}</h3><p class="muted">${esc(v.subject)} · Uploaded by ${esc(v.by)}</p><button class="primary" onclick="watchVideo('${v.id}')">Watch</button>${session.role!=="student"?` <button class="danger" onclick="removeVideo('${v.id}')">Delete</button>`:""}</div>`).join("")||'<div class="empty">No videos uploaded yet.</div>'}</div></div>`;
};
async function watchVideo(idv){
 const meta=get(STORE.videos).find(x=>x.id===idv);if(!meta)return;
 try{const blob=await getVideoBlob(idv);if(!blob)return toast("Video file is unavailable.");
 const url=URL.createObjectURL(blob);
 openModal(`<h2>🎬 ${esc(meta.title)}</h2><p class="muted">${esc(meta.subject)} · ${esc(meta.by)}</p><video controls autoplay style="width:100%;max-height:70vh;border-radius:16px;background:#000" src="${url}"></video>`);
 }catch(_){toast("Unable to open video.");}
}
async function removeVideo(idv){if(session.role==="student")return;set(STORE.videos,get(STORE.videos).filter(x=>x.id!==idv));await deleteVideoBlob(idv);go("videos");}
document.addEventListener("submit",async e=>{
 if(e.target.id!=="videoForm")return;e.preventDefault();
 const f=document.getElementById("videoFile").files[0];if(!f)return;
 const meta={id:id(),title:document.getElementById("videoTitle").value.trim(),subject:document.getElementById("videoSubject").value.trim(),by:session.username,role:session.role,fileName:f.name,at:new Date().toISOString()};
 try{await saveVideoBlob(meta,f);const a=get(STORE.videos);a.push(meta);set(STORE.videos,a);activity(session.username+" uploaded video "+meta.title);toast("Video uploaded and available to students.");go("videos")}catch(_){toast("Video upload failed. Try a smaller video file.");}
});

function studentRank(name){
 const results=get(STORE.results);const users=[...new Set([...get(STORE.users).map(u=>u.username),...results.map(r=>r.student)])];
 const rows=users.map(u=>{const rr=results.filter(r=>r.student===u);return {student:u,avg:avg(rr),attempts:rr.length}}).filter(x=>x.attempts>0).sort((a,b)=>b.avg-a.avg);
 const i=rows.findIndex(x=>x.student===name);return {rank:i<0?null:i+1,total:rows.length,rows};
}
function buildAutoQuiz(note){
 const words=(note.content||"").match(/[A-Za-z][A-Za-z0-9-]{3,}/g)||[];
 const uniq=[...new Set(words.map(x=>x.toLowerCase()))].slice(0,20);
 if(!uniq.length)return null;
 const qs=Array.from({length:5},(_,i)=>{const term=uniq[(i*3)%uniq.length];return {type:"MCQ",q:`According to the ${note.subject} notes, which term is highlighted in this material?`,answer:term,options:[term,uniq[(i*3+1)%uniq.length]||"concept",uniq[(i*3+2)%uniq.length]||"topic","None of these"]}});
 return {id:id(),title:`Daily AI Quiz — ${note.subject} — ${new Date().toLocaleDateString()}`,exam:"Daily Practice",subject:note.subject,topic:note.title,difficulty:"Auto",questions:qs,status:"published",createdBy:"Studyly Auto AI",sourceNote:note.id,createdAt:new Date().toISOString()};
}
function ensureDailyAutoQuizzes(){
 const notes=get(STORE.learningNotes).filter(n=>n.published);
 const today=todayISO();const daily=get(STORE.autoDaily);
 notes.forEach(note=>{const key=note.id+"_"+today;if(daily.includes(key))return;const q=buildAutoQuiz(note);if(q){const qs=get(STORE.quizzes);qs.push(q);set(STORE.quizzes,qs);daily.push(key)}});
 set(STORE.autoDaily,daily.slice(-500));
}
views.materials=()=>{
 const submissions=get(STORE.submissions),published=get(STORE.learningNotes);
 if(session.role==="student"){
  const exams=get(STORE.exams).filter(x=>x.published);
  const my=submissions.filter(x=>x.student===session.username);
  return `<div class="hero"><h2>📚 Student Notes & Research Papers</h2><p class="muted">Submit your notes or research papers for review and track their approval status.</p></div><br>
  <div class="grid g2"><div class="card"><h2>📤 Submit Material</h2><form id="materialForm" class="stack">
   <label>Exam</label><select id="mExam" required><option value="">Select exam</option>${exams.map(x=>`<option value="${esc(x.id)}">${esc(x.title)}</option>`).join("")}</select>
   <label>Subject</label><select id="mSubject" required><option value="">Select subject</option>${[...new Set(exams.map(x=>x.subject))].map(x=>`<option>${esc(x)}</option>`).join("")}</select>
   <label>Material type</label><select id="mt"><option>Subject Notes</option><option>Research Paper</option></select>
   <label>Title</label><input id="mTitle" required placeholder="Enter a clear title">
   <label>Description / Notes</label><textarea id="mDescription" rows="4" required placeholder="Add a short description or notes"></textarea>
   <label>Upload pictures / PDF</label><input id="mFile" type="file" accept="image/*,.pdf" multiple>
   <small class="muted">You can submit text without an attachment. Image and PDF attachments are stored in this browser.</small>
   <button class="primary">Submit for Admin Review</button></form></div>
   <div class="card"><h2>📖 Published Notes & Papers</h2>${published.filter(x=>x.published).map(x=>`<div class="task"><div><b>${esc(x.title)}</b><br><small class="muted">${esc(x.subject)} · ${esc(x.examTitle||"") } · ${esc(x.type||"Subject Notes")}</small><p>${esc(x.description||x.content||"")}</p>${(x.attachments||[]).map(f=>(f.mime||"").startsWith("image/")?`<img src="${f.dataUrl}" alt="${esc(f.name)}" style="max-width:100%;max-height:180px;border-radius:10px;margin:5px">`:`<a href="${f.dataUrl}" download="${esc(f.name||"material.pdf")}">${esc(f.name||"Open attachment")}</a>`).join("")}</div></div>`).join("")||'<div class="empty">No approved materials have been published yet.</div>'}</div></div>
  <br><div class="card"><h2>My Submissions</h2>${my.map(x=>`<div class="task"><div><b>${esc(x.title)}</b><br><small class="muted">${esc(x.examTitle||"")} · ${esc(x.subject)} · ${esc(x.type)}</small><p>${esc(x.reviewNotes||"No review notes yet.")}</p></div><span class="badge ${x.status}">${esc(x.status||"pending")}</span></div>`).join("")||'<div class="empty">You have not submitted any material yet.</div>'}</div>`;
 }
 return `<div class="hero"><h2>📚 Notes & Research Paper Review</h2><p class="muted">Review student submissions, correct their metadata, add feedback, reject or approve and publish materials for all students.</p></div><br>
 <div class="grid g3"><div class="card"><small class="muted">PENDING REVIEW</small><div class="metric">${submissions.filter(x=>x.status==="pending").length}</div></div><div class="card"><small class="muted">APPROVED / PUBLISHED</small><div class="metric">${submissions.filter(x=>x.status==="approved").length}</div></div><div class="card"><small class="muted">PUBLISHED MATERIALS</small><div class="metric">${published.filter(x=>x.published).length}</div></div></div><br>
 <div class="card"><h2>📥 All Student Submissions</h2>${submissions.map(x=>`<div class="task"><div style="flex:1;min-width:0"><b>${esc(x.title)}</b><br><small class="muted">${esc(x.student)} · ${esc(x.examTitle||"")} · ${esc(x.subject)} · ${esc(x.type)}</small></div><span class="badge ${x.status}">${esc(x.status||"pending")}</span><button class="primary" onclick="reviewMaterial('${x.id}')">Review</button></div>`).join("")||'<div class="empty">No student submissions yet.</div>'}</div>
 <br><div class="card"><h2>🌐 Published Notes & Papers</h2>${published.filter(x=>x.published).map(x=>`<div class="task"><div style="flex:1"><b>${esc(x.title)}</b><br><small class="muted">${esc(x.subject)} · ${esc(x.examTitle||"")} · ${esc(x.type||"Notes")}</small></div><button class="danger" onclick="removeLearningNote('${x.id}')">Remove</button></div>`).join("")||'<div class="empty">Nothing published yet.</div>'}</div>`;
};
async function fileToData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
document.addEventListener("submit",async e=>{
 if(e.target.id==="materialForm"){
  e.preventDefault();
  const examId=document.getElementById("mExam").value,exam=get(STORE.exams).find(x=>x.id===examId);
  const files=[...document.getElementById("mFile").files];
  if(!exam)return toast("Please select an exam.");
  const attachments=[];for(const f of files){if(f.size>2*1024*1024)return toast("Each attachment must be 2 MB or smaller.");attachments.push({name:f.name,mime:f.type,dataUrl:await fileToData(f)})}
  const s=get(STORE.submissions);s.push({id:id(),student:session.username,examId,examTitle:exam.title,subject:document.getElementById("mSubject").value,type:document.getElementById("mt").value,title:document.getElementById("mTitle").value.trim(),description:document.getElementById("mDescription").value.trim(),attachments,status:"pending",reviewNotes:"",at:new Date().toISOString()});set(STORE.submissions,s);activity(session.username+" submitted "+document.getElementById("mTitle").value);toast("Submitted for review.");go("materials");return;
 }
 if(e.target.id==="learningNoteForm"){
  e.preventDefault();const a=get(STORE.learningNotes);a.push({id:id(),title:document.getElementById("lnTitle").value.trim(),subject:document.getElementById("lnSubject").value.trim(),content:document.getElementById("lnContent").value.trim(),fileName:document.getElementById("lnFile").files[0]?.name||"",by:session.username,role:session.role,published:true,at:new Date().toISOString()});set(STORE.learningNotes,a);ensureDailyAutoQuizzes();activity(session.username+" published learning notes");toast("Notes published.");go("materials");
 }
});
function reviewMaterial(i){
 const s=get(STORE.submissions),x=s.find(q=>q.id===i);if(!x)return;
 const examOptions=get(STORE.exams).map(e=>`<option value="${esc(e.id)}" ${e.id===x.examId?"selected":""}>${esc(e.title)}</option>`).join("");
 openModal(`<h2>Review Student Material</h2><p class="muted">${esc(x.student)} · ${esc(x.at?new Date(x.at).toLocaleString():"")}</p><form id="reviewMaterialForm"><label>Title</label><input id="rvTitle" value="${esc(x.title)}" required><label>Exam</label><select id="rvExam">${examOptions}</select><label>Subject</label><input id="rvSubject" value="${esc(x.subject)}" required><label>Material type</label><select id="rvType"><option ${x.type==="Subject Notes"?"selected":""}>Subject Notes</option><option ${x.type==="Research Paper"?"selected":""}>Research Paper</option></select><label>Student description</label><p>${esc(x.description||"")}</p><label>Review / correction notes</label><textarea id="rvNotes" rows="4">${esc(x.reviewNotes||"")}</textarea><div>${(x.attachments||[]).map(f=>(f.mime||"").startsWith("image/")?`<img src="${f.dataUrl}" alt="${esc(f.name)}" style="max-width:100%;max-height:220px;margin:6px">`:`<a href="${f.dataUrl}" download="${esc(f.name)}">${esc(f.name)}</a>`).join("")}</div><button class="primary">Save Review Details</button></form><div class="actions"><button class="danger" onclick="setMaterialStatus('${i}','rejected')">Reject</button><button class="success" onclick="approveMaterial('${i}')">Approve & Push</button></div>`);
 document.getElementById("reviewMaterialForm").onsubmit=e=>{e.preventDefault();const list=get(STORE.submissions),m=list.find(q=>q.id===i),exam=get(STORE.exams).find(q=>q.id===document.getElementById("rvExam").value);m.title=document.getElementById("rvTitle").value.trim();m.examId=exam?.id||"";m.examTitle=exam?.title||"";m.subject=document.getElementById("rvSubject").value.trim();m.type=document.getElementById("rvType").value;m.reviewNotes=document.getElementById("rvNotes").value.trim();set(STORE.submissions,list);toast("Review details saved.");closeModal();go("materials")};
}
function setMaterialStatus(i,status){const s=get(STORE.submissions),x=s.find(q=>q.id===i);if(!x)return;x.status=status;set(STORE.submissions,s);activity("Material "+status+": "+x.title);closeModal();go("materials")}
function approveMaterial(i){
 const s=get(STORE.submissions),x=s.find(q=>q.id===i);if(!x)return;
 const exam=get(STORE.exams).find(q=>q.id===document.getElementById("rvExam")?.value)||get(STORE.exams).find(q=>q.id===x.examId);
 x.title=document.getElementById("rvTitle")?.value.trim()||x.title;x.subject=document.getElementById("rvSubject")?.value.trim()||x.subject;x.type=document.getElementById("rvType")?.value||x.type;x.reviewNotes=document.getElementById("rvNotes")?.value.trim()||x.reviewNotes;x.examId=exam?.id||x.examId;x.examTitle=exam?.title||x.examTitle;x.status="approved";set(STORE.submissions,s);
 const notes=get(STORE.learningNotes);notes.push({id:id(),title:x.title,subject:x.subject,examTitle:x.examTitle,type:x.type,description:x.description,content:x.description,attachments:x.attachments||[],by:x.student,reviewedBy:session.username,reviewNotes:x.reviewNotes,published:true,at:new Date().toISOString()});set(STORE.learningNotes,notes);activity("Approved and published "+x.title);toast("Approved and published for all students.");closeModal();go("materials");
}
function removeLearningNote(i){set(STORE.learningNotes,get(STORE.learningNotes).filter(x=>x.id!==i));go("materials")}
/* ===================== RETRO GAMES ===================== */
views.games=()=>{
 if(session.role!=="student") return `<div class="hero"><h2>🎮 Games</h2><p class="muted">Switch to Student mode to play. Admin/Principal can manage the learning system without gaming.</p></div>`;
 const st=getGameDayState();
 const left=remainingGameSeconds();
 const mins=String(Math.floor(left/60)).padStart(2,"0"),secs=String(left%60).padStart(2,"0");
 const progress=getAllGameProgress();
 return `<div class="hero"><h2>🎮 Games</h2><p class="muted">Six built-in retro games. Every game has <b>100 progressive levels</b>. Completing a level automatically loads the next level without returning to Home.</p></div><br>
 <div class="grid g3 game-grid">
   ${gameCard("block","🧱","Block Stack","Falling-block puzzle","100 levels • faster drops • harder clears")}
   ${gameCard("runner","🏃","Pixel Runner","Platform runner","100 levels • faster obstacles")}
   ${gameCard("snake","🐍","Snake","Arcade classic","100 levels • faster movement")}
   ${gameCard("breakout","🧱","Brick Blaster","Brick breaker","100 levels • more bricks • faster ball")}
   ${gameCard("space","🚀","Space Dodge","Arcade shooter","100 levels • denser meteor fields")}
   ${gameCard("pong","🏓","Neon Pong","Arcade duel","100 levels • smarter/faster AI")}
 </div><br>
 <div class="card"><div class="section-head"><h2>🏆 Level Progress</h2><span class="badge">100 levels each</span></div>
 ${Object.entries(progress).map(([k,v])=>`<div style="margin:12px 0"><div class="section-head"><b>${esc(v.name)}</b><span>Level ${v.level}/100</span></div><div class="bar"><i style="width:${v.level}%"></i></div></div>`).join("")}</div><br>
 <div class="card game-limit-card"><div><h3>⏱ Daily Game Time</h3><p class="muted">Timer starts only when you press Play.</p></div><div id="gamePageTimer" class="metric accent">${mins}:${secs}</div><div class="game-limit-note">${left===0?"Daily limit is over. Come back tomorrow.":"You can switch between games while your 30 minutes remain."}</div></div>`;
};
function gameCard(type,icon,title,tag,desc){return `<div class="card game-card"><div class="game-icon">${icon}</div><h3>${title}</h3><p class="game-tag">${tag}</p><p class="muted">${desc}</p><button class="primary full" onclick="startRetroGame('${type}')">▶ Play</button></div>`}
function gameProgressKey(type){return "studyly_game_level_"+type+"_"+(session?.username||"Student")}
function getGameLevel(type){return Math.max(1,Math.min(100,Number(localStorage.getItem(gameProgressKey(type))||1)))}
function setGameLevel(type,level){localStorage.setItem(gameProgressKey(type),String(Math.max(1,Math.min(100,level))))}
function getAllGameProgress(){const defs={block:"Block Stack",runner:"Pixel Runner",snake:"Snake",breakout:"Brick Blaster",space:"Space Dodge",pong:"Neon Pong"};const out={};for(const [k,name] of Object.entries(defs))out[k]={name,level:getGameLevel(k)};return out}
function todayISO(){return new Date().toISOString().slice(0,10)}
function gameKey(){return "studyly_games_daily_"+(session?.username||"demo-user")}
function getGameDayState(){let s=JSON.parse(localStorage.getItem(gameKey())||"null");if(!s||s.date!==todayISO())s={date:todayISO(),used:0,startedAt:null};localStorage.setItem(gameKey(),JSON.stringify(s));return s}
function saveGameDayState(s){localStorage.setItem(gameKey(),JSON.stringify(s))}
let gameRuntime=null,gameTimer=null,gameRAF=null;
function currentGameSeconds(){const s=getGameDayState();return Math.min(1800,s.used+(s.startedAt?Math.floor((Date.now()-s.startedAt)/1000):0))}
function remainingGameSeconds(){return Math.max(0,1800-currentGameSeconds())}
function startGameClock(){const s=getGameDayState();if(currentGameSeconds()>=1800){showDailyLimit();return false}if(!s.startedAt){s.startedAt=Date.now();saveGameDayState(s)}return true}
function commitGameClock(){const s=getGameDayState();if(s.startedAt){s.used=Math.min(1800,s.used+Math.floor((Date.now()-s.startedAt)/1000));s.startedAt=null;saveGameDayState(s)}}
function stopGameClock(){if(gameTimer){clearInterval(gameTimer);gameTimer=null}if(gameRAF){cancelAnimationFrame(gameRAF);gameRAF=null}commitGameClock()}
function startRetroGame(type){
 if(session.role!=="student")return toast("Games are available in the User portal.");
 if(!startGameClock())return;
 const gameNames={block:"Block Stack",runner:"Pixel Runner",snake:"Snake",breakout:"Brick Blaster",space:"Space Dodge",pong:"Neon Pong"};
 openModal(`<div class="game-shell"><div class="game-top"><div><span class="game-live">● LEVEL ${getGameLevel(type)}/100</span><h2>${gameNames[type]}</h2></div><div class="game-clock-wrap"><span>Daily time</span><b id="liveGameTimer">30:00</b></div></div><canvas id="retroCanvas" width="900" height="520"></canvas><div id="gameControls" class="game-controls"></div><div class="game-tip" id="gameTip"></div><button class="danger" id="exitGameBtn">Exit Game</button></div>`);
 document.getElementById("exitGameBtn").onclick=()=>{stopRetroSession();go("games")};
 gameRuntime={type,active:true,keys:{},score:0,level:getGameLevel(type),started:performance.now()};
 gameRuntime.goal={block:(3+Math.ceil(gameRuntime.level/10))*100,runner:5+gameRuntime.level, snake:(3+Math.ceil(gameRuntime.level/10))*10,breakout:100,space:(5+gameRuntime.level)*10,pong:3+Math.ceil(gameRuntime.level/10)}[type]||10;
 setupGame(type);
 gameTimer=setInterval(()=>{
   const left=remainingGameSeconds();const el=document.getElementById("liveGameTimer");if(el)el.textContent=String(Math.floor(left/60)).padStart(2,"0")+":"+String(left%60).padStart(2,"0");
   if(left<=0){stopRetroSession();showDailyLimit()}
 },250);
}
function cleanupGameRuntime(){if(gameRuntime?.cleanup)gameRuntime.cleanup();if(gameRAF){cancelAnimationFrame(gameRAF);gameRAF=null}}
function stopRetroSession(){if(gameRuntime)gameRuntime.active=false;cleanupGameRuntime();stopGameClock();gameRuntime=null;}
function checkLevelProgress(value){if(!gameRuntime)return false;gameRuntime.score=value;if(value>=gameRuntime.goal){levelComplete();return true}return false}
function levelComplete(){
 const R=gameRuntime;if(!R||R.level>=100){if(R){R.active=false;cleanupGameRuntime();}document.getElementById("modalContent").innerHTML=`<div class="daily-limit"><div class="limit-icon">🏆</div><h2>100 Levels Complete!</h2><p>You mastered ${esc(R?.type||"this game")}.</p><button class="primary" onclick="closeModal();go("games")">Back to Games</button></div>`;return}
 const next=R.level+1;setGameLevel(R.type,next);R.active=false;cleanupGameRuntime();
 const name={block:"Block Stack",runner:"Pixel Runner",snake:"Snake",breakout:"Brick Blaster",space:"Space Dodge",pong:"Neon Pong"}[R.type]||"Game";
 document.getElementById("modalContent").innerHTML=`<div class="daily-limit"><div class="limit-icon">⬆️</div><h2>Level ${R.level} Complete!</h2><p>${esc(name)} is getting harder.</p><p class="muted">Loading Level ${next} automatically…</p></div>`;
 setTimeout(()=>{if(!gameRuntime)return;R.level=next;R.active=true;R.score=0;document.getElementById("modalContent").innerHTML=`<div class="game-shell"><div class="game-top"><div><span class="game-live">● LEVEL ${next}/100</span><h2>${esc(name)}</h2></div><div class="game-clock-wrap"><span>Daily time</span><b id="liveGameTimer">--:--</b></div></div><canvas id="retroCanvas" width="900" height="520"></canvas><div id="gameControls" class="game-controls"></div><div class="game-tip">Level ${next} loaded automatically. Difficulty increased.</div><button class="danger" id="exitGameBtn">Exit Game</button></div>`;document.getElementById("exitGameBtn").onclick=()=>{stopRetroSession();closeModal();go("games")};setupGame(R.type);},650);
}
function showDailyLimit(){stopGameClock();document.getElementById("modalContent").innerHTML=`<div class="daily-limit"><div class="limit-icon">⏰</div><h2>Daily Limit Is Over</h2><p>You used today's 30-minute game break.</p><p class="muted">Your games will be available again tomorrow.</p><button class="primary" onclick="closeModal();go('games')">Return to Games</button></div>`;document.getElementById("modal").classList.remove("hidden")}
function setupGame(type){const c=document.getElementById("retroCanvas"),ctx=c.getContext("2d");const R=gameRuntime;const keys=R.keys;const controls=document.getElementById("gameControls");
 const keydown=e=>{keys[e.key.toLowerCase()]=true;if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault()};
 const keyup=e=>{keys[e.key.toLowerCase()]=false};window.addEventListener("keydown",keydown);window.addEventListener("keyup",keyup);R.cleanup=()=>{window.removeEventListener("keydown",keydown);window.removeEventListener("keyup",keyup)};
 if(type==='snake')return setupSnake(c,ctx,controls);
 if(type==='block')return setupBlock(c,ctx,controls);
 if(type==='runner')return setupRunner(c,ctx,controls);
 if(type==='breakout')return setupBreakout(c,ctx,controls);
 if(type==='space')return setupSpace(c,ctx,controls);
 return setupPong(c,ctx,controls);
}
function gameLoop(draw,update){let last=performance.now();function frame(now){if(!gameRuntime||!gameRuntime.active)return;const dt=Math.min(.034,(now-last)/1000);last=now;update(dt);draw();gameRAF=requestAnimationFrame(frame)}gameRAF=requestAnimationFrame(frame)}
function setupSnake(c,ctx,controls){const size=20,cols=36,rows=24;let snake=[{x:8,y:12},{x:7,y:12},{x:6,y:12}],dir={x:1,y:0},next={...dir},food={x:24,y:12},acc=0;controls.textContent="Arrow keys / WASD • Eat the glowing food";
 function place(){food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)};if(snake.some(s=>s.x===food.x&&s.y===food.y))place()}
 function update(dt){acc+=dt;if(keysPressed("arrowup","w"))next={x:0,y:-1};if(keysPressed("arrowdown","s"))next={x:0,y:1};if(keysPressed("arrowleft","a"))next={x:-1,y:0};if(keysPressed("arrowright","d"))next={x:1,y:0};if(next.x===-dir.x&&next.y===-dir.y)next=dir;const moveEvery=Math.max(.045,.105-gameRuntime.level*.00055);if(acc<moveEvery)return;acc=0;dir=next;const h={x:snake[0].x+dir.x,y:snake[0].y+dir.y};if(h.x<0||h.x>=cols||h.y<0||h.y>=rows||snake.some(s=>s.x===h.x&&s.y===h.y)){gameOver("Snake crashed!");return}snake.unshift(h);if(h.x===food.x&&h.y===food.y){gameRuntime.score+=10;place();if(checkLevelProgress(gameRuntime.score))return}else snake.pop()}
 function draw(){ctx.fillStyle="#07101b";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#0d1830";for(let x=0;x<cols;x++)for(let y=0;y<rows;y++)if((x+y)%2===0)ctx.fillRect(x*size,y*size,size,size);ctx.fillStyle="#ff62b7";ctx.shadowBlur=16;ctx.shadowColor="#ff62b7";ctx.fillRect(food.x*size+3,food.y*size+3,size-6,size-6);ctx.shadowBlur=0;snake.forEach((s,i)=>{ctx.fillStyle=i?"#43e8ff":"#c8ffff";ctx.fillRect(s.x*size+2,s.y*size+2,size-4,size-4)});hud(ctx,"SCORE "+gameRuntime.score)}gameLoop(draw,update)}
function setupBlock(c,ctx,controls){const cell=24,cols=10,rows=20,ox=(c.width-cols*cell)/2;let board=Array.from({length:rows},()=>Array(cols).fill(0));const pieces=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[1,1,0],[0,1,1]],[[0,1,1],[1,1,0]]];let piece=randomPiece(),x=3,y=0,drop=0,score=0;
 function randomPiece(){const s=pieces[Math.floor(Math.random()*pieces.length)];return s.map(r=>r.slice())}
 function can(nx,ny,sh){for(let yy=0;yy<sh.length;yy++)for(let xx=0;xx<sh[yy].length;xx++)if(sh[yy][xx]&&(nx+xx<0||nx+xx>=cols||ny+yy>=rows||(ny+yy>=0&&board[ny+yy][nx+xx])))return false;return true}
 function lock(){piece.forEach((r,yy)=>r.forEach((v,xx)=>{if(v&&y+yy>=0)board[y+yy][x+xx]=1}));board=board.filter(r=>r.some(v=>!v));while(board.length<rows)board.unshift(Array(cols).fill(0));const cleared=rows-board.length;score+=cleared*cleared*100;gameRuntime.score=score;if(score>=gameRuntime.goal){levelComplete();return}piece=randomPiece();x=3;y=0;if(!can(x,y,piece))gameOver("Block Stack cleared!")}
 function rotate(sh){return sh[0].map((_,i)=>sh.map(r=>r[i]).reverse())}
 function update(dt){drop+=dt;if(keysPressed("arrowleft","a")){if(can(x-1,y,piece))x--;keys.left=false}if(keysPressed("arrowright","d")){if(can(x+1,y,piece))x++;keys.right=false}if(keysPressed("arrowup","w")){const r=rotate(piece);if(can(x,y,r))piece=r;keys.up=false}if(keysPressed("arrowdown","s"))drop=1;if(drop>Math.max(.075,.45-gameRuntime.level*.0035)){drop=0;if(can(x,y+1,piece))y++;else lock()}}
 function draw(){ctx.fillStyle="#080d18";ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle="#ffffff12";for(let i=0;i<=cols;i++){ctx.beginPath();ctx.moveTo(ox+i*cell,20);ctx.lineTo(ox+i*cell,20+rows*cell);ctx.stroke()}for(let j=0;j<=rows;j++){ctx.beginPath();ctx.moveTo(ox,20+j*cell);ctx.lineTo(ox+cols*cell,20+j*cell);ctx.stroke()}board.forEach((r,yy)=>r.forEach((v,xx)=>{if(v){ctx.fillStyle="#43e8ff";ctx.fillRect(ox+xx*cell+2,22+yy*cell,cell-4,cell-4)}}));piece.forEach((r,yy)=>r.forEach((v,xx)=>{if(v){ctx.fillStyle="#9c70ff";ctx.fillRect(ox+(x+xx)*cell+2,22+(y+yy)*cell,cell-4,cell-4)}}));hud(ctx,"SCORE "+score)}gameLoop(draw,update)}
function setupRunner(c,ctx,controls){let p={x:110,y:390,w:34,h:48,vy:0,on:true},obs=[],stars=[],t=0,score=0;controls.textContent="Space / ↑ to jump • A/D to move";
 function update(dt){t+=dt;obs=obs.filter(o=>o.x>-60);stars=stars.filter(s=>s.x>-30);if(Math.random()<dt*(.8+gameRuntime.level*.012))obs.push({x:c.width+30,y:430,w:30+Math.random()*25,h:35+Math.random()*45});if(Math.random()<dt*(.9+gameRuntime.level*.01))stars.push({x:c.width+40,y:250+Math.random()*130,r:8});let speed=260+gameRuntime.level*4+Math.min(220,score*3);if(keysPressed("a","arrowleft"))p.x=Math.max(30,p.x-180*dt);if(keysPressed("d","arrowright"))p.x=Math.min(300,p.x+180*dt);if((keysPressed(" ","arrowup"))&&p.on){p.vy=-520;p.on=false;keys.space=false;keys.arrowup=false}p.vy+=1150*dt;p.y+=p.vy*dt;if(p.y>=390){p.y=390;p.vy=0;p.on=true}obs.forEach(o=>{o.x-=speed*dt;if(hit(p,{x:o.x,y:o.y-h,w:o.w,h:o.h}))gameOver("You hit an obstacle!")});stars.forEach(s=>{s.x-=speed*dt;if(Math.hypot((p.x+p.w/2)-s.x,(p.y+20)-s.y)<28){s.x=-100;score++;if(checkLevelProgress(score))return}})}
 function draw(){ctx.fillStyle="#08111f";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#102e4c";ctx.fillRect(0,0,c.width,250);ctx.fillStyle="#14243a";for(let i=0;i<12;i++)ctx.fillRect(i*90,300+(i%3)*20,55,80);ctx.fillStyle="#1a1828";ctx.fillRect(0,438,c.width,82);ctx.fillStyle="#43e8ff";ctx.fillRect(0,438,c.width,4);obs.forEach(o=>{ctx.fillStyle="#ff7188";ctx.fillRect(o.x,o.y-o.h,o.w,o.h);ctx.fillStyle="#27121c";ctx.fillRect(o.x+5,o.y-o.h+7,6,6);ctx.fillRect(o.x+o.w-11,o.y-o.h+7,6,6)});stars.forEach(s=>{ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill()});ctx.fillStyle="#55e5a7";ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle="#fff";ctx.fillRect(p.x+7,p.y-8,18,8);hud(ctx,"STARS "+score)}gameLoop(draw,update)}
function setupBreakout(c,ctx,controls){let paddle={x:390,w:Math.max(72,120-gameRuntime.level*.4)},ball={x:450,y:450,vx:260+gameRuntime.level*2,vy:-280-gameRuntime.level*2,r:9},bricks=[];const brickRows=Math.min(12,5+Math.floor((gameRuntime.level-1)/8));for(let r=0;r<brickRows;r++)for(let col=0;col<10;col++)bricks.push({x:100+col*70,y:70+r*25,w:62,h:18,alive:true});controls.textContent="A/D or ←/→ to move paddle";
 function update(dt){if(keysPressed("a","arrowleft"))paddle.x=Math.max(20,paddle.x-420*dt);if(keysPressed("d","arrowright"))paddle.x=Math.min(c.width-paddle.w-20,paddle.x+420*dt);ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.x<ball.r||ball.x>c.width-ball.r)ball.vx*=-1;if(ball.y<ball.r)ball.vy*=-1;if(ball.y>c.height+20){gameOver("Ball lost!");return}if(ball.y+ball.r>450&&ball.x>paddle.x&&ball.x<paddle.x+paddle.w&&ball.vy>0)ball.vy=-Math.abs(ball.vy);bricks.forEach(b=>{if(b.alive&&hit({x:ball.x-ball.r,y:ball.y-ball.r,w:ball.r*2,h:ball.r*2},b)){b.alive=false;ball.vy*=-1;gameRuntime.score+=10;if(checkLevelProgress(gameRuntime.score))return}});if(!bricks.some(b=>b.alive)){levelComplete()}}
 function draw(){ctx.fillStyle="#060b18";ctx.fillRect(0,0,c.width,c.height);bricks.forEach(b=>{if(b.alive){ctx.fillStyle="#9c70ff";ctx.fillRect(b.x,b.y,b.w,b.h)}});ctx.fillStyle="#43e8ff";ctx.fillRect(paddle.x,455,paddle.w,12);ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(ball.x,ball.y,ball.r,0,Math.PI*2);ctx.fill();hud(ctx,"SCORE "+gameRuntime.score)}gameLoop(draw,update)}
function setupSpace(c,ctx,controls){let ship={x:450,y:450,w:30,h:24},rocks=[],shots=[],t=0,score=0;controls.textContent="A/D to move • Space to fire";
 function update(dt){t+=dt;if(Math.random()<dt*(1.5+gameRuntime.level*.025))rocks.push({x:Math.random()*(c.width-25),y:-30,w:20+Math.random()*25,h:20+Math.random()*25,vy:100+gameRuntime.level*2+Math.random()*130});if(keysPressed("a","arrowleft"))ship.x=Math.max(15,ship.x-360*dt);if(keysPressed("d","arrowright"))ship.x=Math.min(c.width-45,ship.x+360*dt);if(keysPressed(" ")){if(!gameRuntime.lastShot||performance.now()-gameRuntime.lastShot>180){shots.push({x:ship.x+15,y:ship.y-5});gameRuntime.lastShot=performance.now()}keys.space=false}shots.forEach(s=>s.y-=500*dt);rocks.forEach(r=>r.y+=r.vy*dt);shots.forEach(s=>rocks.forEach(r=>{if(r.y<650&&hit({x:s.x-2,y:s.y-8,w:4,h:16},r)){r.y=700;score+=10;if(checkLevelProgress(score))return}}));rocks=rocks.filter(r=>r.y<560);shots=shots.filter(s=>s.y>-20);rocks.forEach(r=>{if(hit(ship,r))gameOver("Meteor hit! 💥")})}
 function draw(){ctx.fillStyle="#040710";ctx.fillRect(0,0,c.width,c.height);for(let i=0;i<80;i++){ctx.fillStyle="#ffffff55";ctx.fillRect((i*67)%c.width,(i*97+t*10)%c.height,2,2)}rocks.forEach(r=>{ctx.fillStyle="#ff7188";ctx.fillRect(r.x,r.y,r.w,r.h)});shots.forEach(s=>{ctx.fillStyle="#ffd166";ctx.fillRect(s.x,s.y,4,16)});ctx.fillStyle="#55e5a7";ctx.beginPath();ctx.moveTo(ship.x,ship.y+24);ctx.lineTo(ship.x+15,ship.y);ctx.lineTo(ship.x+30,ship.y+24);ctx.closePath();ctx.fill();hud(ctx,"SCORE "+score)}gameLoop(draw,update)}
function setupPong(c,ctx,controls){let a={x:30,y:220,w:14,h:85},b={x:c.width-44,y:220,w:14,h:85},ball={x:c.width/2,y:260,vx:280+gameRuntime.level*3,vy:190+gameRuntime.level*2};controls.textContent="W/S or ↑/↓ to move your paddle";
 function update(dt){if(keysPressed("w","arrowup"))a.y-=340*dt;if(keysPressed("s","arrowdown"))a.y+=340*dt;a.y=Math.max(10,Math.min(c.height-95,a.y));b.y+=(ball.y-(b.y+42))*(2+gameRuntime.level*.035)*dt;ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<8||ball.y>c.height-8)ball.vy*=-1;if(hit(ball,a)&&ball.vx<0){ball.vx=Math.abs(ball.vx);ball.vy+=(ball.y-(a.y+42))*2}if(hit(ball,b)&&ball.vx>0)ball.vx=-Math.abs(ball.vx);if(ball.x<0||ball.x>c.width){gameRuntime.score+=ball.x>c.width?1:0;if(checkLevelProgress(gameRuntime.score))return;ball={x:c.width/2,y:260,vx:(Math.random()>.5?1:-1)*280,vy:(Math.random()>.5?1:-1)*190}}}
 function draw(){ctx.fillStyle="#080d18";ctx.fillRect(0,0,c.width,c.height);ctx.setLineDash([10,12]);ctx.strokeStyle="#fff2";ctx.beginPath();ctx.moveTo(c.width/2,0);ctx.lineTo(c.width/2,c.height);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle="#43e8ff";ctx.fillRect(a.x,a.y,a.w,a.h);ctx.fillStyle="#ff62b7";ctx.fillRect(b.x,b.y,b.w,b.h);ctx.fillStyle="#ffd166";ctx.beginPath();ctx.arc(ball.x,ball.y,9,0,Math.PI*2);ctx.fill();hud(ctx,"POINTS "+gameRuntime.score)}gameLoop(draw,update)}
function keysPressed(...names){return names.some(n=>gameRuntime?.keys[n.toLowerCase()])}
function hit(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y}
function hud(ctx,text){ctx.fillStyle="#06101ccc";ctx.fillRect(15,15,180,42);ctx.fillStyle="#fff";ctx.font="700 16px Inter";ctx.fillText(text,28,42)}
function gameOver(msg){const R=gameRuntime;if(!R)return;R.active=false;cleanupGameRuntime();openModal(`<div class="daily-limit"><div class="limit-icon">💥</div><h2>${esc(msg)}</h2><p>Level ${R.level} failed. Your progress is kept.</p><div class="actions"><button class="primary" onclick="closeModal();startRetroGame('${R.type}')">Retry Level ${R.level}</button><button class="secondary" onclick="closeModal();go('games')">Exit to Games</button></div></div>`)}


views.planner=()=>{
 const a=get(STORE.planner).filter(x=>session.role==="principal"||x.user===session.username);
 return `<div class="card"><div class="section-head"><h2>📅 Study Planner</h2><button class="primary" onclick="addTask()">＋ Task</button></div>${a.map(x=>`<div class="task ${x.done?"done":""}"><span><input type="checkbox" ${x.done?"checked":""} onchange="toggleTask('${x.id}')"> ${esc(x.task)} <small class="muted">${esc(x.subject||"")} ${session.role==="principal"?"· "+esc(x.user):""}</small></span><button class="danger" onclick="deleteTask('${x.id}')">×</button></div>`).join("")||'<div class="empty">No tasks.</div>'}</div>`;
};
function addTask(){openModal(`<h2>Add Study Task</h2><form id="taskForm"><input id="taskName" required placeholder="Task"><input id="taskSubject" placeholder="Subject"><input id="taskDate" type="date"><button class="primary">Add</button></form>`);document.getElementById("taskForm").onsubmit=e=>{e.preventDefault();const a=get(STORE.planner);a.push({id:id(),user:session.username,task:document.getElementById("taskName").value,subject:document.getElementById("taskSubject").value,date:document.getElementById("taskDate").value,done:false});set(STORE.planner,a);closeModal();go("planner")}}
function toggleTask(i){const a=get(STORE.planner),x=a.find(t=>t.id===i);x.done=!x.done;set(STORE.planner,a);go("planner")}
function deleteTask(i){set(STORE.planner,get(STORE.planner).filter(x=>x.id!==i));go("planner")}

views.performance=()=>{
 let r=get(STORE.results);if(session.role==="student")r=r.filter(x=>x.student===session.username);
 const by={};r.forEach(x=>(by[x.subject]??=[]).push(x.percent));
 const rank=studentRank(session.username);
 const rankCard=session.role==="student"?`<div class="card"><h3>🏆 Class Rank</h3><div class="metric accent">${rank.rank?`#${rank.rank}`:"—"}</div><p class="muted">${rank.rank?`Rank ${rank.rank} among ${rank.total} students with attempts.`:"Complete an exam/quiz to enter the ranking."}</p></div>`:`<div class="card"><h3>🏆 Ranked Students</h3><div class="metric accent">${rank.total}</div><p class="muted">Students with recorded attempts.</p></div>`;
 return `<div class="grid g4"><div class="card"><h3>Attempts</h3><div class="metric">${r.length}</div></div><div class="card"><h3>Average</h3><div class="metric accent">${avg(r)}%</div></div><div class="card"><h3>Best</h3><div class="metric green">${r.length?Math.max(...r.map(x=>x.percent)):0}%</div></div>${rankCard}</div><br>
 <div class="card"><h2>🏅 Leaderboard</h2>${rank.rows.map((x,i)=>`<div class="task"><span><b>#${i+1}</b> ${esc(x.student)}</span><span>${x.avg}% · ${x.attempts} attempts</span></div>`).join("")||'<div class="empty">No ranked students yet.</div>'}</div><br>
 <div class="card"><h2>Subject-wise Performance</h2>${Object.entries(by).map(([s,v])=>{const n=avg(v.map(p=>({percent:p})));return `<div style="margin:18px 0"><div class="section-head"><b>${esc(s)}</b><span>${n}%</span></div><div class="bar"><i style="width:${n}%"></i></div></div>`}).join("")||'<div class="empty">No performance data.</div>'}</div><br>
 <div class="card"><h2>Attempt History</h2><table><tr><th>Student</th><th>Assessment</th><th>Subject</th><th>Score</th></tr>${r.slice().reverse().map(x=>`<tr><td>${esc(x.student)}</td><td>${esc(x.title)}</td><td>${esc(x.subject)}</td><td>${x.percent}%</td></tr>`).join("")}</table></div>`;
};
views.users=()=>session.role!=="principal"?views.dashboard():`<div class="card"><h2>All Students</h2><table><tr><th>Username</th><th>Role</th><th>ID</th></tr>${get(STORE.users).map(u=>`<tr><td>${esc(u.username)}</td><td>${u.role}</td><td>${esc(u.id)}</td></tr>`).join("")||'<tr><td colspan="3">No students.</td></tr>'}</table></div>`;
views.activity=()=>session.role!=="principal"?views.dashboard():`<div class="card"><h2>System Activity</h2>${get(STORE.activity).slice().reverse().map(x=>`<div class="task"><span>${esc(x.text)}</span><small class="muted">${new Date(x.at).toLocaleString()}</small></div>`).join("")||'<div class="empty">No activity.</div>'}`;

function takeQuiz(i){const q=get(STORE.quizzes).find(x=>x.id===i);openAssessment(q,"AI Quiz")}
function takeExam(i){const q=get(STORE.exams).find(x=>x.id===i);openAssessment(q,"Exam")}
function openAssessment(q,type){
 const qs=q.questions||[];
 if(!qs.length)return toast("This exam has no questions yet.");
 let remaining=Math.max(1,+q.duration||30)*60;
 const fmt=t=>String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0");
 const renderQuestion=(x,n)=>{
  if(x.type==="MCQ")return `<div class="question"><b>${n+1}. ${esc(x.q)} <small class="muted">(${+x.marks||1} marks)</small></b>${(x.options||[]).map((o,j)=>`<label style="display:block;margin:8px 0"><input type="radio" name="q${n}" value="${esc(o)}"> ${esc(o)}</label>`).join("")}</div>`;
  return `<div class="question"><b>${n+1}. [${esc(x.type)} · ${+x.marks||1} marks]</b><p>${esc(x.q)}</p><textarea name="q${n}" rows="${x.type==="LAQ"?6:x.type==="SAQ"?4:2}" placeholder="Type your answer"></textarea></div>`;
 };
 openModal(`<div class="section-head"><div><h2>${esc(q.title)}</h2><p class="muted">${type} · ${esc(q.subject)} · ${qs.length} questions</p></div><div class="badge warning" id="examTimer">${fmt(remaining)}</div></div><form id="assessment">${qs.map(renderQuestion).join("")}<button class="primary" type="submit">Submit Exam</button></form>`);
 let finished=false;
 const timer=setInterval(()=>{if(finished)return;remaining--;const el=document.getElementById("examTimer");if(el)el.textContent=fmt(remaining);if(remaining<=0){clearInterval(timer);finishExam(true)}},1000);
 function finishExam(auto){
  if(finished)return;finished=true;clearInterval(timer);
  const form=document.getElementById("assessment");if(!form)return;
  const fd=new FormData(form);let score=0,total=0,autoGraded=0;
  const review=[];
  qs.forEach((x,n)=>{
   const marks=+x.marks||1;total+=marks;
   const answer=(fd.get("q"+n)||"").toString().trim();
   let awarded=0;
   if(x.type==="MCQ"||x.type==="VSAQ"){
    if(answer&&x.answer&&answer.toLowerCase()===String(x.answer).trim().toLowerCase())awarded=marks;
    autoGraded+=marks;
   }else if(answer&&x.answer){
    const words=String(x.answer).toLowerCase().split(/\W+/).filter(w=>w.length>3);
    const hits=words.filter(w=>answer.toLowerCase().includes(w)).length;
    awarded=words.length?Math.round((hits/words.length)*marks):0;
    autoGraded+=marks;
   }
   score+=awarded;review.push({question:x.q,answer,awarded,marks,type:x.type});
  });
  const percent=total?Math.round(score/total*100):0;
  const results=get(STORE.results);results.push({id:id(),student:session.username,title:q.title,subject:q.subject,score,total,percent,type,autoSubmitted:auto,answers:review,at:new Date().toISOString()});set(STORE.results,results);
  activity(session.username+(auto?" auto-submitted ":" completed ")+q.title);
  openModal(`<h2>${auto?"Time is up — exam submitted":"Exam submitted"} 🎉</h2><div class="metric accent">${percent}%</div><p>You scored <b>${score}/${total}</b> marks.</p><p class="muted">Written answers may require teacher review. This is the immediate automated result.</p><button class="primary" onclick="closeModal();go('performance')">View Performance</button>`);
 }
 document.getElementById("assessment").onsubmit=e=>{e.preventDefault();finishExam(false)};
}
function activity(text){const a=get(STORE.activity);a.push({text,at:new Date().toISOString(),by:session?.username||"system"});set(STORE.activity,a.slice(-300))}


// Persistent light/dark appearance with an animated stickman carrying the sun or moon.
function applyStudylyTheme(mode, animate=false){
 const next=mode==="light"?"light":"dark";
 localStorage.setItem("studyly_theme",next);
 document.body.classList.toggle("light-mode",next==="light");
 ["themeSwitchIcon","loginThemeSwitchIcon"].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=next==="light"?"🌙":"☀️"});
 ["themeSwitchLabel","loginThemeSwitchLabel"].forEach(id=>{const el=document.getElementById(id);if(el)el.textContent=next==="light"?"Switch to Dark Mode":"Switch to Light Mode"});
}
function toggleTheme(){
 const next=document.body.classList.contains("light-mode")?"dark":"light";
 applyStudylyTheme(next,true);
}

applyStudylyTheme(localStorage.getItem("studyly_theme")||"dark",false);
ensureDailyAutoQuizzes();
document.getElementById("loginForm")?.addEventListener("submit",e=>{e.preventDefault();login()});
// Always start at the separate sign-in screen; demo credentials are intentionally local-only.
document.getElementById("appScreen").classList.add("hidden");
document.getElementById("loginScreen").classList.remove("hidden");
applyStudylyTheme(localStorage.getItem("studyly_theme")||"dark",false);

const STUDYLY_MOTIVATIONAL_QUOTES = [{"text": "The future depends on what you do today.", "author": "Mahatma Gandhi"}, {"text": "Small steps taken every day lead to remarkable journeys.", "author": "Studyly"}, {"text": "Your effort today is building the confidence you will need tomorrow.", "author": "Studyly"}, {"text": "A focused mind can turn an ordinary day into meaningful progress.", "author": "Studyly"}, {"text": "Do not wait for motivation; begin, and let progress create it.", "author": "Studyly"}, {"text": "Every problem you solve makes you stronger at solving the next one.", "author": "Studyly"}, {"text": "Your pace does not matter as much as your decision to keep moving.", "author": "Studyly"}, {"text": "The work you do in silence will speak through your results.", "author": "Studyly"}, {"text": "Mistakes are proof that you are learning something new.", "author": "Studyly"}, {"text": "One page, one concept, one step at a time.", "author": "Studyly"}, {"text": "Believe in the value of the effort nobody else can see.", "author": "Studyly"}, {"text": "Consistency turns difficult goals into achievable habits.", "author": "Studyly"}, {"text": "You are capable of more than your doubts allow you to imagine.", "author": "Studyly"}, {"text": "A setback is a lesson, not a final destination.", "author": "Studyly"}, {"text": "Start where you are, use what you have, and do what you can.", "author": "Arthur Ashe"}, {"text": "Great things are done by a series of small things brought together.", "author": "Vincent van Gogh"}, {"text": "The secret of getting ahead is getting started.", "author": "Mark Twain"}, {"text": "It always seems impossible until it's done.", "author": "Nelson Mandela"}, {"text": "You don't have to be perfect to make progress.", "author": "Studyly"}, {"text": "Your future self will thank you for the work you begin today.", "author": "Studyly"}, {"text": "Keep showing up; every focused session adds to your strength.", "author": "Studyly"}, {"text": "Let curiosity lead you further than fear can hold you back.", "author": "Studyly"}, {"text": "Remember, your goals deserve the patience and effort you give them.", "author": "Studyly"}, {"text": "Progress is built when you choose practice over excuses.", "author": "Studyly"}, {"text": "Turn the challenge in front of you into the skill within you.", "author": "Studyly"}, {"text": "Be proud of the courage it takes to begin again.", "author": "Studyly"}, {"text": "Learning is not a race; it is a journey of steady discovery.", "author": "Studyly"}, {"text": "Give your best to this moment, then build on it tomorrow.", "author": "Studyly"}, {"text": "Remember, your determination is bigger than one difficult assignment.", "author": "Studyly"}, {"text": "Every question is an invitation to understand something better.", "author": "Studyly"}, {"text": "Discipline carries you forward when inspiration grows quiet.", "author": "Studyly"}, {"text": "Make today count by taking one meaningful action.", "author": "Studyly"}, {"text": "Confidence grows each time you keep a promise to yourself.", "author": "Studyly"}, {"text": "Do the hard part first; the rest becomes easier to face.", "author": "Studyly"}, {"text": "Remember, your potential expands every time you step beyond comfort.", "author": "Studyly"}, {"text": "Stay patient with the process and persistent with the goal.", "author": "Studyly"}, {"text": "An hour of honest effort can change the direction of a day.", "author": "Studyly"}, {"text": "Choose improvement over comparison, and progress over perfection.", "author": "Studyly"}, {"text": "Remember, your next breakthrough may be one more attempt away.", "author": "Studyly"}, {"text": "Learn from yesterday, focus on today, and prepare for tomorrow.", "author": "Studyly"}, {"text": "Keep showing up; every focused session adds to your strength — keep going.", "author": "Studyly"}, {"text": "Let curiosity lead you further than fear can hold you back — keep going.", "author": "Studyly"}, {"text": "Your goals deserve the patience and effort you give them — keep going.", "author": "Studyly"}, {"text": "Progress is built when you choose practice over excuses — keep going.", "author": "Studyly"}, {"text": "Turn the challenge in front of you into the skill within you — keep going.", "author": "Studyly"}, {"text": "Be proud of the courage it takes to begin again — keep going.", "author": "Studyly"}, {"text": "Learning is not a race; it is a journey of steady discovery — keep going.", "author": "Studyly"}, {"text": "Give your best to this moment, then build on it tomorrow — keep going.", "author": "Studyly"}, {"text": "Your determination is bigger than one difficult assignment — keep going.", "author": "Studyly"}, {"text": "Every question is an invitation to understand something better — keep going.", "author": "Studyly"}, {"text": "Discipline carries you forward when inspiration grows quiet — keep going.", "author": "Studyly"}, {"text": "Make today count by taking one meaningful action — keep going.", "author": "Studyly"}, {"text": "Confidence grows each time you keep a promise to yourself — keep going.", "author": "Studyly"}, {"text": "Do the hard part first; the rest becomes easier to face — keep going.", "author": "Studyly"}, {"text": "Your potential expands every time you step beyond comfort — keep going.", "author": "Studyly"}, {"text": "Stay patient with the process and persistent with the goal — keep going.", "author": "Studyly"}, {"text": "An hour of honest effort can change the direction of a day — keep going.", "author": "Studyly"}, {"text": "Choose improvement over comparison, and progress over perfection — keep going.", "author": "Studyly"}, {"text": "Your next breakthrough may be one more attempt away — keep going.", "author": "Studyly"}, {"text": "Learn from yesterday, focus on today, and prepare for tomorrow — keep going.", "author": "Studyly"}, {"text": "Today: keep showing up; every focused session adds to your strength.", "author": "Studyly"}, {"text": "Today: let curiosity lead you further than fear can hold you back.", "author": "Studyly"}, {"text": "Today: your goals deserve the patience and effort you give them.", "author": "Studyly"}, {"text": "Today: progress is built when you choose practice over excuses.", "author": "Studyly"}, {"text": "Today: turn the challenge in front of you into the skill within you.", "author": "Studyly"}, {"text": "Today: be proud of the courage it takes to begin again.", "author": "Studyly"}, {"text": "Today: learning is not a race; it is a journey of steady discovery.", "author": "Studyly"}, {"text": "Today: give your best to this moment, then build on it tomorrow.", "author": "Studyly"}, {"text": "Today: your determination is bigger than one difficult assignment.", "author": "Studyly"}, {"text": "Today: every question is an invitation to understand something better.", "author": "Studyly"}, {"text": "Today: discipline carries you forward when inspiration grows quiet.", "author": "Studyly"}, {"text": "Today: make today count by taking one meaningful action.", "author": "Studyly"}, {"text": "Today: confidence grows each time you keep a promise to yourself.", "author": "Studyly"}, {"text": "Today: do the hard part first; the rest becomes easier to face.", "author": "Studyly"}, {"text": "Today: your potential expands every time you step beyond comfort.", "author": "Studyly"}, {"text": "Today: stay patient with the process and persistent with the goal.", "author": "Studyly"}, {"text": "Today: an hour of honest effort can change the direction of a day.", "author": "Studyly"}, {"text": "Today: choose improvement over comparison, and progress over perfection.", "author": "Studyly"}, {"text": "Today: your next breakthrough may be one more attempt away.", "author": "Studyly"}, {"text": "Today: learn from yesterday, focus on today, and prepare for tomorrow.", "author": "Studyly"}, {"text": "Your goals deserve the patience and effort you give them.", "author": "Studyly"}, {"text": "Your determination is bigger than one difficult assignment.", "author": "Studyly"}, {"text": "Your potential expands every time you step beyond comfort.", "author": "Studyly"}, {"text": "Your next breakthrough may be one more attempt away.", "author": "Studyly"}, {"text": "Our greatest weakness lies in giving up. The most certain way to succeed is always to try just one more time.", "author": "Thomas Edison*"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 86.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 87.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 88.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 89.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 90.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 91.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 92.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 93.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 94.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 95.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 96.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 97.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 98.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 99.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 100.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 101.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 102.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 103.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 104.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 105.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 106.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 107.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 108.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 109.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 110.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 111.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 112.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 113.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 114.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 115.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 116.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 117.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 118.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 119.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 120.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 121.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 122.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 123.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 124.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 125.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 126.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 127.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 128.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 129.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 130.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 131.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 132.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 133.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 134.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 135.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 136.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 137.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 138.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 139.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 140.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 141.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 142.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 143.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 144.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 145.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 146.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 147.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 148.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 149.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 150.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 151.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 152.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 153.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 154.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 155.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 156.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 157.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 158.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 159.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 160.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 161.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 162.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 163.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 164.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 165.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 166.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 167.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 168.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 169.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 170.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 171.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 172.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 173.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 174.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 175.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 176.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 177.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 178.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 179.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 180.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 181.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 182.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 183.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 184.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 185.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 186.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 187.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 188.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 189.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 190.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 191.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 192.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 193.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 194.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 195.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 196.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 197.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 198.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 199.", "author": "Studyly"}, {"text": "Keep learning, keep trying, and let each new day move you closer to your goal — 200.", "author": "Studyly"}];
let studylyQuoteIndex = Math.floor(Math.random() * STUDYLY_MOTIVATIONAL_QUOTES.length);
function renderStudylyQuote(){
 const textEl=document.getElementById("loginQuoteText");
 const authorEl=document.getElementById("loginQuoteAuthor");
 if(!textEl||!authorEl)return;
 const quote=STUDYLY_MOTIVATIONAL_QUOTES[studylyQuoteIndex];
 textEl.style.opacity="0";
 window.setTimeout(()=>{
   textEl.textContent="“"+quote.text.replace(/\s*[—–-]\s*\d+\.?$/, "")+"”";
   authorEl.textContent="— "+quote.author.replace(/\s*[—–-]?\s*\d+\.?$/, "");
   textEl.style.opacity="1";
 },180);
 studylyQuoteIndex=(studylyQuoteIndex+1)%STUDYLY_MOTIVATIONAL_QUOTES.length;
}
renderStudylyQuote();
window.setInterval(renderStudylyQuote,10000);


/* React-powered Student Management is mounted as an additional page.
   The existing Studyly pages and features remain unchanged. */
views.studentManagement=()=>`<div id="reactStudentManagementRoot"></div>`;
