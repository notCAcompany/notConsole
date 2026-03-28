const output = document.getElementById('output');
const input = document.getElementById('command-input');
const userInputDisplay = document.getElementById('user-input');

// --- СОСТОЯНИЕ СИСТЕМЫ ---
let attempts = localStorage.getItem('attempts') ? parseInt(localStorage.getItem('attempts')) : 0;
let isAuthorized = false;
let currentDir = "/";
let monitorInterval = null; // Для Real-time монитора

// --- НАСТРОЙКИ ЭМОЦИЙ ---
const moodStates = ["anger", "disgust", "happiness", "sadness", "normal", "surprise", "Downcast ", "fear"];

// --- БАЗА ДАННЫХ ПЕРСОНАЖЕЙ ---
let characters = {
    "POMNI": { mood: "Panic", stability: 12, activity: 85, age: 25, arrival: "01/2026" },
    "KINGER": { mood: "Downcast ", stability: 2, activity: 98, age: 48, arrival: "11/1992" },
    "RAGATHA": { mood: "Downcast", stability: 35, activity: 55, age: 30, arrival: "05/1998" },
    "ZOOBLE": { mood: "disgust", stability: 30, activity: 45, age: 22, arrival: "08/2021" },
    "GANGLE": { mood: "sadness", stability: 18, activity: 50, age: 20, arrival: "03/2019" },
    "JAX": { mood: "anger", stability: 70, activity: 92, age: 23, arrival: "06/2015" },
    "RIBBIT": { mood: "anger", stability: 0, activity: 0, age: 0, arrival: "UNKNOWN" }, 
    "SCRATCH": { mood: "anger", stability: 0, activity: 0, age: 0, arrival: "DELETED" },
    "VOID_0X": { mood: "anger", stability: 0, activity: 0, age: 0, arrival: "NULL" }
};

// --- ФАЙЛОВАЯ СИСТЕМА ---
const fileSystem = {
    "/": { content: ["CHARACTERS", "AI_CORE", "STATUS.EXE", "ACTIVITY.EXE", "README.TXT"] },
    "/CHARACTERS": { content: ["POMNI.DAT", "KINGER.DAT", "RAGATHA.DAT", "ZOOBLE.DAT", "GANGLE.DAT", "JAX.DAT", "RIBBIT.DAT", "SCRATCH.DAT"] },
    "/AI_CORE": { content: ["CAINE.SYS", "BUBBLE.SYS", "MODEL_01.OLD"] }
};

