// ─────────────────────────────────────────────
//  LEADERBOARD  (localStorage)
// ─────────────────────────────────────────────
const LS_KEY = 'basketShot_scores'

function loadScores() {
try { return JSON.parse(localStorage.getItem(LS_KEY)) || [] } catch { return [] }
}

function saveScore(name, score) {
const scores = loadScores()
scores.push({ name, score, date: new Date().toLocaleDateString('es-ES') })
scores.sort((a, b) => b.score - a.score)
localStorage.setItem(LS_KEY, JSON.stringify(scores.slice(0, 10)))
}

function renderLeaderboard() {
const list = document.getElementById('lb-list')
if (!list) return
const scores = loadScores()
if (!scores.length) {
list.innerHTML = '<div style="font-size:13px;color:rgba(255,255,255,.25);padding:8px 12px;">Sé el primero en encestar.</div>'
return
}
list.innerHTML = scores.slice(0, 5).map((s, i) => `<div class="lb-row"> <span class="lb-rank">${['🥇','🥈','🥉','4','5'][i]}</span> <span class="lb-name">${s.name}</span> <span class="lb-score">${s.score} pts</span> </div>`).join('')
}

// ─────────────────────────────────────────────
//  SPLASH SCREEN
// ─────────────────────────────────────────────
;(function initSplash() {
// Decorative lines
const lines = document.getElementById('splash-lines')
if (lines) {
for (let i = 0; i < 8; i++) {
const s = document.createElement('span')
s.style.transform = `rotate(${-40 + i * 12}deg)`
s.style.animationDelay = `${i * 0.08}s`
lines.appendChild(s)
}
}


renderLeaderboard()

const startBtn = document.getElementById('start-btn')
const nameInput = document.getElementById('player-name-input')
const splash = document.getElementById('splash')
const hud = document.getElementById('hud')

nameInput.focus()

function tryStart() {
    const name = nameInput.value.trim()
    if (!name) { nameInput.focus(); nameInput.style.borderColor = '#ff3c5a'; return }
    nameInput.style.borderColor = ''
    window._playerName = name
    document.getElementById('hud-player-name').textContent = '👤 ' + name
    splash.style.opacity = '1'
    splash.style.transition = 'opacity .5s'
    splash.style.opacity = '0'
    setTimeout(() => {
        splash.style.display = 'none'
        hud.style.display = 'block'
        // Trigger game start via custom event
        document.dispatchEvent(new CustomEvent('gameStart'))
    }, 500)
}

startBtn.addEventListener('click', tryStart)
nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') tryStart() })


})()

// ─────────────────────────────────────────────
//  SHOT MINIGAME
// ─────────────────────────────────────────────
const ShotGame = (function () {
let resolveCallback = null
let rejectCallback = null
let powerRaf = null
let powerDir = 1
let powerVal = 0
let listening = false


const overlay  = document.getElementById('shot-overlay')
const result   = document.getElementById('shot-result')
const levelLbl = document.getElementById('shot-level-label')

// — Power bar elements
const powerGame      = document.getElementById('power-game')
const powerFill      = document.getElementById('power-fill')
const powerShootBtn  = document.getElementById('power-shoot-btn')
const zoneMarker     = document.getElementById('zone-marker')

// — Color match elements
const colorGameEl    = document.getElementById('color-game')
const targetBox      = document.getElementById('target-color-box')
const colorSeq       = document.getElementById('color-sequence')
const shootBtn       = document.getElementById('shoot-btn')

const COLORS = ['#ff3c5a','#f5a742','#39e87b','#4ac3ff','#c06bff','#fff200']
let selectedColorIdx = null

function hide() {
    overlay.classList.remove('active')
    stopPower()
    result.className = ''
    result.textContent = ''
    powerGame.style.display = 'none'
    colorGameEl.style.display = 'none'
    listening = false
}

// ── POWER BAR
const ZONE_START = 0.38
const ZONE_END   = 0.62
const SPEED      = 0.006  // % per ms

function stopPower() {
    if (powerRaf) { cancelAnimationFrame(powerRaf); powerRaf = null }
    document.removeEventListener('keydown', onSpaceKey)
}

function animatePower(last) {
    return function loop(ts) {
        const dt = last ? ts - last : 16
        powerVal += powerDir * SPEED * dt
        if (powerVal >= 1) { powerVal = 1; powerDir = -1 }
        if (powerVal <= 0) { powerVal = 0; powerDir = 1 }
        powerFill.style.width = (powerVal * 100) + '%'
        // Color feedback
        const inZone = powerVal >= ZONE_START && powerVal <= ZONE_END
        powerFill.style.background = inZone
            ? 'linear-gradient(90deg,#39e87b,#4ac3ff)'
            : 'linear-gradient(90deg,#39e87b,#f5a742,#ff3c5a)'
        powerRaf = requestAnimationFrame(loop.bind(null, ts))
    }
}

function firePower() {
    if (!listening) return
    listening = false
    stopPower()
    const inZone  = powerVal >= ZONE_START && powerVal <= ZONE_END
    // Score: perfect in-zone = full 10, partial based on proximity
    let bonus = 0
    if (inZone) {
        const center = (ZONE_START + ZONE_END) / 2
        const dist = Math.abs(powerVal - center) / ((ZONE_END - ZONE_START) / 2)
        bonus = Math.round(10 * (1 - dist * 0.3))
    }
    showResult(inZone, inZone ? bonus : 0, () => { hide(); resolveCallback({ hit: inZone, bonus }) })
}

function onSpaceKey(e) {
    if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); firePower() }
}

