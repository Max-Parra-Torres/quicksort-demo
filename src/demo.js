import qs from './quickSort.js';


// ─── Step recorder — instruments your actual partition.js ─────────────────
//
// instrumentedPartition and instrumentedQs are line-for-line mirrors of
// partition.js and quickSort.js. The only difference: instead of console.log,
// each operation pushes a step object so the UI can replay it.

function buildSteps(inputArr) {
    const steps = [];
    const sorted = new Set();

    function instrumentedPartition(raw, lo, hi) {
        const pivotVal = raw[hi];
        steps.push({ type: 'partition-start', arr: [...raw], lo, hi, pivot: hi });

        let i = lo - 1;
        for (let j = lo; j < hi; j++) {
            const willSwap  = raw[j] < pivotVal && (i + 1) !== j;
            const willCount = raw[j] < pivotVal;
            steps.push({ type: 'compare', arr: [...raw], lo, hi, pivot: hi, i, j, willSwap, willCount });

            if (raw[j] < pivotVal) {
                i++;
                if (i === j) continue;           // guard from partition.js
                [raw[i], raw[j]] = [raw[j], raw[i]];
                steps.push({ type: 'swap', arr: [...raw], lo, hi, pivot: hi, i, j });
            }
        }

        [raw[i + 1], raw[hi]] = [raw[hi], raw[i + 1]];
        const pi = i + 1;
        sorted.add(pi);
        steps.push({ type: 'place-pivot', arr: [...raw], lo, hi, pivot: pi, sortedSnap: new Set(sorted) });

        return pi;
    }

    // Mirrors quickSort.js: base case is (low < high), same as your implementation
    function instrumentedQs(raw, lo, hi) {
        if (lo < hi) {
            const pi = instrumentedPartition(raw, lo, hi);
            instrumentedQs(raw, lo, pi - 1);
            instrumentedQs(raw, pi + 1, hi);

            for (let k = lo; k <= hi; k++) sorted.add(k);
            steps.push({ type: 'subarray-sorted', arr: [...raw], lo, hi, sortedSnap: new Set(sorted) });
        } else {
            if (lo === hi) sorted.add(lo);
        }
    }

    instrumentedQs([...inputArr], 0, inputArr.length - 1);
    return steps;
}


// ─── Tab switching ─────────────────────────────────────────────────────────

function switchTab(name) {
    stopPlay();
    document.querySelectorAll('.tab').forEach((t, i) =>
        t.classList.toggle('active', ['step', 'quick', 'scale'][i] === name)
    );
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
}


// ─── Panel 1: Step-by-step ─────────────────────────────────────────────────

const STEP_DATA = [8, 5, 13, 9, 6, 7, 4, 11, 10, 12];
let stepSteps, stepIdx, playTimer = null;

function renderStepBars(arr, highlight) {
    const maxVal = Math.max(...arr);
    document.getElementById('step-bars').innerHTML = arr.map((v, idx) => {
        let cls = 'bar-default';
        if (highlight) {
            if (highlight.sorted?.has(idx))       cls = 'bar-sorted';
            if (highlight.compare?.includes(idx)) cls = 'bar-active';
            if (highlight.pivot === idx)          cls = 'bar-pivot';
        }
        const h = Math.max(16, Math.round((v / maxVal) * 220));
        return `
      <div class="bar">
        <div class="bar-block ${cls}" style="height:${h}px">
          <span class="bar-val">${v}</span>
        </div>
        <span class="bar-idx">${idx}</span>
      </div>`;
    }).join('');
}

function resetStep() {
    stopPlay();
    stepSteps = buildSteps([...STEP_DATA]);
    stepIdx = -1;
    renderStepBars(STEP_DATA, {});
    document.getElementById('step-log').innerHTML = '';
    document.getElementById('step-counter').textContent = '';
    document.getElementById('btn-next').disabled = false;
    document.getElementById('btn-play').disabled = false;
}