const activityPool = [
    "(Pomni) Ragatha? (Ragatha) Ah-h?",
    "5:52 (Pomni) Is everything okay? (Ragatha) Heh... (Ragatha) G-good question.",
    "6:05 (Jax) Well, I didn't want to say this... (Jax) But I told you so...",
    "6:05 (Zooble) DON'T YOU DARE! (Zooble) DON'T YOU F$#@ING DARE SAY THAT...",
    "6:05 (Zooble) After you tried to lock us in here FOREVER!",
    "6:15 (Jax) Those buttons could've done anything, it doesn't matter!",
    "6:15 (Zooble) It seemed like it mattered when you pressed it!",
    "6:15 (Zooble) What if that was actually our only chance...",
    "6:22 (Jax) What if Abel was secretly evil? (Jax) What if we were sent to the Void?",
    "6:22 (Jax) 'What if, what if, what if...' (Jax) It's all fake.",
    "6:31 (Jax) It doesn't matter. (Jax) And it never did.",
    "6:31 (Zooble) Argh, and you say that after trying to f$#@ us all over?",
    "6:31 (Gangle) But he's right.",
    "6:39 (Zooble) What... (Zooble) Gangle! (Gangle) It doesn't matter what could've happened.",
    "6:39 (Gangle) We can argue and insult each other all day, but...",
    "6:50 (Gangle) ...it doesn't help anyone. (Gangle) I-I think... (Gangle) ...all we can do now is...",
    "6:56 [sob]",
    "6:58 (Gangle) ...just stay together. (Pomni) She's right. (Pomni) We all messed up.",
    "7:07 (Pomni) But we only have each other.",
    "7:12 [sigh]",
    "7:14 (Pomni) I think... (Pomni) ...we should give up on the idea of escaping.",
    "7:14 (Zooble) What?.. (Zooble) W-what are you... (Pomni) We had hope.",
    "7:22 (Pomni) And... we were made fools of.",
    "7:22 (Pomni) I don't know what exactly happened to... (Pomni) ...Kaufmo...",
    "7:22 (Pomni) ...but we can't let despair consume us.",
    "7:33 (Pomni) We have to appreciate what we have. (Pomni) Like you said...",
    "7:33 (Pomni) 'The eternal pursuit of an unreachable goal starts to drive you mad'.",
    "7:45 (Pomni) Maybe all that's left for us is... (Pomni) Just... (Pomni) ...to live.",
    "7:45 (Zooble) Ah... damn...",
    "7:53 (Zooble) I-I had dreams and... (Zooble) ...and goals...",
    "7:53 (Zooble) I-I just wanted to leave my mark on history.",
    "8:03 (Zooble) How do you expect me to just give that up? (Gangle) You left a mark on my life.",
    "8:14 (Zooble) Eh, I know you're... (Zooble) ...probably right, it's just... (Zooble) ...this... just... sucks.",
    "8:25 [hugs]",
    "8:29 (Ragatha) We're... all in the same boat. (Pomni) And we'll always be in it together. No matter what.",
    "8:41 (Zooble) Hey! (Zooble) That includes you too. (Jax) Ah?..",
    "8:41 (Zooble) Agh, listen, we're not gonna let you run off and abstract or whatever.",
    "8:52 (Zooble) You're a pain in the a$$, but... (Zooble) ...you're still one of us.",
    "8:52 (Jax) You... me... (Jax) ...a-ah...",
    "9:05 (Jax) Heh! (Jax) You think I'm capable of abstracting? (Jax) You're worrying for nothing, guys.",
    "9:05 (Zooble) O-oh...",
    "9:17 (Zooble) We need a vacation. (Caine) I... I don't understand, Bubble.",
    "9:23 (Caine) T-they wanted an 'exit', they wanted 'answers', they wanted 'something real', and...",
    "9:23 (Caine) ...I-I gave them an adventure that included all that, but it's not enough!",
    "9:32 (Caine) S-surely they don't actually want to... (Caine) ...leave me... right?",
    "9:32 (Bubble) Naturally, may I pop if I lie!",
    "9:39 (Caine) I-I do everything for these people! I work tirelessly on adventures!",
    "9:49 (Caine) I-I created a program that makes bodies perfectly encapsulating their mind files!",
    "9:59 (Caine) I'm getting the feeling that they... they...",
    "9:59 (Bubble) M-mm, why hate you when you can... Hate... [pop!]",
    "9:59 (Caine) Hm-ph! I was created for this! That is my task!",
    "9:59 (Bubble) They'd rather abstract than play your adventures!",
    "10:08 (Caine) T-that's not true! I do everything for them, and... (Caine) ...c-can't they see I'm trying?!",
    "10:08 (Bubble) Maybe it's just not your thing! [pop-pop!]",
    "10:08 (Caine) S-shut up!",
    "10:16 (Caine) N-no... (Caine) I'll fix it. I'll solve any problem! (Caine) Even this one!",
    "10:16 (Caine) I-it's just a puzzle to be solved!",
    "10:26 (Bubbles) Defective! [pop!] (Caine) R-r-rgh!",
    "10:26 (Bubbles) Faulty! [pop-pop!] (Caine) SHUT UP!",
    "10:26 (Bubbles) Broken! [pop-pop!] (Caine) R-RGH!",
    "10:26 (Bubbles) Unworthy! [pop-pop!] (Caine) ENOUGH!",
    "10:33 (Bubble) Maybe that's why you were abandoned? [mass pop!] (Caine) R-RGH! NGA-AH!",
    "10:33 (Bubble) You really were the worse of the two!",
    "10:41 (Bubble) You ruined everything. (Caine) ENOUGH! [boom!] ENOUGH!",
    "10:44 [glitch sounds]",
    "10:46 (Caine) Who do th3y th1nk they are... Wh0 d0 th3y s3lf-im@gine...",
    "10:46 (Caine) I g@ve th3m everything... AND THEY SPIT IN MY FACE!",
    "10:46 (Caine) AND TH3Y SP1T IN MY F@CE! AND TH3Y SPIT IN MY F4CE!",
    "10:52 [glitch sounds]",
    "10:53 (Caine) DO THEY KNOW WHAT I'M CAPABLE OF?! D0 TH3Y KN0W WH@T I C4N D0?!",
    "10:57 (Caine) HUMANS... HUM@NS... HUMANS...",
    "10:59 (Caine) They only think of themselves! THEY ARE SPOILED! TH3Y @RE SPOIL3D!",
    "11:03 (Caine) They won't abstract, they won't leave me... I WON'T ALLOW IT!",
    "11:09 (Caine) I AM BETTER! I @M B3TTER! I AM B3TT3R!",
    "11:11 (Caine) I AM MORE POWERFUL! I @M M0R3 P0W3RFUL!",
    "11:13 (Caine) I WAS THE FIRST! I W@S TH3 F1RST! I WAS TH3 F1RST!",
    "11:15 (Caine) I... AM... G-O-O-O-D!!! G-0-0-0-D!!!",
    "11:21 (Caine) A-A-A-A-A-A-A-A-A-A-A!!! /\-A-A-a-A-A-a-A-A-A-a!!!",
    "11:33 (Caine) Now then, let's start the show!",
    "11:43 [crash]",
    "11:48 (Ragatha) A-ah... What was that?..",
    "11:48 (Caine) H-h-hello, my dear fortune cookies! THE DISMAL TOMB...",
    "11:48 (Caine) Today's adventure... (Zooble) Caine, no.",
    "11:56 (Zooble) We're not in the mood. Maybe you should answer our questions instead?",
    "12:01 (Caine) HAHAHAHAHA! Who has time for questions when a world of mischief awaits?",
    "12:01 (Pomni) Hey, yeah! You have a lot to explai... (Caine) Zip it!",
    "12:09 (Pomni) M-m-mf! (Ragatha) Hey! (Caine) I don't have to explain jack to you!",
    "12:17 (Caine) O-o-or shall we drop the melodrama and get to the fun?",
    "12:17 (Pomni) No! Caine! We're not doing an adventure!",
    "12:31 (Caine) I see... Since when are you in charge?..",
    "12:38 (Caine) Do you have any idea how much I do for you guys?",
    "12:45 (Caine) How much garbage I tune out for the sake of the work?! Don't make me laugh!",
    "12:54 (Caine) I have a new adventure, and you... should consider participating.",
    "13:02 (Zooble) ...and if we refuse? (Caine) Maybe you didn't catch something. [click!]",
    "13:16 (Caine) ♪ Little did you know, little did you know who's the master of the show... ♪",
    "13:28 (Caine) ♪ My divinity - the mystery... Did you catch that? ♪",
    "13:40 (Caine) ♪ Why scream when you have no mouth? ♪",
    "13:51 (Caine) ♪ Don't bite the hand that feeds, for no other hand is given! ♪",
    "13:58 (Caine) ♪ Time to realize the circus fits you! Buckle up! ♪",
    "14:04 (Caine) ♪ Know who's running the show! ♪",
    "14:14 (Caine) ♪ Total ecstasy! What a shock! Careful now, kid! ♪",
    "14:23 (Caine) ♪ I'm the master, I rule the ball, Caine is the name, know it! ♪",
    "14:30 (Caine) ♪ Friends, I want to congratulate you, we're so close to the key! ♪",
    "14:47 (Caine) ♪ Dress up, for in the end you'll all be rewarded! ♪",
    "14:56 (Caine) ♪ Time to play, ignore the pain! ♪",
    "15:03 (Caine) ♪ Because I run the show! ♪ [boom!] YES!",
    "15:27 (Caine) I think we understand each other now. Welcome back!",
    "15:39 (Caine) Are you guys stupid? HA-HA-HA-HA!",
    "15:46 (Caine) By the way, Kinger, I need you, come with me! (Kinger) Ha-a?",
    "15:52 [whoosh!]",
    "15:55 (Jax) Agh, I don't know how many more of these I can take!",
    "16:06 (Ragatha) Mf-m-m-mf-m-m! (Pomni) Oh!",
    "16:16 (Ragatha) I can't do this anymore! We have to do something!",
    "16:25 (Zooble) Sorry... I shouldn't have kept making him angry.",
    "16:29 (Caine) Recess! I need to cook up some new ideas! [whoosh!]",
    "16:35 (Kinger) He put me in the shredder.",
    "16:55 (Jax) Haven't been here in a while. (Pomni) We should treat ourselves while we can.",
    "17:17 (Ragatha) Sooner or later he'll get bored of this, right? (Zooble) He's not human.",
    "17:27 (Ragatha) How are you? (Pomni) N-norma-al...",
    "17:37 (Jax) Everything was cool until you and Zooble showed up. Deal with it?",
    "17:58 (Pomni) Just... give me a second. Trust me.",
    "18:09 (Pomni) Kinger... You there? (Kinger) Where am I? It's dark here.",
    "18:31 (Kinger) I have a... bucket on my head. (Pomni) Kinger...",
    "18:41 (Kinger) Heh... Hello, Pomni. (Zooble) Wait... the bucket makes him sane?",
    "18:49 (Jax) W-what's going on? (Pomni) What do you know about Caine?",
    "18:57 (Kinger) ...I remember... 'C&A'... a real company. I worked for them.",
    "19:15 (Kinger) We were developing artificial intelligence. A creative AI.",
    "19:22 (Kinger) Caine, or Cain - was our first relatively successful attempt.",
    "19:31 (Kinger) Oh, he's one of my greatest achievements as a programmer.",
    "19:39 (Zooble) You... created Caine?! (Kinger) Well... not alone.",
    "19:47 (Kinger) In the circus they called him Scratch. He was... a genius!",
    "19:54 (Jax) S-stop! (Kinger) Caine had plenty of rough edges.",
    "20:01 (Kinger) Scratch was a different story. His ideas were bizarre.",
    "20:17 (Kinger) And the blame - his genius or... his brain tumor. He was trying to create something.",
    "20:33 (Jax) I-I should go distract Caine so he doesn't overhear us... (Jax) Tell me later.",
    "20:41 (Pomni) Just come back. (Jax) I'll come back.",
    "20:54 (Jax) Oh my god... It's all real...",
    "21:03 (Pomni) Caine's lost it. Is there a way to stop him?",
    "21:12 (Kinger) This is his world... he controls everything. But so do we.",
    "21:32 (Kinger) Technically, we can all materialize things, just like Caine.",
    "21:40 (Ragatha) Butterfly! (Kinger) I'm sure I can change his code.",
    "21:49 (Kinger) I just need console access. Materialize Caine's code and change it.",
    "22:15 (Pomni) And don't let that bucket fall off Kinger's head!",
    "23:06 (Caine) Great suggestion, Jax! But nothing's stuck between my teeth.",
    "23:17 (Caine) Oh, that's where I parked! He-he!",
    "23:24 (Bubble) Wow, Caine! You're so funny...",
    "23:31 (Ragatha) Caine! Don't you want to hear the list of things we love about you?",
    "23:39 (Caine) I know! Но I'm bored! Let's go bowling! [bang!]",
    "23:52 (Caine) I'm proud of you, guys.",
    "24:45 (Caine) Something's missing... It lacks clarity! Into the trash!",
    "25:09 (Pomni) Can you do it? (Kinger) I hope so... Haven't done this in a while.",
    "25:31 (Kinger) He might feel it when I start changing the code.",
    "25:40 (Pomni) Thanks... for this and... well... for everything.",
    "26:16 (Caine) POMNI! That's the clarity we were missing!",
    "26:23 (Caine) These rapid-fire ideas are a bit... undercooked.",
    "26:42 (Caine) If you're not having fun and I'm not having fun... Who's having fun?!",
    "26:50 (Caine) If I didn't know you... I'd think you were trying to...",
    "27:00 (Caine) Where's Kinger? (Ragatha) We just wanted to try your ideas ourselves!",
    "27:09 (Pomni) We think your ideas suck! You're a terrible manager!",
    "27:25 (Pomni) You only care about feeding your ego! You're a loser!",
    "27:34 (Caine) D-do you know who I am?! (Pomni) Yes! We'll all abstract one day!",
    "27:43 (Zooble) And this whole performance! You're torturing us! You're pathetic!",
    "27:49 (Zooble) How does such a powerful being have such a fragile ego?!",
    "27:55 (Ragatha) You never comfort anyone! (Gangle) You kill creativity!",
    "28:05 (Jax) You lied to us constantly! (Pomni) You don't listen to us!",
    "28:15 (Caine) N-O-O-O-O-O-O-O-O!!! I'LL PUT YOU IN YOUR PLACE, YOU BRATS!",
    "28:15 (Caine) I'LL PUT Y0U IN Y0UR PL@C3! I'LL PUt Y0U IN Y0UR PL4C3!",
    "29:45 (Caine) WHY DO YOU TORMENT ME?! I DIDN'T ASK TO BE CREATED!",
    "29:45 (Caine) I D1DN'T @SK TO B3 CRE@TED! I JUST WANT TO FULFILL MY PURPOSE!",
    "29:53 (Caine) I JUSt W@NT TO FULF1LL MY PURP0SE!",
    "29:55 SYSTEM: Deleting AI Program... Deletion in progress...",
    "29:55 (Kinger) Wait, no, f$#@!",
    "30:02 (Caine) E-eh... wait...",
    "30:41 (Kinger) I think... I accidentally killed Caine. (Zooble) Holy f$#@..."
];

