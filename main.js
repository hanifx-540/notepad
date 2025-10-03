// ===== Data Storage =====
let users = JSON.parse(localStorage.getItem('users') || '[]');
let currentUser = null;
let tempCode = null;
let notes = [];
let categories = new Set(['All']);
let activeNoteId = null;

// ===== Helper =====
const msg = (id, t)=> document.getElementById(id).innerText = t;

// ===== Login / Register =====
document.getElementById('login-btn').onclick = () => {
  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!identifier || !password) return msg('login-msg','সব ফিল্ড পূরণ করুন');

  let user = users.find(u => u.identifier === identifier);
  if (!user){
    msg('login-msg','Account নেই, নিচে Create Account ব্যবহার করুন');
    return;
  }
  if (user.password !== password){
    return msg('login-msg','পাসওয়ার্ড ভুল');
  }

  currentUser = user;
  tempCode = Math.floor(100000 + Math.random()*900000).toString();
  alert(`আপনার verification কোড: ${tempCode}`);
  document.getElementById('verify-section').style.display = 'block';
};

document.getElementById('create-account').onclick = ()=>{
  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value.trim();
  if (!identifier || !password) return msg('login-msg','সব ফিল্ড পূরণ করুন');
  if (users.find(u=>u.identifier===identifier)) return msg('login-msg','User already exists');
  let user = {id: Date.now(), identifier, password};
  users.push(user);
  localStorage.setItem('users', JSON.stringify(users));
  msg('login-msg','Account তৈরি হয়েছে, এবার Login করুন');
};

document.getElementById('verify-btn').onclick = () => {
  const code = document.getElementById('verify-code').value.trim();
  if (code === tempCode){
    tempCode = null;
    msg('verify-msg','');
    showNotepad();
  } else {
    msg('verify-msg','ভুল কোড, আবার চেষ্টা করুন।');
  }
};

document.getElementById('logout-btn').onclick = () => {
  currentUser=null; notes=[]; categories=new Set(['All']); activeNoteId=null;
  document.getElementById('notepad-area').style.display='none';
  document.getElementById('login-area').style.display='block';
};

// ===== Dark / Light Mode =====
const body=document.body;
document.getElementById('mode-toggle').onclick=()=>{
  body.classList.toggle('dark');
  document.getElementById('mode-toggle').innerText=body.classList.contains('dark')?'Light Mode':'Dark Mode';
};

// ===== Notepad =====
function showNotepad(){
  document.getElementById('login-area').style.display='none';
  document.getElementById('verify-section').style.display='none';
  document.getElementById('notepad-area').style.display='flex';
  loadNotes();
}

function loadNotes(){
  const stored=localStorage.getItem(`notes_${currentUser.id}`);
  notes=stored?JSON.parse(stored):[];
  categories=new Set(['All']);
  notes.forEach(n=>categories.add(n.category||'General'));
  renderCategories();
  renderNotesList();
  renderTabs();
}

function saveNotes(){ localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(notes)); }

function renderCategories(){
  const catList=document.getElementById('category-list');
  catList.innerHTML='';
  Array.from(categories).forEach(c=>{
    const li=document.createElement('li');
    li.innerText=c;
    li.onclick=()=>renderNotesList(c);
    catList.appendChild(li);
  });
  const sel=document.getElementById('note-cat');
  sel.innerHTML='';
  Array.from(categories).forEach(c=>{
    const op=document.createElement('option');
    op.value=c; op.innerText=c;
    sel.appendChild(op);
  });
}

document.getElementById('add-cat-btn').onclick=()=>{
  const name=document.getElementById('new-cat').value.trim();
  if (!name) return;
  categories.add(name);
  renderCategories();
  document.getElementById('new-cat').value='';
};

document.getElementById('new-note-btn').onclick=createNewNote;
function createNewNote(){
  const n={id:Date.now(),title:'Untitled',content:'',category:'General',updated:new Date().toLocaleString()};
  notes.push(n); activeNoteId=n.id; renderTabs(); renderNotesList(); openNote(n.id); saveNotes();
}

function renderNotesList(filter='All'){
  const ul=document.getElementById('notes-list');
  ul.innerHTML='';
  const search=document.getElementById('search-note').value.toLowerCase();
  notes.filter(n=>(filter==='All'||n.category===filter)&&(n.title.toLowerCase().includes(search)||n.content.toLowerCase().includes(search)))
       .forEach(n=>{
    const li=document.createElement('li');
    li.innerText=n.title+' ('+(n.category||'General')+')';
    li.onclick=()=>openNote(n.id);
    ul.appendChild(li);
  });
}
document.getElementById('search-note').oninput=()=>renderNotesList();

function renderTabs(){
  const tabs=document.getElementById('note-tabs'); tabs.innerHTML='';
  notes.forEach(n=>{
    const b=document.createElement('button');
    b.innerText=n.title; b.classList.toggle('active',n.id===activeNoteId);
    b.onclick=()=>openNote(n.id);
    tabs.appendChild(b);
  });
}

function openNote(id){
  const n=notes.find(x=>x.id===id); if(!n) return;
  activeNoteId=n.id;
  document.getElementById('note-title').value=n.title;
  document.getElementById('note-content').value=n.content;
  document.getElementById('note-cat').value=n.category;
  document.getElementById('note-timestamp').innerText='Updated: '+n.updated;
  renderTabs();
}

function saveCurrentNote(){
  if (!activeNoteId) return createNewNote();
  const title=document.getElementById('note-title').value||'Untitled';
  const content=document.getElementById('note-content').value||'';
  const category=document.getElementById('note-cat').value||'General';
  notes=notes.map(n=>n.id===activeNoteId?{...n,title,content,category,updated:new Date().toLocaleString()}:n);
  categories.add(category); renderCategories(); renderNotesList(); renderTabs(); saveNotes();
  document.getElementById('note-timestamp').innerText='Updated: '+new Date().toLocaleString();
}

document.getElementById('save-note-btn').onclick=saveCurrentNote;
document.getElementById('note-title').oninput=saveCurrentNote;
document.getElementById('note-content').oninput=saveCurrentNote;
document.getElementById('note-cat').onchange=saveCurrentNote;

document.getElementById('delete-note-btn').onclick=()=>{
  if(!activeNoteId) return;
  notes=notes.filter(n=>n.id!==activeNoteId);
  activeNoteId=notes.length?notes[0].id:null;
  renderTabs(); renderNotesList();
  if(activeNoteId) openNote(activeNoteId);
  else {document.getElementById('note-title').value=''; document.getElementById('note-content').value='';}
  saveNotes();
};