function applyStep() {
    stepIdx++;
    if (stepIdx >= stepSteps.length) {
        document.getElementById('btn-next').disabled = true;
        document.getElementById('step-log').innerHTML = '<em>Sorted!</em> All elements are in place.';
        stopPlay();
        return false;
    }

    const s = stepSteps[stepIdx];
    document.getElementById('step-counter').textContent = `step ${stepIdx + 1} / ${stepSteps.length}`;

    const sortedSet = s.sortedSnap || new Set();
    const hl = { sorted: sortedSet, pivot: null, compare: [] };
    let msg = '';

    if (s.type === 'partition-start') {
        hl.pivot = s.pivot;
        msg = `Partitioning indices <em>${s.lo}</em> to <em>${s.hi}</em>. Pivot chosen: <em>${s.arr[s.pivot]}</em> (index ${s.pivot}).`;
    } else if (s.type === 'compare') {
        hl.pivot = s.pivot;
        hl.compare = [s.j];
        let rel;
        if (!s.willCount) {
            rel = 'not less than pivot.';
        } else if (s.willSwap) {
            rel = 'less than pivot — will be swapped left.';
        } else {
            rel = 'less than pivot — already in place.';
        }
        msg = `Comparing <em>${s.arr[s.j]}</em> (j=${s.j}) with pivot <em>${s.arr[s.pivot]}</em> — ${rel}`;
    } else if (s.type === 'swap') {
        hl.pivot = s.pivot;
        hl.compare = [s.i, s.j];
        msg = `Swapped <em>${s.arr[s.j]}</em> (was at j=${s.j}) and <em>${s.arr[s.i]}</em> (now at i=${s.i}).`;
    } else if (s.type === 'place-pivot') {
        hl.pivot = s.pivot;
        hl.sorted = sortedSet;
        msg = `Pivot <em>${s.arr[s.pivot]}</em> placed at final position <em>${s.pivot}</em>. Everything left is smaller; everything right is larger.`;
    } else if (s.type === 'subarray-sorted') {
        hl.sorted = sortedSet;
        msg = `Subarray [${s.lo}–${s.hi}] is now fully sorted.`;
    }

    renderStepBars(s.arr, hl);
    document.getElementById('step-log').innerHTML = msg;
    return true;
}

function nextStep() {
    applyStep();
}

function togglePlay() {
    if (playTimer !== null) {
        stopPlay();
    } else {
        document.getElementById('btn-play').textContent = '⏸ Pause';
        document.getElementById('btn-next').disabled = true;
        playTimer = setInterval(() => {
            const cont = applyStep();
            if (!cont) stopPlay();
        }, 200);
    }
}

function stopPlay() {
    if (playTimer !== null) {
        clearInterval(playTimer);
        playTimer = null;
    }
    const btn = document.getElementById('btn-play');
    if (btn) btn.textContent = '▶ Play';
    const btnNext = document.getElementById('btn-next');
    if (btnNext && stepIdx < (stepSteps?.length ?? 0)) btnNext.disabled = false;
}


// ─── Panel 2: Timed run ────────────────────────────────────────────────────

let quickArr;

function genArr(n) {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 100000));
}

function warmJIT() {
    const dummy = genArr(1000);
    qs(dummy, 0, dummy.length - 1);
}

// performance.now() is clamped by browsers (100µs–1ms) as a Spectre mitigation.
// 100 elements sorts well under that threshold, so we run REPS times and divide.
function timedSort(arr, reps) {
    const t0 = performance.now();
    for (let r = 0; r < reps; r++) {
        const copy = [...arr];
        qs(copy, 0, copy.length - 1);
    }
    return (performance.now() - t0) / reps;
}

function renderQuickBars(arr, isSorted) {
    const max = Math.max(...arr);
    document.getElementById('quick-bars').innerHTML = arr.map(v => {
        const h = Math.max(3, Math.round((v / max) * 152));
        return `<div class="quick-bar${isSorted ? ' sorted' : ''}" style="height:${h}px"></div>`;
    }).join('');
}

function resetQuick() {
    quickArr = genArr(100);
    renderQuickBars(quickArr, false);
    const timer = document.getElementById('quick-timer');
    timer.innerHTML = '—<span class="timer-unit">ms</span>';
    timer.classList.remove('done');
    document.getElementById('btn-run').disabled = false;
}