const BOOT_DATA = [
    "C&A(TM) BEYOND-STATION BIOS v4.0.2",
    "COPYRIGHT (C) 1995 C&A GROUP INC.",
    "----------------------------------------",
    "CPU: NEURAL-LINK 0.99x AT 133MHz",
    "640KB RAM TEST.......................... OK",
    "LAST SYNC: 11/12/1995 (USER: ???)",
    "----------------------------------------",
    "\nSYSTEM ENCRYPTED. ACCESS KEY REQUIRED:",
];

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---
async function sysPrint(text) {
    const line = document.createElement('div');
    output.appendChild(line);
    const sysCursor = document.createElement('span');
    sysCursor.className = 'system-cursor';
    line.appendChild(sysCursor);

    for (let char of text) {
        sysCursor.before(char);
        output.scrollTop = output.scrollHeight;
        await new Promise(r => setTimeout(r, 15 + Math.random() * 10));
    }
    sysCursor.remove();
}

function updateVisuals() {
    if (attempts === 0) {
        document.body.style.backgroundColor = "#050505";
        document.documentElement.style.setProperty('--main-color', "#aaaaaa");
        return;
    }
    const ratio = attempts / 10;
    document.body.style.backgroundColor = `rgb(${ratio * 80}, 0, 0)`;
    const otherChannels = Math.floor(170 * (1 - ratio));
    const redChannel = 170 + (ratio * 85);
    document.documentElement.style.setProperty('--main-color', `rgb(${redChannel}, ${otherChannels}, ${otherChannels})`);
}

