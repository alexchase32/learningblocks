async function fetchStudents(){
  const res = await fetch('api.php?action=get_students');
  return await res.json();
}

function populateStudentSelects(students){
  const s1 = document.getElementById('student1');
  const s2 = document.getElementById('student2');
  students.forEach(stu=>{
    const opt1=document.createElement('option');
    opt1.value=stu.id; opt1.textContent=stu.name+' ('+stu.id+')';
    const opt2=opt1.cloneNode(true);
    s1.appendChild(opt1); s2.appendChild(opt2);
  });
}

async function loadPairs(){
  const res = await fetch('data/pairs.json');
  const pairs = await res.json();
  const list = document.getElementById('pairs');
  list.innerHTML='';
  pairs.forEach(p=>{
    const li=document.createElement('li');
    li.className='list-group-item';
    li.textContent=p[0]+' ↔ '+p[1];
    list.appendChild(li);
  });
}

async function loadGroups(){
  const res = await fetch('api.php?action=get_groups');
  const groups = await res.json();
  const container=document.getElementById('currentGroups');
  container.innerHTML='';
  groups.forEach(g=>{
    const div=document.createElement('div');
    div.textContent=g.name+': '+(g.members.join(', ')||'no members');
    container.appendChild(div);
  });
}

document.getElementById('activityForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const title=document.getElementById('actTitle').value;
  const desc=document.getElementById('actDesc').value;
  await fetch('api.php?action=add_activity',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:'title='+encodeURIComponent(title)+'&description='+encodeURIComponent(desc)
  });
  document.getElementById('actTitle').value='';
  document.getElementById('actDesc').value='';
});

document.getElementById('pairBtn').addEventListener('click', async ()=>{
  const s1=document.getElementById('student1').value;
  const s2=document.getElementById('student2').value;
  if(s1===s2) return alert('Choose different students');
  await fetch('api.php?action=pair_chat',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:'student1='+encodeURIComponent(s1)+'&student2='+encodeURIComponent(s2)
  });
  loadPairs();
});

document.getElementById('gameForm').addEventListener('submit', async e=>{
  e.preventDefault();
  const names=document.getElementById('groupNames').value.split(',').map(n=>n.trim()).filter(n=>n);
  await fetch('api.php?action=start_game',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded'},
    body:names.map(n=>'groups[]='+encodeURIComponent(n)).join('&')
  });
  loadGroups();
});

(async ()=>{
  const students=await fetchStudents();
  populateStudentSelects(students);
  loadPairs();
  loadGroups();
})();
