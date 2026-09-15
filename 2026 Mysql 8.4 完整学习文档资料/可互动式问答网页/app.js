var allQuestions = [];

var stages = [
    {id:1, name:"基础入门与环境部署", chapters:"", desc:"环境搭建、数据类型、SQL基础语法"},
    {id:2, name:"数据库对象与安全", chapters:"", desc:"视图、存储过程、触发器、权限、角色"},
    {id:3, name:"InnoDB引擎与事务", chapters:"", desc:"InnoDB架构、MVCC、锁机制、事务隔离"},
    {id:4, name:"索引优化与新特性", chapters:"", desc:"B+树、查询优化、EXPLAIN、8.4新特性"},
    {id:5, name:"备份高可用与性能", chapters:"", desc:"备份恢复、复制、MGR、参数调优、监控"}
];

var state = {
    page: "home",
    stageId: null,
    qIndex: 0,
    correct: 0,
    answered: 0,
    selected: [],
    submitted: false,
    stageProgress: {}
};

function init() {
    var saved = localStorage.getItem("mysql_quiz_progress");
    if (saved) {
        try { state.stageProgress = JSON.parse(saved); } catch(e) { state.stageProgress = {}; }
    }
    if (typeof stage1Questions !== "undefined") allQuestions = allQuestions.concat(stage1Questions);
    if (typeof stage2Questions !== "undefined") allQuestions = allQuestions.concat(stage2Questions);
    if (typeof stage3Questions !== "undefined") allQuestions = allQuestions.concat(stage3Questions);
    if (typeof stage4Questions !== "undefined") allQuestions = allQuestions.concat(stage4Questions);
    if (typeof stage5Questions !== "undefined") allQuestions = allQuestions.concat(stage5Questions);

    document.getElementById("back-home-btn").addEventListener("click", goHome);
    document.getElementById("submit-btn").addEventListener("click", submitAnswer);
    document.getElementById("next-btn").addEventListener("click", nextQuestion);
    document.getElementById("result-home-btn").addEventListener("click", goHome);

    renderHome();
}

function saveProgress() {
    localStorage.setItem("mysql_quiz_progress", JSON.stringify(state.stageProgress));
}

function showPage(name) {
    document.querySelectorAll(".page").forEach(function(p) { p.classList.remove("active"); });
    document.getElementById(name + "-page").classList.add("active");
    window.scrollTo(0, 0);
    state.page = name;
}

function renderHome() {
    var container = document.getElementById("stages-container");
    container.innerHTML = "";
    stages.forEach(function(s) {
        var qs = allQuestions.filter(function(q) { return q.stage === s.id; });
        var total = qs.length;
        var prog = state.stageProgress[s.id] || {answered: 0, correct: 0};
        var pct = total > 0 ? Math.round(prog.answered / total * 100) : 0;

        var card = document.createElement("div");
        card.className = "stage-card";
        card.innerHTML =
            '<div class="stage-num">阶段 ' + s.id + '</div>' +
            '<div class="stage-name">' + s.name + '</div>' +
            '<div class="stage-chapters">' + s.chapters + '</div>' +
            '<div class="stage-count">' + total + ' 道题</div>' +
            '<div class="stage-progress-bar"><div class="stage-progress-fill" style="width:' + pct + '%"></div></div>' +
            '<div class="stage-progress-text">' + (prog.answered > 0 ? "已答 " + prog.answered + "/" + total + "  正确率 " + (prog.answered > 0 ? Math.round(prog.correct / prog.answered * 100) : 0) + "%" : "尚未开始") + '</div>';
        card.addEventListener("click", function() { startStage(s.id); });
        container.appendChild(card);
    });
    showPage("home");
}

function startStage(stageId) {
    state.stageId = stageId;
    state.qIndex = 0;
    state.correct = 0;
    state.answered = 0;
    state.selected = [];
    state.submitted = false;
    showPage("quiz");
    renderQuestion();
}

function getStageQuestions() {
    return allQuestions.filter(function(q) { return q.stage === state.stageId; });
}