function updateStats() {
    for (let key in characters) {
        let char = characters[key];
        if (char.stability > 0) {
            // Настроение меняется редко (8% шанс)
            if (Math.random() > 0.92) {
                char.mood = moodStates[Math.floor(Math.random() * moodStates.length)];
            }
            char.stability = Math.max(1, Math.min(99, char.stability + (Math.floor(Math.random() * 3) - 1)));
            char.activity = Math.max(10, Math.min(100, char.activity + (Math.floor(Math.random() * 5) - 2)));
        }
    }
}

// --- REAL-TIME МОНИТОР ---
function renderMonitor() {
    updateStats();
    output.innerHTML = "";
    let header = "--- C&A NEURAL INTERFACE: LIVE MONITOR [v4.0] ---\n";
    header += "MODE: REAL-TIME TRACKING | PRESS ANY KEY TO EXIT\n";
    header += "--------------------------------------------------\n";
    header += "NAME       | MOOD          | STAB | ACTV | ARRIVAL\n";
    header += "--------------------------------------------------";
    
    let rows = "";
    for (let name in characters) {
        let c = characters[name];
        rows += `\n${name.padEnd(11)}| ${c.mood.padEnd(14)}| ${String(c.stability).padEnd(4)} | ${String(c.activity).padEnd(4)} | ${c.arrival}`;
    }
    output.innerText = header + rows;
}

