const QUESTIONS=[{"id": 1, "question": "Рассказчик уехал за границу, когда ему было:", "options": ["лет двадцать", "лет двадцать пять", "лет двадцать семь", "лет тридцать"], "correct": "B"}, {"id": 2, "question": "Рассказчик уехал за границу, чтобы:", "options": ["посмотреть на мир божий", "получить хорошее образование", "вылечиться от хронической болезни", "встретиться с богатым дядей"], "correct": "A"}, {"id": 3, "question": "Рассказчик утверждает, что смех без причины —", "options": ["признак дурачины", "признак недалёкого ума", "радость для дивчины", "лучший смех на свете"], "correct": "D"}, {"id": 4, "question": "Гагин хотел посвятить себя:", "options": ["музыке", "живописи", "бизнесу", "семейной жизни"], "correct": "B"}, {"id": 5, "question": "«Что за ... эта девушка!» – говорит об Асе Н. Н.:", "options": ["лиса", "обезьяна", "павлин", "хамелеон"], "correct": "D"}, {"id": 6, "question": "Ася была моложе Гагина:", "options": ["на десять лет с лишним", "на семь лет", "на три года", "на два года"], "correct": "B"}, {"id": 7, "question": "Отец Гагина:", "options": ["умер от смертельной болезни", "умер от пьянства", "сгорел во время пожара", "был убит крестьянами"], "correct": "A"}, {"id": 8, "question": "Асю по-настоящему звали:", "options": ["Настасья Павловна", "Настасья Петровна", "Анна Никитична", "Анна Николаевна"], "correct": "D"}, {"id": 9, "question": "Рассказчик хранит как память об Асе её:", "options": ["записочки", "цветок гераниума", "платочек", "флакончик с духами"], "correct": "B"}, {"id": 10, "question": "Рассказчик познакомился с Асей в:", "options": ["мае", "июне", "июле", "августе"], "correct": "B"}, {"id": 11, "question": "В каком городе родился И. С. Тургенев?", "options": ["В Москве", "В Орле", "В Санкт-Петербурге", "В Мценске"], "correct": "B"}, {"id": 12, "question": "Прототипом какого персонажа в повести «Муму» стала мать писателя Варвара Петровна?", "options": ["Барыни", "Прачки Татьяны", "Кастелянши", "Кухарки"], "correct": "A"}, {"id": 13, "question": "С какой французской певицей в 1843 году произошла судьбоносная встреча Тургенева?", "options": ["С Полиной Виардо", "С Мари Дюплесси", "С Колетт Дюваль", "С Эдит Пиаф"], "correct": "A"}, {"id": 14, "question": "В каком году была опубликована повесть «Ася»?", "options": ["1843 г.", "1857 г.", "1858 г.", "1883 г."], "correct": "C"}, {"id": 15, "question": "Как охарактеризована композиция повести «Ася» в презентации?", "options": ["«Рассказ в рассказе»", "Дневник героя", "Роман в письмах", "Семейная хроника"], "correct": "A"}];
let student={firstName:"",lastName:""};

const $=id=>document.getElementById(id);
$("startBtn").onclick=()=>{
  const first=$("firstName").value.trim(), last=$("lastName").value.trim();
  if(!first||!last){$("startError").textContent="Введите имя и фамилию.";return}
  student={firstName:first,lastName:last};
  $("start").classList.add("hidden"); $("quiz").classList.remove("hidden"); renderQuestions();
};

function renderQuestions(){
  $("counter").textContent=`15 вопросов`;
  $("progressText").textContent="0 / 15";
  $("questions").innerHTML=QUESTIONS.map((q,i)=>`
    <div class="question">
      <h3>${i+1}. ${escapeHtml(q.question)}</h3>
      ${q.options.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${String.fromCharCode(65+j)}"><span>${String.fromCharCode(65+j)}) ${escapeHtml(o)}</span></label>`).join("")}
    </div>`).join("");
  document.querySelectorAll('input[type=radio]').forEach(el=>el.addEventListener("change",updateProgress));
}
function updateProgress(){
 const n=QUESTIONS.filter((_,i)=>document.querySelector(`input[name=q${i}]:checked`)).length;
 $("progressText").textContent=`${n} / 15`; $("progressBar").style.width=`${n/15*100}%`;
}
$("submitBtn").onclick=async()=>{
 $("quizError").textContent="";
 const answers=QUESTIONS.map((_,i)=>document.querySelector(`input[name=q${i}]:checked`)?.value||null);
 if(answers.includes(null)){$("quizError").textContent="Ответьте на все 15 вопросов.";return}
 const score=answers.reduce((s,a,i)=>s+(a===QUESTIONS[i].correct?1:0),0);
 const payload={firstName:student.firstName,lastName:student.lastName,answers,score,total:15,submittedAt:new Date().toISOString()};
 try{await fetch("/api/results",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})}catch(e){}
 showResult(payload);
};
function showResult(p){
 $("quiz").classList.add("hidden"); $("result").classList.remove("hidden");
 $("result").innerHTML=`<div class="resultCard resultHead"><div class="muted">${escapeHtml(p.firstName+" "+p.lastName)}</div><h2>Результат</h2><div class="score">${p.score} / 15</div><p>${Math.round(p.score/15*100)}% правильных ответов</p></div>
 <div class="resultCard"><h2>Разбор ответов</h2>${QUESTIONS.map((q,i)=>{
   const ok=p.answers[i]===q.correct;
   return `<div class="review ${ok?"correct":"wrong"}"><strong>${i+1}. ${escapeHtml(q.question)}</strong><div class="answerLine">Ваш ответ: <span class="${ok?"correctText":"wrongText"}">${escapeHtml(q.options[letterIndex(p.answers[i])]||"—")}</span></div>${ok?"":"<div class='answerLine'>Правильный ответ: <span class='correctText'>"+escapeHtml(q.options[letterIndex(q.correct)])+"</span></div>"}</div>`;
 }).join("")}</div>
 <div class="resultCard"><p class="muted">Результат сохранён. Для нового прохождения обновите страницу.</p></div>`;
}
function letterIndex(l){return l?l.charCodeAt(0)-65:-1}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
