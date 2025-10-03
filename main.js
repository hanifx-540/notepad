// ===== STORAGE =====
let users = JSON.parse(localStorage.getItem('users') || '[]');  
let currentUser = null;  
let tempCode = null;  
let notes = [];  
let categories = new Set(['All']);  
let socialMedia = ["Facebook","Instagram","Twitter","LinkedIn","WhatsApp","TikTok","YouTube","Snapchat","Pinterest","Reddit","Discord"];
let socialData = {};

// ===== MSG =====
const msg = t => document.getElementById('login-msg').innerText = t;

// ===== LOGIN =====
document.getElementById('login-btn').onclick = ()=>{
  const idf = document.getElementById('identifier').value.trim();
  const pw = document.getElementById('password').value;
  if(!idf || !pw) return msg('সব ফিল্ড পূরণ করুন');

  let user = users.find(u=>u.identifier===idf);
  if(!user){ // create
    user={id:Date.now(), identifier:idf, password:pw};
    users.push(user);
    localStorage.setItem('users',JSON.stringify(users));
  }else if(user.password!==pw){ return msg('পাসওয়ার্ড ভুল'); }

  currentUser = user;
  tempCode = Math.floor(100000 + Math.random()*900000).toString();
  alert(`আপনার verification কোড: ${tempCode}`);
  document.getElementById('verify-section').style.display='block';
  msg('Verification কোড পাঠানো হয়েছে।');
};

document.getElementById('verify-btn').onclick=()=>{
  const code=document.getElementById('verify-code').value.trim();
  if(code===tempCode){ tempCode=null; msg(''); showNotepad(); }
  else msg('ভুল কোড, আবার চেষ্টা করুন।');
};

// ===== LOGOUT =====
document.getElementById('logout-btn').onclick=()=>{
  currentUser=null; notes=[]; categories=new Set(['All']); socialData={};
  document.getElementById('notepad-area').style.display='none';
  document.getElementById('login-area').style.display='block';
};

// ===== DARK MODE =====
const body=document.body;
const modeBtn=document.getElementById('mode-toggle');
modeBtn.onclick=()=>{
  body.classList.toggle('dark');
  modeBtn.innerText=body.classList.contains('dark')?'Light Mode':'Dark Mode';
};

// ===== NOTEPAD =====
function showNotepad(){
  document.getElementById('login-area').style.display='none';
  document.getElementById('notepad-area').style.display='block';
  loadNotes();
  loadSocialMedia();
}

// ===== GENERAL NOTES =====
function loadNotes(){
  const stored = localStorage.getItem(`notes_${currentUser.id}`);
  notes = stored ? JSON.parse(stored) : [];
  renderNotes();
}

function renderNotes(){
  const list=document.getElementById('notes-list');
  list.innerHTML='';
  notes.forEach((n,i)=>{
    const li=document.createElement('li');
    li.innerText=n.text.substring(0,30)+'...';
    li.style.cursor='pointer';
    li.onclick=()=>{document.getElementById('note-text').value=n.text;document.getElementById('note-category').value=n.category||'';}
    list.appendChild(li);
  });
}

document.getElementById('save-note-btn').onclick=()=>{
  const txt=document.getElementById('note-text').value.trim();
  const cat=document.getElementById('note-category').value.trim()||'General';
  if(!txt) return alert('Note খালি থাকতে পারবে না');
  notes.push({text:txt,category:cat});
  localStorage.setItem(`notes_${currentUser.id}`,JSON.stringify(notes));
  renderNotes();
  document.getElementById('note-text').value='';
  document.getElementById('note-category').value='';
};

// ===== SOCIAL MEDIA =====
function loadSocialMedia(){
  const container=document.getElementById('social-container');
  container.innerHTML='';
  const stored = localStorage.getItem(`social_${currentUser.id}`);
  socialData = stored ? JSON.parse(stored) : {};

  socialMedia.forEach(name=>{
    if(!socialData[name]) socialData[name]={username:'',password:'',note:''};
    const card=document.createElement('div');
    card.className='social-card';
    card.innerHTML=`
      <h4>${name}</h4>
      <input type="text" placeholder="Username" value="${socialData[name].username}" class="sm-username">
      <input type="text" placeholder="Password" value="${socialData[name].password}" class="sm-password">
      <textarea placeholder="Your Note">${socialData[name].note}</textarea>
      <button>Save</button>
    `;
    const btn=card.querySelector('button');
    btn.onclick=()=>{
      const username=card.querySelector('.sm-username').value;
      const password=card.querySelector('.sm-password').value;
      const note=card.querySelector('textarea').value;
      socialData[name]={username,password,note};
      localStorage.setItem(`social_${currentUser.id}`,JSON.stringify(socialData));
      alert(`${name} data saved!`);
    };
    container.appendChild(card);
  });
      }