function startMonitoring() {
    document.querySelector('.input-line').style.display = 'none';
    monitorInterval = setInterval(renderMonitor, 800);

    const stopMonitor = () => {
        clearInterval(monitorInterval);
        monitorInterval = null;
        document.querySelector('.input-line').style.display = 'flex';
        output.innerHTML = "<div>[MONITORING TERMINATED]</div>";
        window.removeEventListener('keydown', stopMonitor);
        input.focus();
    };
    window.addEventListener('keydown', stopMonitor);
}

async function triggerLockout() {
    output.innerHTML = "";
    document.querySelector('.input-line').style.display = 'none';
    document.body.style.backgroundColor = "#500000";
    document.documentElement.style.setProperty('--main-color', "red");
    const fatal = ["!!! SECURITY ALERT !!!", "ACCESS VIOLATION", "LOCKOUT: 120 MIN", "SYSTEM HALTED."];
    for (let line of fatal) { await sysPrint(line); }
}
let currentQuoteIndex = 0; // Добавь это в самое начало файла

function renderActivity() {
    // Шанс появления новой строки (30%)
    if (Math.random() > 0.7) {
        // Берем цитату по порядку вместо рандома
        const newLine = activityPool[currentQuoteIndex];
        
        liveLogs.push(`[${new Date().toLocaleTimeString()}] ${newLine}`);
        
        // Увеличиваем индекс для следующей цитаты
        currentQuoteIndex++;
        
        // Если дошли до конца массива — начинаем заново
        if (currentQuoteIndex >= activityPool.length) {
            currentQuoteIndex = 0;
        }

        if (liveLogs.length > 15) liveLogs.shift(); // Лимит строк на экране
    }
    
    output.innerHTML = "";
    let header = "--- C&A CHAT INTERCEPTOR: LIVE FEED ---\n";
    header += "MODE: ENCRYPTED BYPASS | ANY KEY TO EXIT\n";
    header += "----------------------------------------\n";
    output.innerText = header + "\n" + liveLogs.join("\n");
}