// ── COLOR MATCH
function buildColorGame(level) {
    // Pick a target color
    const targetIdx = Math.floor(Math.random() * COLORS.length)
    const target = COLORS[targetIdx]
    targetBox.style.background = target
    targetBox.style.boxShadow = `0 0 28px ${target}55`

    // Build choices: target + N-1 distractors
    const count = level === 1 ? 4 : 5
    const pool = COLORS.filter((_, i) => i !== targetIdx)
    const distractors = pool.sort(() => Math.random() - .5).slice(0, count - 1)
    const choices = [...distractors, target].sort(() => Math.random() - .5)

    colorSeq.innerHTML = ''
    selectedColorIdx = null
    shootBtn.disabled = true

    choices.forEach((c, i) => {
        const dot = document.createElement('div')
        dot.className = 'color-dot'
        dot.style.background = c
        dot.style.boxShadow = `0 4px 14px ${c}55`
        dot.dataset.idx = i
        dot.addEventListener('click', () => {
            colorSeq.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'))
            dot.classList.add('selected')
            selectedColorIdx = c
            shootBtn.disabled = false
        })
        colorSeq.appendChild(dot)
    })

    return { target, choices }
}

let colorTarget = null
shootBtn.addEventListener('click', () => {
    if (!listening || selectedColorIdx === null) return
    listening = false
    const hit = selectedColorIdx === colorTarget
    showResult(hit, hit ? 10 : 0, () => { hide(); resolveCallback({ hit, bonus: hit ? 10 : 0 }) })
})

function showResult(hit, bonus, cb) {
    result.className = 'show ' + (hit ? 'good' : 'miss')
    result.textContent = hit
        ? (bonus >= 10 ? '🎯 PERFECTO! +' + bonus : '✅ ENCESTA! +' + bonus)
        : '❌ FALLADO'
    setTimeout(cb, 1400)
}

// ── PUBLIC
return {
    open(level, type) {
        return new Promise((res, rej) => {
            resolveCallback = res
            rejectCallback  = rej
            overlay.classList.add('active')
            result.className = ''
            result.textContent = ''
            levelLbl.textContent = `Nivel ${level} · ${type === 'power' ? 'Barra de precisión' : 'Acierto de color'}`

            if (type === 'power') {
                powerGame.style.display = 'flex'
                colorGameEl.style.display = 'none'
                powerVal = 0; powerDir = 1
                powerFill.style.width = '0%'
                setTimeout(() => {
                    listening = true
                    powerRaf = requestAnimationFrame(animatePower(null))
                    document.addEventListener('keydown', onSpaceKey)
                    powerShootBtn.onclick = firePower
                }, 300)
            } else {
                colorGameEl.style.display = 'flex'
                powerGame.style.display = 'none'
                const { target } = buildColorGame(level)
                colorTarget = target
                listening = true
            }
        })
    }
}


})()

