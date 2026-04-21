AFRAME.registerComponent('basketball-play', {
    init: function () {
        this.attacker = document.querySelector('#attacker')
        this.defender = document.querySelector('#defender')
        this.ball = document.querySelector('#ball')

        this.leftArm = document.querySelector('#left-arm-container')
        this.rightArm = document.querySelector('#righ-arm-container')
        this.leftLeg = document.querySelector('#left-leg-container')
        this.rightLeg = document.querySelector('#right-leg-container')

        this.scoreValue = document.querySelector('#score-value')
        this.levelValue = document.querySelector('#level-value')
        this.messageValue = document.querySelector('#status-message')
        this.restartButton = document.querySelector('#restart-game')

        this.score = 0
        this.level = 1
        this.phase = 'idle'
        this.awaitingScore = false
        this.startTimer = null

        this.levelConfigs = {
            1: {
                movementTo: '-10 0 10',
                movementDuration: 5000,
                crossFrom: '-0.8 1.1 -4.95141',
                crossMid: '0.5 0.69 -4.3',
                crossTo: '1.2 1.4 -4.95141',
                crossDuration: 1000,
                crossDelay: 1000,
                entryTo: '-3 0 12',
                entryDuration: 5000,
                basketJumpTo: '-3 1.5 13',
                basketLandingTo: '-3 0 13.3',
                basketDuration: 2500,
                preShotFrom: '0.54 1.2 -5',
                preShotTo: '0.9 3.3 -4.9',
                preShotDuration: 1000,
                shotTo: '2.9 7.1 -3.1',
                shotDuration: 1000,
                finishTo: '2.9 0.5 -3.1',
                finishDuration: 1000,
                leftArmMovement: { from: '0 -0.08 -0.2', to: '0 0.08 0.2', dur: 800 },
                rightArmMovement: { from: '2.5 -5 15', to: '0 15 -25', dur: 600 },
                defenderPosition: '10.46266 -0.38769 8.85094',
                introMessage: 'Nivel 1: encesta para pasar a la siguiente animación.'
            },
            2: {
                movementTo: '-12 0 8',
                movementDuration: 4200,
                crossFrom: '-0.8 1.15 -4.95141',
                crossMid: '0.7 0.72 -4.0',
                crossTo: '1.6 1.5 -4.95141',
                crossDuration: 850,
                crossDelay: 850,
                entryTo: '-2 0 11',
                entryDuration: 3800,
                basketJumpTo: '-2 1.8 12.5',
                basketLandingTo: '-2 0 12.7',
                basketDuration: 2200,
                preShotFrom: '0.65 1.25 -5',
                preShotTo: '1.1 3.6 -4.6',
                preShotDuration: 900,
                shotTo: '3.2 7.6 -2.7',
                shotDuration: 900,
                finishTo: '3.2 0.55 -2.7',
                finishDuration: 900,
                leftArmMovement: { from: '0 -0.1 -0.2', to: '0 0.1 0.2', dur: 700 },
                rightArmMovement: { from: '2.5 -5 15', to: '0 18 -28', dur: 500 },
                defenderPosition: '8.8 -0.38769 7.2',
                introMessage: 'Nivel 2: otro enceste completa el juego.'
            }
        }

        this.staticDribling()

        this.attacker.addEventListener('animationcomplete__movement', () => {
            if (this.phase === 'attack-moving') {
                this.crossSecuence()
            }
        })

        this.ball.addEventListener('animationcomplete__cross__complete', () => {
            if (this.phase === 'crossing') {
                this.secondDriblingSecuence()
            }
        })

        this.attacker.addEventListener('animationcomplete__entry__area', () => {
            if (this.phase === 'approaching-basket') {
                this.shotToBasket()
            }
        })

        this.ball.addEventListener('animationcomplete__shot__finish', () => {
            if (this.awaitingScore) {
                this.awaitingScore = false
                this.resolveScore()
            }
        })

        this.restartButton.addEventListener('click', () => {
            this.restartGame()
        })

        this.startLevel(1)
    },

    updateHud: function (message) {
        this.scoreValue.textContent = String(this.score)
        this.levelValue.textContent = String(this.level)
        this.messageValue.textContent = message
    },

    clearStartTimer: function () {
        if (this.startTimer) {
            clearTimeout(this.startTimer)
            this.startTimer = null
        }
    },

    getLevelConfig: function () {
        return this.levelConfigs[this.level] || this.levelConfigs[1]
    },

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

        this.startTimer = setTimeout(() => {
            this.driblingSecuence()
        }, 1800)
    },

    restartGame: function () {
        this.score = 0
        this.level = 1
        this.updateHud('Juego reiniciado. Vuelve a encestar para avanzar.')
        this.startLevel(1)
    },

    staticDribling: function () {
        this.attacker.removeAttribute('animation__movement')
        this.leftArm.removeAttribute('animation__dribling')
        this.rightArm.removeAttribute('animation__dribling')
        this.leftLeg.removeAttribute('animation__left__walk')
        this.rightLeg.removeAttribute('animation__right__walk')

        this.rightArm.setAttribute('animation__dribling', {
            property: 'rotation',
            from: '2.5 -5 15',
            to: '0 15 -25',
            dur: 600,
            loop: true,
            dir: 'alternate'
        })

        this.ball.setAttribute('animation__ball', {
            property: 'position',
            from: '-1.0 1.1 -4.95141',
            to: '-1.0 0.5 -4.95141',
            loop: true,
            dir: 'alternate'
        })

        this.leftArm.setAttribute('animation__dribling', {
            property: 'position',
            to: '0.1 0.15 0',
            dur: 800,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        })

        this.rightLeg.setAttribute('animation__static__right__leg', {
            property: 'position',
            to: '0 0.05 0',
            dur: 1000,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        })

        this.leftLeg.setAttribute('animation__static__left__leg', {
            property: 'position',
            to: '0 0.05 0',
            dur: 1000,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        })
    },

    driblingSecuence: function () {
        const config = this.getLevelConfig()

        this.phase = 'attack-moving'

        this.leftArm.removeAttribute('animation__dribling')
        this.leftLeg.removeAttribute('animation__static__left__leg')
        this.rightLeg.removeAttribute('animation__static__right__leg')

        this.attacker.setAttribute('animation__movement', {
            property: 'position',
            to: config.movementTo,
            dur: config.movementDuration,
            easing: 'easeInOutQuad'
        })

        this.leftArm.setAttribute('animation__dribling', {
            property: 'position',
            from: config.leftArmMovement.from,
            to: config.leftArmMovement.to,
            dur: config.leftArmMovement.dur,
            dir: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        })

        this.leftLeg.setAttribute('animation__left__walk', {
            property: 'position',
            from: '0 0 -0.15',
            to: '0 0 0.15',
            dur: 500,
            dir: 'alternate',
            loop: true
        })

        this.rightLeg.setAttribute('animation__right__walk', {
            property: 'position',
            from: '0 0 0.15',
            to: '0 0 -0.15',
            dur: 500,
            dir: 'alternate',
            loop: true
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
            from: config.crossFrom,
            to: config.crossMid,
            dur: config.crossDuration,
            easing: 'easeInOutQuad'
        })

        this.ball.setAttribute('animation__cross__complete', {
            property: 'position',
            from: config.crossMid,
            to: config.crossTo,
            dur: config.crossDuration,
            delay: config.crossDelay,
            easing: 'easeInOutQuad'
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
            from: '-2.5 5 -15',
            to: '0 -15 25',
            dir: 'alternate',
            dur: 400,
            loop: true,
            easing: 'easeInOutQuad'
        })

        this.attacker.setAttribute('animation__entry__area', {
            property: 'position',
            from: config.movementTo,
            to: config.entryTo,
            dur: config.entryDuration,
            easing: 'easeInOutQuad'
        })

        this.ball.setAttribute('animation__drible', {
            property: 'position',
            from: config.crossTo,
            to: '1.2 0.5 -4.95141',
            dir: 'alternate',
            dur: 600,
            loop: true
        })

        this.leftLeg.setAttribute('animation__left__walk', {
            property: 'position',
            from: '0 0 -0.15',
            to: '0 0 0.15',
            dur: 500,
            dir: 'alternate',
            loop: true
        })

        this.rightLeg.setAttribute('animation__right__walk', {
            property: 'position',
            from: '0 0 0.15',
            to: '0 0 -0.15',
            dur: 500,
            dir: 'alternate',
            loop: true
        })

        this.rightArm.setAttribute('animation__movement', {
            property: 'position',
            from: '0 -0.08 -0.2',
            to: '0 0.08 0.2',
            dur: 1000,
            dir: 'alternate',
            loop: true
        })
    },

    shotToBasket: function () {
        const config = this.getLevelConfig()

        this.phase = 'shooting'
        this.awaitingScore = true

        this.leftArm.removeAttribute('animation__dribling')
        this.rightArm.removeAttribute('animation__movement')
        this.leftLeg.removeAttribute('animation__left__walk')
        this.rightLeg.removeAttribute('animation__right__walk')

        this.rightLeg.setAttribute('animation__right__entry', {
            property: 'position',
            from: '0 0 0.15',
            to: '0 0 -0.15',
            dur: 1000
        })

        this.rightLeg.addEventListener('animationcomplete__right__entry', () => {
            this.leftLeg.setAttribute('animation__left__walk', {
                property: 'position',
                from: '0 0 -0.15',
                to: '0 0 0.15',
                dur: 1000
            })

            this.leftArm.setAttribute('animation__pre__shot', {
                property: 'position',
                to: config.basketJumpTo === '-2 1.8 12.5' ? '2.8 2.8 0' : '2.65 2.715 0',
                dur: 1000
            })

            this.leftArm.setAttribute('animation__shot', {
                property: 'rotation',
                to: config.basketJumpTo === '-2 1.8 12.5' ? '10 7 136' : '8.97 4.2 132.5',
                dur: 1000
            })

            this.attacker.setAttribute('animation__jump', {
                property: 'position',
                to: config.basketJumpTo,
                dur: 1000,
                easing: 'easeInOutQuad'
            })

            this.ball.removeAttribute('animation__ball')
            this.ball.removeAttribute('animation__drible')
            this.ball.setAttribute('animation__pre-shot', {
                property: 'position',
                from: config.preShotFrom,
                to: config.preShotTo,
                dur: config.preShotDuration
            })

            this.ball.addEventListener('animationcomplete__pre-shot', () => {
                this.ball.setAttribute('animation__shot', {
                    property: 'position',
                    to: config.shotTo,
                    dur: config.shotDuration
                })
            }, { once: true })

            this.ball.addEventListener('animationcomplete__shot', () => {
                this.ball.setAttribute('animation__shot__finish', {
                    property: 'position',
                    to: config.finishTo,
                    dur: config.finishDuration
                })
            }, { once: true })
        }, { once: true })
    },

    resolveScore: function () {
        const pointsPerShot = 10
        this.score += pointsPerShot
        this.scoreValue.textContent = String(this.score)

        if (this.level === 1) {
            this.messageValue.textContent = 'Encestaste. Nivel 2 desbloqueado.'
            this.level = 2
            this.levelValue.textContent = '2'

            this.startTimer = setTimeout(() => {
                this.startLevel(2)
            }, 1400)
            return
        }

        this.levelValue.textContent = '2'
        this.messageValue.textContent = 'Encestaste otra vez. Nivel completado.'
        this.phase = 'complete'
    }
})