function renderQuestion() {
    var qs = getStageQuestions();
    if (state.qIndex >= qs.length) {
        showResults();
        return;
    }
    var q = qs[state.qIndex];
    state.selected = [];
    state.submitted = false;

    var stageName = stages.find(function(s) { return s.id === state.stageId; }).name;
    document.getElementById("stage-label").innerHTML = "<strong>" + stageName + "</strong>";
    document.getElementById("progress-label").innerHTML = "进度：<strong>" + (state.qIndex + 1) + " / " + qs.length + "</strong>";
    var accPct = state.answered > 0 ? Math.round(state.correct / state.answered * 100) : 0;
    document.getElementById("accuracy-label").innerHTML = "正确率：<strong>" + accPct + "%</strong>";

    document.getElementById("question-number").textContent = "第 " + (state.qIndex + 1) + " 题";
    var typeBadge = document.getElementById("question-type-badge");
    if (q.type === "single") { typeBadge.textContent = "单选题"; typeBadge.className = "type-badge single"; }
    else if (q.type === "multiple") { typeBadge.textContent = "多选题"; typeBadge.className = "type-badge multiple"; }
    else { typeBadge.textContent = "判断题"; typeBadge.className = "type-badge truefalse"; }

    var tagsRow = document.getElementById("question-tags");
    tagsRow.innerHTML = "";
    if (q.tags) {
        q.tags.forEach(function(t) {
            var span = document.createElement("span");
            span.className = "tag";
            span.textContent = t;
            tagsRow.appendChild(span);
        });
    }

    document.getElementById("question-text").textContent = q.question;

    var optContainer = document.getElementById("options-container");
    optContainer.innerHTML = "";
    var letters = ["A", "B", "C", "D", "E", "F"];
    q.options.forEach(function(opt, idx) {
        var item = document.createElement("div");
        item.className = "option-item";
        item.dataset.idx = idx;
        var indClass = (q.type === "multiple") ? "option-indicator checkbox" : "option-indicator";
        item.innerHTML = '<div class="' + indClass + '"></div><div class="option-text">' + letters[idx] + ". " + opt.text + '</div>';
        item.addEventListener("click", function() { selectOption(idx, q.type); });
        optContainer.appendChild(item);
    });

    var submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    submitBtn.classList.remove("hidden");
    document.getElementById("result-feedback").classList.add("hidden");
    document.getElementById("explanation-box").classList.add("hidden");
    document.getElementById("next-btn").classList.add("hidden");
}

function selectOption(idx, type) {
    if (state.submitted) return;
    if (type === "multiple") {
        var pos = state.selected.indexOf(idx);
        if (pos > -1) { state.selected.splice(pos, 1); } else { state.selected.push(idx); }
    } else {
        state.selected = [idx];
    }
    document.querySelectorAll(".option-item").forEach(function(el) {
        if (state.selected.indexOf(parseInt(el.dataset.idx)) > -1) {
            el.classList.add("selected");
        } else {
            el.classList.remove("selected");
        }
    });
    document.getElementById("submit-btn").disabled = state.selected.length === 0;
}

function submitAnswer() {
    if (state.submitted || state.selected.length === 0) return;
    state.submitted = true;

    var qs = getStageQuestions();
    var q = qs[state.qIndex];
    var correctIdxs = [];
    q.options.forEach(function(opt, idx) { if (opt.correct) correctIdxs.push(idx); });

    var isCorrect = false;
    if (state.selected.length === correctIdxs.length) {
        var sorted1 = state.selected.slice().sort();
        var sorted2 = correctIdxs.slice().sort();
        isCorrect = sorted1.every(function(v, i) { return v === sorted2[i]; });
    }

    state.answered++;
    if (isCorrect) state.correct++;

    document.querySelectorAll(".option-item").forEach(function(el) {
        var idx = parseInt(el.dataset.idx);
        el.classList.add("disabled");
        if (correctIdxs.indexOf(idx) > -1) {
            el.classList.add("correct-answer");
        }
        if (state.selected.indexOf(idx) > -1 && correctIdxs.indexOf(idx) === -1) {
            el.classList.add("wrong-answer");
        }
    });

    var feedback = document.getElementById("result-feedback");
    feedback.classList.remove("hidden", "correct", "wrong");
    if (isCorrect) {
        feedback.textContent = "回答正确";
        feedback.classList.add("correct");
    } else {
        feedback.textContent = "回答错误";
        feedback.classList.add("wrong");
    }

    renderExplanation(q);

    document.getElementById("submit-btn").classList.add("hidden");
    document.getElementById("next-btn").classList.remove("hidden");

    var accPct = state.answered > 0 ? Math.round(state.correct / state.answered * 100) : 0;
    document.getElementById("accuracy-label").innerHTML = "正确率：<strong>" + accPct + "%</strong>";
}

function renderExplanation(q) {
    var box = document.getElementById("explanation-box");
    box.classList.remove("hidden");
    var letters = ["A", "B", "C", "D", "E", "F"];
    var html = "<h4>解析</h4>";
    q.options.forEach(function(opt, idx) {
        var labelClass = opt.correct ? "exp-label correct-label" : "exp-label wrong-label";
        var prefix = opt.correct ? "[正确]" : "[错误]";
        html += '<div class="explanation-item"><span class="' + labelClass + '">' + letters[idx] + ". " + prefix + '</span> ' + opt.explanation + '</div>';
    });
    box.innerHTML = html;
}

function nextQuestion() {
    state.qIndex++;
    var qs = getStageQuestions();
    if (state.qIndex >= qs.length) {
        showResults();
    } else {
        renderQuestion();
        window.scrollTo(0, 0);
    }
}

function showResults() {
    state.stageProgress[state.stageId] = {answered: state.answered, correct: state.correct};
    saveProgress();

    var stageName = stages.find(function(s) { return s.id === state.stageId; }).name;
    document.getElementById("result-stage-name").textContent = stageName;
    document.getElementById("result-total").textContent = state.answered;
    document.getElementById("result-correct").textContent = state.correct;
    document.getElementById("result-wrong").textContent = state.answered - state.correct;
    var pct = state.answered > 0 ? Math.round(state.correct / state.answered * 100) + "%" : "0%";
    document.getElementById("result-accuracy").textContent = pct;
    showPage("result");
}

function goHome() {
    renderHome();
}

document.addEventListener("DOMContentLoaded", init);