// ─────────────────────────────────────────────
//  A-FRAME COMPONENT
// ─────────────────────────────────────────────
AFRAME.registerComponent('basketball-play', {
init: function () {
this.attacker = document.querySelector('#attacker')
this.defender = document.querySelector('#defender')
this.ball     = document.querySelector('#ball')


    this.leftArm  = document.querySelector('#left-arm-container')
    this.rightArm = document.querySelector('#righ-arm-container')
    this.leftLeg  = document.querySelector('#left-leg-container')
    this.rightLeg = document.querySelector('#right-leg-container')

    this.scoreValue   = document.querySelector('#score-value')
    this.levelValue   = document.querySelector('#level-value')
    this.messageValue = document.querySelector('#status-message')
    this.restartButton = document.querySelector('#restart-game')

    this.score = 0
    this.level = 1
    this.phase = 'idle'
    this.awaitingScore = false
    this.startTimer = null
    this.gameActive = false

    this.levelConfigs = {
        1: {
            movementTo: '-10 0 10', movementDuration: 5000,
            crossFrom: '-0.8 1.1 -4.95141', crossMid: '0.5 0.69 -4.3', crossTo: '1.2 1.4 -4.95141',
            crossDuration: 1000, crossDelay: 1000,
            entryTo: '-3 0 12', entryDuration: 5000,
            basketJumpTo: '-3 1.5 13', basketLandingTo: '-3 0 13.3', basketDuration: 2500,
            preShotFrom: '0.54 1.2 -5', preShotTo: '0.9 3.3 -4.9', preShotDuration: 1000,
            shotTo: '2.9 7.1 -3.1', shotDuration: 1000,
            finishTo: '2.9 0.5 -3.1', finishDuration: 1000,
            leftArmMovement: { from: '0 -0.08 -0.2', to: '0 0.08 0.2', dur: 800 },
            rightArmMovement: { from: '2.5 -5 15', to: '0 15 -25', dur: 600 },
            defenderPosition: '10.46266 -0.38769 8.85094',
            introMessage: 'Nivel 1: ¡Prepara el tiro!',
            miniGame: 'power'   // power bar challenge
        },
        2: {
            movementTo: '-12 0 8', movementDuration: 4200,
            crossFrom: '-0.8 1.15 -4.95141', crossMid: '0.7 0.72 -4.0', crossTo: '1.6 1.5 -4.95141',
            crossDuration: 850, crossDelay: 850,
            entryTo: '-2 0 11', entryDuration: 3800,
            basketJumpTo: '-2 1.8 12.5', basketLandingTo: '-2 0 12.7', basketDuration: 2200,
            preShotFrom: '0.65 1.25 -5', preShotTo: '1.1 3.6 -4.6', preShotDuration: 900,
            shotTo: '3.2 7.6 -2.7', shotDuration: 900,
            finishTo: '3.2 0.55 -2.7', finishDuration: 900,
            leftArmMovement: { from: '0 -0.1 -0.2', to: '0 0.1 0.2', dur: 700 },
            rightArmMovement: { from: '2.5 -5 15', to: '0 18 -28', dur: 500 },
            defenderPosition: '8.8 -0.38769 7.2',
            introMessage: 'Nivel 2: ¡Tiro de color!',
            miniGame: 'color'   // color match challenge
        }
    }

    this.staticDribling()

    // Listen for splash → game start
    document.addEventListener('gameStart', () => {
        this.gameActive = true
        this.startLevel(1)
    })

    this.attacker.addEventListener('animationcomplete__movement', () => {
        if (this.phase === 'attack-moving') this.crossSecuence()
    })

    this.ball.addEventListener('animationcomplete__cross__complete', () => {
        if (this.phase === 'crossing') this.secondDriblingSecuence()
    })

    this.attacker.addEventListener('animationcomplete__entry__area', () => {
        if (this.phase === 'approaching-basket') this.shotToBasket()
    })

    this.ball.addEventListener('animationcomplete__shot__finish', () => {
        if (this.awaitingScore) { this.awaitingScore = false; this.resolveScore() }
    })

    this.restartButton.addEventListener('click', () => this.restartGame())
},

updateHud: function (message) {
    this.scoreValue.textContent  = String(this.score)
    this.levelValue.textContent  = String(this.level)
    this.messageValue.textContent = message
    const pts = document.getElementById('points-per-shot')
    if (pts) pts.textContent = this.lastBonus != null ? this.lastBonus : 10
},

clearStartTimer: function () {
    if (this.startTimer) { clearTimeout(this.startTimer); this.startTimer = null }
},

getLevelConfig: function () { return this.levelConfigs[this.level] || this.levelConfigs[1] },

resetSceneState: function () {
    this.clearStartTimer()
    this.phase = 'idle'
    this.awaitingScore = false

    this.attacker.removeAttribute('animation__movement')
    this.attacker.removeAttribute('animation__entry__area')
    this.attacker.removeAttribute('animation__go__basket')
    this.attacker.removeAttribute('animation__jump')
    this.attacker.removeAttribute('animation__back__floor')

    this.leftArm.removeAttribute('animation__dribling')
    this.leftArm.removeAttribute('animation__static__dribling')
    this.leftArm.removeAttribute('animation__pre__shot')
    this.leftArm.removeAttribute('animation__shot')
    this.leftArm.removeAttribute('position')
    this.leftArm.removeAttribute('rotation')

    this.rightArm.removeAttribute('animation__dribling')
    this.rightArm.removeAttribute('animation__movement')
    this.rightArm.removeAttribute('animation__dribling__rotation')
    this.rightArm.removeAttribute('position')
    this.rightArm.removeAttribute('rotation')

    this.leftLeg.removeAttribute('animation__left__walk')
    this.leftLeg.removeAttribute('animation__static__left__leg')
    this.rightLeg.removeAttribute('animation__right__walk')
    this.rightLeg.removeAttribute('animation__static__right__leg')
    this.rightLeg.removeAttribute('animation__right__entry')

    this.ball.removeAttribute('animation__ball')
    this.ball.removeAttribute('animation__drible')
    this.ball.removeAttribute('animation__cross__half')
    this.ball.removeAttribute('animation__cross__complete')
    this.ball.removeAttribute('animation__pre-shot')
    this.ball.removeAttribute('animation__shot')
    this.ball.removeAttribute('animation__shot__finish')

    this.attacker.setAttribute('position', '0 0 0')
    this.defender.setAttribute('position', this.getLevelConfig().defenderPosition)
    this.ball.setAttribute('position', '-1 0.9666720856341566 -4.95141')
    this.leftArm.setAttribute('position', '0 0 0')
    this.rightArm.setAttribute('position', '0 0 0')
    this.leftLeg.setAttribute('position', '0 0 0')
    this.rightLeg.setAttribute('position', '0 0 0')
},

startLevel: function (levelNumber) {
    this.level = levelNumber
    this.resetSceneState()
    const config = this.getLevelConfig()
    this.staticDribling()
    this.updateHud(config.introMessage)
    this.startTimer = setTimeout(() => { this.driblingSecuence() }, 1800)
},

restartGame: function () {
    this.score = 0
    this.level = 1
    this.lastBonus = null
    this.updateHud('Juego reiniciado.')
    if (this.gameActive) this.startLevel(1)
    else document.dispatchEvent(new CustomEvent('gameStart'))
},

staticDribling: function () {
    this.attacker.removeAttribute('animation__movement')
    this.leftArm.removeAttribute('animation__dribling')
    this.rightArm.removeAttribute('animation__dribling')
    this.leftLeg.removeAttribute('animation__left__walk')
    this.rightLeg.removeAttribute('animation__right__walk')

    this.rightArm.setAttribute('animation__dribling', {
        property: 'rotation', from: '2.5 -5 15', to: '0 15 -25',
        dur: 600, loop: true, dir: 'alternate'
    })
    this.ball.setAttribute('animation__ball', {
        property: 'position',
        from: '-1.0 1.1 -4.95141', to: '-1.0 0.5 -4.95141',
        loop: true, dir: 'alternate'
    })
    this.leftArm.setAttribute('animation__dribling', {
        property: 'position', to: '0.1 0.15 0',
        dur: 800, dir: 'alternate', loop: true, easing: 'easeInOutQuad'
    })
    this.rightLeg.setAttribute('animation__static__right__leg', {
        property: 'position', to: '0 0.05 0',
        dur: 1000, dir: 'alternate', loop: true, easing: 'easeInOutQuad'
    })
    this.leftLeg.setAttribute('animation__static__left__leg', {
        property: 'position', to: '0 0.05 0',
        dur: 1000, dir: 'alternate', loop: true, easing: 'easeInOutQuad'
    })
},

driblingSecuence: function () {
    const config = this.getLevelConfig()
    this.phase = 'attack-moving'

    this.leftArm.removeAttribute('animation__dribling')
    this.leftLeg.removeAttribute('animation__static__left__leg')
    this.rightLeg.removeAttribute('animation__static__right__leg')

    this.attacker.setAttribute('animation__movement', {
        property: 'position', to: config.movementTo,
        dur: config.movementDuration, easing: 'easeInOutQuad'
    })
    this.leftArm.setAttribute('animation__dribling', {
        property: 'position',
        from: config.leftArmMovement.from, to: config.leftArmMovement.to,
        dur: config.leftArmMovement.dur, dir: 'alternate', loop: true, easing: 'easeInOutQuad'
    })
    this.leftLeg.setAttribute('animation__left__walk', {
        property: 'position', from: '0 0 -0.15', to: '0 0 0.15',
        dur: 500, dir: 'alternate', loop: true
    })
    this.rightLeg.setAttribute('animation__right__walk', {
        property: 'position', from: '0 0 0.15', to: '0 0 -0.15',
        dur: 500, dir: 'alternate', loop: true
    })
},

crossSecuence: function () {
    const config = this.getLevelConfig()
    this.phase = 'crossing'

    this.rightArm.removeAttribute('animation__dribling')
    this.leftArm.removeAttribute('animation__dribling')
    this.leftLeg.removeAttribute('animation__left__walk')
    this.rightLeg.removeAttribute('animation__right__walk')

    this.rightArm.setAttribute('position', '-1 0 0')
    this.leftArm.setAttribute('position', '1 0.3 0')
    this.rightArm.setAttribute('rotation', '0.182 -6.374 -6')
    this.leftArm.setAttribute('rotation', '-3.58 3.64 12.3')

    this.ball.setAttribute('animation__cross__half', {
        property: 'position',
        from: config.crossFrom, to: config.crossMid,
        dur: config.crossDuration, easing: 'easeInOutQuad'
    })
    this.ball.setAttribute('animation__cross__complete', {
        property: 'position',
        from: config.crossMid, to: config.crossTo,
        dur: config.crossDuration, delay: config.crossDelay, easing: 'easeInOutQuad'
    })
},

secondDriblingSecuence: function () {
    const config = this.getLevelConfig()
    this.phase = 'approaching-basket'

    this.leftArm.removeAttribute('rotation')
    this.rightArm.removeAttribute('rotation')
    this.leftArm.removeAttribute('position')
    this.rightArm.removeAttribute('position')

    this.leftArm.setAttribute('animation__dribling', {
        property: 'rotation',
        from: '-2.5 5 -15', to: '0 -15 25',
        dir: 'alternate', dur: 400, loop: true, easing: 'easeInOutQuad'
    })
    this.attacker.setAttribute('animation__entry__area', {
        property: 'position',
        from: config.movementTo, to: config.entryTo,
        dur: config.entryDuration, easing: 'easeInOutQuad'
    })
    this.ball.setAttribute('animation__drible', {
        property: 'position',
        from: config.crossTo, to: '1.2 0.5 -4.95141',
        dir: 'alternate', dur: 600, loop: true
    })
    this.leftLeg.setAttribute('animation__left__walk', {
        property: 'position', from: '0 0 -0.15', to: '0 0 0.15',
        dur: 500, dir: 'alternate', loop: true
    })
    this.rightLeg.setAttribute('animation__right__walk', {
        property: 'position', from: '0 0 0.15', to: '0 0 -0.15',
        dur: 500, dir: 'alternate', loop: true
    })
    this.rightArm.setAttribute('animation__movement', {
        property: 'position',
        from: '0 -0.08 -0.2', to: '0 0.08 0.2',
        dur: 1000, dir: 'alternate', loop: true
    })
},

// Called when attacker reaches the basket zone — opens minigame
shotToBasket: function () {
    const config = this.getLevelConfig()
    this.phase = 'shooting'

    this.leftArm.removeAttribute('animation__dribling')
    this.rightArm.removeAttribute('animation__movement')
    this.leftLeg.removeAttribute('animation__left__walk')
    this.rightLeg.removeAttribute('animation__right__walk')

    // Open the minigame before animating the shot
    this.updateHud('¡Elige bien el tiro!')

    ShotGame.open(this.level, config.miniGame).then(({ hit, bonus }) => {
        this.lastBonus = hit ? bonus : 0
        this._doShotAnimation(config, hit, bonus)
    })
},

_doShotAnimation: function (config, hit, bonus) {
    this.awaitingScore = hit   // only award score if hit

    this.rightLeg.setAttribute('animation__right__entry', {
        property: 'position', from: '0 0 0.15', to: '0 0 -0.15', dur: 1000
    })

    this.rightLeg.addEventListener('animationcomplete__right__entry', () => {
        this.leftLeg.setAttribute('animation__left__walk', {
            property: 'position', from: '0 0 -0.15', to: '0 0 0.15', dur: 1000
        })

        const isLvl2 = config.basketJumpTo === '-2 1.8 12.5'
        this.leftArm.setAttribute('animation__pre__shot', {
            property: 'position', to: isLvl2 ? '2.8 2.8 0' : '2.65 2.715 0', dur: 1000
        })
        this.leftArm.setAttribute('animation__shot', {
            property: 'rotation', to: isLvl2 ? '10 7 136' : '8.97 4.2 132.5', dur: 1000
        })
        this.attacker.setAttribute('animation__jump', {
            property: 'position', to: config.basketJumpTo, dur: 1000, easing: 'easeInOutQuad'
        })

        this.ball.removeAttribute('animation__ball')
        this.ball.removeAttribute('animation__drible')
        this.ball.setAttribute('animation__pre-shot', {
            property: 'position',
            from: config.preShotFrom, to: config.preShotTo, dur: config.preShotDuration
        })

        this.ball.addEventListener('animationcomplete__pre-shot', () => {
            // If player missed, deflect ball sideways
            const dest = hit ? config.shotTo : this._missTarget(config.shotTo)
            this.ball.setAttribute('animation__shot', {
                property: 'position', to: dest, dur: config.shotDuration
            })
        }, { once: true })

        this.ball.addEventListener('animationcomplete__shot', () => {
            this.ball.setAttribute('animation__shot__finish', {
                property: 'position', to: config.finishTo, dur: config.finishDuration
            })
            if (!hit) {
                // Miss: no score event, resolve manually
                setTimeout(() => {
                    this.awaitingScore = false
                    this.resolveScore()
                }, config.finishDuration + 200)
            }
        }, { once: true })
    }, { once: true })
},

_missTarget: function (shotTo) {
    // Deflect slightly right/left to look like a rim miss
    const parts = shotTo.split(' ').map(Number)
    parts[0] += (Math.random() > .5 ? 1.5 : -1.5)
    parts[1] -= 1
    return parts.join(' ')
},

resolveScore: function () {
    const hit   = this.lastBonus > 0
    const bonus = this.lastBonus || 0

    if (hit) this.score += bonus

    if (this.level === 1) {
        if (hit) {
            this.updateHud(`¡Encestaste! +${bonus} pts. Nivel 2 desbloqueado.`)
            this.level = 2
            this.levelValue.textContent = '2'
            this.startTimer = setTimeout(() => { this.startLevel(2) }, 1400)
        } else {
            this.updateHud('Fallaste el tiro. Reintentando nivel 1…')
            this.startTimer = setTimeout(() => { this.startLevel(1) }, 1400)
        }
        return
    }

    // Level 2 finished
    if (hit) {
        this.updateHud('¡Encestaste! Juego completado.')
    } else {
        this.updateHud('Fallaste. Juego terminado.')
    }
    this.phase = 'complete'

    // Save and show end screen
    const name = window._playerName || 'Jugador'
    saveScore(name, this.score)

    setTimeout(() => { this._showEndScreen(name) }, 1200)
},

_showEndScreen: function (name) {
    const endScreen = document.getElementById('end-screen')
    document.getElementById('end-name-display').textContent = name
    document.getElementById('end-score-display').textContent = this.score + ' pts'
    endScreen.classList.add('active')

    document.getElementById('play-again-btn').onclick = () => {
        endScreen.classList.remove('active')
        this.score = 0
        this.level = 1
        this.lastBonus = null
        this.gameActive = true
        renderLeaderboard()
        this.startLevel(1)
    }
}


})