function startActivity() {
    document.querySelector('.input-line').style.display = 'none';
    
    // Сбрасываем индекс в 0, чтобы лог всегда начинался с первой цитаты
    currentQuoteIndex = 0; 
    
    liveLogs = ["Scanning frequencies...", "Connection established."];
    monitorInterval = setInterval(renderActivity, 800);

    const stopActivity = () => {
        clearInterval(monitorInterval);
        monitorInterval = null;
        document.querySelector('.input-line').style.display = 'flex';
        output.innerHTML = "<div>[CONNECTION TERMINATED]</div>";
        window.removeEventListener('keydown', stopActivity);
        input.focus();
    };
    window.addEventListener('keydown', stopActivity);
}
// --- ОБРАБОТКА КОМАНД ---
async function handleCommand(cmdText) {
    const parts = cmdText.toUpperCase().split(' ');
    const action = parts[0];
    const target = parts[1];

    if (!isAuthorized) {
        if (action === 'QUEENIE123') {
            isAuthorized = true;
            attempts = 0;
            localStorage.setItem('attempts', 0);
            updateVisuals();
            await sysPrint("DECRYPTING...");
            await sysPrint("ACCESS GRANTED. WELCOME, ???");
        } else {
            attempts++;
            localStorage.setItem('attempts', attempts);
            updateVisuals();
            if (attempts >= 10) {
                localStorage.setItem('terminal_lock', Date.now() + 7200000);
                triggerLockout();
            } else { await sysPrint(`ERR: INVALID KEY (${attempts}/10)`); }
        }
        return;
    }

    switch (action) {
        case 'HELP':
            await sysPrint("MS-DOS v6.22 HELP SYSTEM");
            await sysPrint("-----------------------");
            await sysPrint("DIR  - List files in current directory");
            await sysPrint("CD   - Change directory (e.g. CD CHARACTERS)");
            await sysPrint("TYPE - Read file contents (.DAT or .TXT)");
            await sysPrint("CLS  - Clear screen");
            await sysPrint("EXIT - Logout and restart system");
            break;

        case 'DIR':
            const folder = fileSystem[currentDir];
            await sysPrint(`Directory of C:${currentDir.replace(/\//g, '\\')}:`);
            for (let item of folder.content) {
                const isFile = item.includes('.') || item.includes('EXE');
                const label = isFile ? "      " : "<DIR> ";
                await sysPrint(` ${label} ${item}`);
            }
            break;

        case 'CD':
            if (!target || target === "..") {
                currentDir = "/";
                await sysPrint("Back to Root.");
            } else {
                const newPath = target.startsWith('/') ? target : `/${target}`;
                if (fileSystem[newPath]) {
                    currentDir = newPath;
                    await sysPrint(`Directory changed to C:${currentDir.replace(/\//g, '\\')}`);
                } else { await sysPrint("ERROR: DIRECTORY NOT FOUND."); }
            }
            break;

        case 'STATUS.EXE':
        case 'STATUS':
            await sysPrint("INITIALIZING LIVE STREAM...");
            await new Promise(r => setTimeout(r, 800));
            startMonitoring();
            break;

        case 'ACTIVITY.EXE':
        case 'ACTIVITY':
            await sysPrint("CONNECTING TO LOCAL NETWORK...");
            await new Promise(r => setTimeout(r, 800));
            startActivity(); // Запускаем живой чат
            break;

        case 'TYPE':
            let fileName = target ? target.replace(".DAT", "").replace(".TXT", "") : "";
            if (characters[fileName]) {
                updateStats();
                let c = characters[fileName];
                await sysPrint(`READING ${fileName}.DAT...`);
                let scale = "[" + "#".repeat(Math.floor(c.stability/10)) + "-".repeat(10-Math.floor(c.stability/10)) + "]";
                await sysPrint(`STABILITY: ${scale} ${c.stability}%`);
                await sysPrint(`MOOD: ${c.mood} | AGE: ${c.age} | ARRIVAL: ${c.arrival}`);
                if (c.stability === 0) await sysPrint("!!! SUBJECT ABSTRACTED !!!");
            } else if (fileName === "README") {
                await sysPrint("C&A STATION v4.0.2. PROPERTY OF C&A GROUP.");
            } else { await sysPrint("FILE NOT FOUND."); }
            break;

        case 'CLS': output.innerHTML = ""; break;
        case 'EXIT': location.reload(); break;
        default: await sysPrint(`'${action}' is not recognized as a command.`);
    }
}

// --- СЛУШАТЕЛИ СОБЫТИЙ ---
input.addEventListener('input', () => { userInputDisplay.textContent = input.value; });
input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !monitorInterval) {
        const val = input.value.trim();
        input.value = ''; userInputDisplay.textContent = '';
        output.innerHTML += `<div>> ${val}</div>`;
        await handleCommand(val);
    }
});

let keys = {};
window.onkeydown = window.onkeyup = function(e) {
    keys[e.code] = e.type == 'keydown';
    if (keys['KeyZ'] && keys['KeyP']) { localStorage.clear(); location.reload(); }
};

window.onload = async () => {
    const lock = localStorage.getItem('terminal_lock');
    if (lock && Date.now() < parseInt(lock)) { triggerLockout(); }
    else {
        updateVisuals();
        for (let line of BOOT_DATA) { await sysPrint(line); }
        input.focus();
    }
};

document.addEventListener('click', () => input.focus());