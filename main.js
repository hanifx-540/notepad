// ======= Data storage =======
let users = JSON.parse(localStorage.getItem('users') || '[]');
let currentUser = null;
let tempCode = null;
let notes = [];
let categories = new Set(['All']);
let activeNoteId = null;

// ======= Login / Register =======
const msg = (t)=> document.getElementById('login-msg').innerText = t;

document.getElementById('login-btn').onclick = () => {
  const identifier = document.getElementById('identifier').value.trim();
  const password = document.getElementById('password').value;
  if (!identifier || !password) return msg('সব ফিল্ড পূরণ করুন');

  let user = users.find(u => u.identifier === identifier);
  if (!user){
    user = {id: Date.now(), identifier, password};
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
  } else if (user.password !== password){
    return msg('পাসওয়ার্ড ভুল');
  }

  currentUser = user;
  tempCode = Math.floor(100000 + Math.random()*900000).toString();
  alert(`আপনার verification কোড: ${tempCode}`);
  document.getElementById('verify-section').style.display = 'block';
  msg('Verification কোড পাঠানো হয়েছে।')
};

document.getElementById('verify-btn').onclick = () => {
  const code = document.getElementById('verify-code').value.trim();
  if (code === tempCode){
    msg('');
    tempCode = null;
    showNotepad();
  } else {
    msg('ভুল কোড, আবার চেষ্টা করুন।');
  }
};

document.getElementById('logout-btn').onclick = () => {
  currentUser = null; notes = []; categories = new Set(['All']); activeNoteId = null;
  document.getElementById('notepad-area').style.display = 'none';
  document.getElementById('login-area').style.display = 'block';
};

// ======= Notepad functions =======
function showNotepad(){
  document.getElementById('login-area').style.display = 'none';
  document.getElementById('notepad-area').style.display = 'block';
  loadNotes();
}

function loadNotes(){
  const stored = localStorage.getItem(`notes_${currentUser.id}`);
  notes = stored ? JSON.parse(stored) : [];
  categories = new Set(['All']);
  notes.forEach(n=>categories.add(n.category || 'General'));
  renderCategories();
  renderNotesList();
  renderTabs();
}

function saveNotes(){
  localStorage.setItem(`notes_${currentUser.id}`, JSON.stringify(notes));
}

function renderCategories(){
  const catList = document.getElementById('category-list');
  catList.innerHTML = '';
  Array.from(categories).forEach(c=>{
    const li = document.createElement('li');
    li.innerText = c;
    li.dataset.cat = c;
    li.onclick = ()=>{
      [...catList.children].forEach(x=>x.classList.remove('active'));
      li.classList.add('active');
      renderNotesList(c);
    };
    if (c==='All') li.classList.add('active');
    catList.appendChild(li);
  });

  const sel = document.getElementById('note-cat');
  sel.innerHTML = '';
  Array.from(categories).forEach(c=>{
    const op = document.createElement('option');
    op.value = c;
    op.innerText = c;
    sel.appendChild(op);
  });
}

document.getElementById('add-cat-btn').onclick = () => {
  const name = document.getElementById('new-cat').value.trim();
  if (!name) return;
  categories.add(name);
  document.getElementById('new-cat').value = '';
  renderCategories();
};

document.getElementById('new-note-btn').onclick = () => {
  createNewNote();
};

function createNewNote(){
  const newNote = {id: Date.now(), title:'Untitled', content:'', category:'General', updated: new Date().toLocaleString()};
  notes.push(newNote);
  activeNoteId = newNote.id;
  renderTabs();
  renderNotesList();
  openNote(activeNoteId);
  saveNotes();
}

function renderNotesList(filterCat='All'){
  const ul = document.getElementById('notes-list');
  ul.innerHTML = '';
  const searchText = document.getElementById('search-note').value.toLowerCase();
  const list = notes.filter(n => (filterCat==='All' || n.category===filterCat) && (n.title.toLowerCase().includes(searchText) || n.content.toLowerCase().includes(searchText)));
  list.forEach(n=>{
    const li = document.createElement('li');
    li.innerText = n.title + ' — ' + (n.category||'General');
    li.onclick = ()=> openNote(n.id);
    ul.appendChild(li);
  });
}

document.getElementById('search-note').oninput = ()=>renderNotesList();

function renderTabs(){
  const tabs = document.getElementById('note-tabs');
  tabs.innerHTML = '';
  notes.forEach(n=>{
    const btn = document.createElement('button');
    btn.innerText = n.title;
    btn.classList.toggle('active', n.id===activeNoteId);
    btn.onclick = ()=>openNote(n.id);
    tabs.appendChild(btn);
  });
}

function openNote(id){
  const n = notes.find(x=>x.id===id);
  if (!n) return;
  activeNoteId = n.id;
  document.getElementById('note-title').value = n.title;
  document.getElementById('note-content').value = n.content;
  document.getElementById('note-cat').value = n.category || 'General';
  document.getElementById('note-timestamp').innerText = 'Updated: ' + n.updated;
  renderTabs();
}

document.getElementById('save-note-btn').onclick = saveCurrentNote;
document.getElementById('note-title').oninput = autoSave;
document.getElementById('note-content').oninput = autoSave;
document.getElementById('note-cat').onchange = autoSave;

function saveCurrentNote(){
  if (!activeNoteId) return createNewNote();
  const title = document.getElementById('note-title').value || 'Untitled';
  const content = document.getElementById('note-content').value || '';
  const category = document.getElementById('note-cat').value || 'General';
  notes = notes.map(n=>n.id===activeNoteId ? {...n,title,content,category,updated:new Date().toLocaleString()} : n);
  categories.add(category);
  renderCategories();
  renderNotesList();
  renderTabs();
  document.getElementById('note-timestamp').innerText = 'Updated: ' + new Date().toLocaleString();
  saveNotes();
}

function autoSave(){ if(activeNoteId) saveCurrentNote(); }

document.getElementById('delete-note-btn').onclick = () => {
  if (!activeNoteId) return alert('নোট নির্বাচন করুন');
  notes = notes.filter(n => n.id !== activeNoteId);
  activeNoteId = notes.length ? notes[0].id : null;
  renderTabs();
  renderNotesList();
  if(activeNoteId) openNote(activeNoteId);
  else {document.getElementById('note-title').value=''; document.getElementById('note-content').value='';}
  saveNotes();
};