function runQuick() {
    document.getElementById('btn-run').disabled = true;
    warmJIT();

    const arr = genArr(100);
    const ms = timedSort(arr, 500).toFixed(4);

    qs(arr, 0, arr.length - 1);
    renderQuickBars(arr, true);
    const timer = document.getElementById('quick-timer');
    timer.innerHTML = `${ms}<span class="timer-unit">ms</span>`;
    timer.classList.add('done');
}


// ─── Panel 3: Scaling ──────────────────────────────────────────────────────

const SIZES = [1000, 10000, 100000];
let scaleChart = null;

function initScaleCards() {
    document.getElementById('scale-cards').innerHTML = SIZES.map(s => `
    <div class="metric-card" id="card-${s}">
      <div class="metric-label">${s.toLocaleString()} elements</div>
      <div class="metric-val" id="val-${s}">—</div>
      <div class="metric-sub" id="sub-${s}">not yet run</div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill" id="prog-${s}" style="width:0%"></div>
      </div>
    </div>`
    ).join('');
}

async function runScale() {
    document.getElementById('btn-scale').disabled = true;
    document.getElementById('scale-log').textContent = 'Warming up JIT…';

    warmJIT();

    document.getElementById('scale-log').textContent = 'Running tests…';

    const times = [];
    for (const n of SIZES) {
        await new Promise(r => setTimeout(r, 30));

        const reps = n <= 1000 ? 200 : n <= 10000 ? 20 : 1;
        const arr = genArr(n);
        const avg = timedSort(arr, reps);
        times.push(avg);

        document.getElementById('val-' + n).textContent = avg.toFixed(2) + ' ms';
        document.getElementById('sub-' + n).textContent = `avg of ${reps} run${reps > 1 ? 's' : ''}`;
        document.getElementById('card-' + n).classList.add('done');
    }

    const maxT = Math.max(...times);
    SIZES.forEach((n, i) => {
        document.getElementById('prog-' + n).style.width =
            Math.round((times[i] / maxT) * 100) + '%';
    });

    const ratio1 = (times[1] / times[0]).toFixed(1);
    const ratio2 = (times[2] / times[0]).toFixed(1);
    const pred1  = (10 * Math.log2(10000) / Math.log2(1000)).toFixed(1);
    const pred2  = (100 * Math.log2(100000) / Math.log2(1000)).toFixed(1);
    const cacheNote = parseFloat(ratio2) > parseFloat(pred2) * 1.3
        ? ' Cache misses likely explain the extra slowdown at 100K.'
        : '';
    document.getElementById('scale-log').innerHTML =
        `10× more data → <em>~${ratio1}× slower</em>. 100× more data → <em>~${ratio2}× slower</em>. ` +
        `O(n log n) predicts ~${pred1}× and ~${pred2}×.${cacheNote}`;

    if (scaleChart) scaleChart.destroy();
    scaleChart = new Chart(document.getElementById('scale-chart'), {
        type: 'bar',
        data: {
            labels: ['1,000', '10,000', '100,000'],
            datasets: [{
                label: 'avg time (ms)',
                data: times.map(t => parseFloat(t.toFixed(3))),
                backgroundColor: ['#aecff5', '#34c89a', '#7ed977'],
                borderRadius: 5,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'IBM Plex Mono', size: 22 }, color: '#111111' }
                },
                y: {
                    grid: { color: 'rgba(100,140,200,0.1)' },
                    ticks: {
                        font: { family: 'IBM Plex Mono', size: 22 },
                        color: '#111111',
                        callback: v => v + ' ms'
                    }
                }
            }
        }
    });

    document.getElementById('btn-scale').disabled = false;
}


// ─── Init ──────────────────────────────────────────────────────────────────

resetStep();
resetQuick();
initScaleCards();

// Expose handlers to window so HTML onclick attributes can reach them
// (required because type="module" scopes everything to the module)
window.switchTab  = switchTab;
window.nextStep   = nextStep;
window.togglePlay = togglePlay;
window.resetStep  = resetStep;
window.runQuick   = runQuick;
window.resetQuick = resetQuick;
window.runScale   = runScale;