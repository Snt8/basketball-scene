AFRAME.registerComponent('basketball-play', {
    init: function(){
        //Take the characters for the scene
        this.attacker = document.querySelector('#attacker')
        this.defender = document.querySelector('#defender')
        this.ball = document.querySelector('#ball')

        //Take the attacker pieces
        this.leftArm = document.querySelector('#left-arm-container')
        this.rightArm = document.querySelector('#righ-arm-container')
        this.leftLeg = document.querySelector('#left-leg-container')
        this.rightLeg = document.querySelector('#right-leg-container')
        
        // Take the ball
        this.ball = document.querySelector('#ball')

        //Player's status
        this.attackerIsMovement = false;
        this.defenderIsMovement = false;

        //Start the play secuence
        this.staticDribling()

        setTimeout(() => {
            this.driblingSecuence()
        }, 2000)

        this.attacker.addEventListener('animationcomplete__movement', () => {
            this.crossSecuence()
        })

        this.ball.addEventListener('animationcomplete__cross__complete', () => {
            this.secondDriblingSecuence()
        })

        this.attacker.addEventListener('animationcomplete__go__basket', () => {
            this.shotToBasket()
        })
    },

    staticDribling : function() {
        //removing every animation already exists
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

        if(!this.attackerIsMovement){
            //Check if the player isn't moving
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
        }
    },

    driblingSecuence : function() {
        //Start changing the static movement boolean
        this.attackerIsMovement = true
        //Remove every animation already exists
        this.leftArm.removeAttribute('animation__dribling')
        this.leftLeg.removeAttribute('animation__static__left__leg')
        this.rightLeg.removeAttribute('animation__static__right__leg')

        if(this.attackerIsMovement){
            //first movement
            this.attacker.setAttribute('animation__movement', {
                property: 'position', 
                to: '-10 0 10', 
                dur: 5000, 
                easing: 'easeInOutQuad'
            });

            this.leftArm.setAttribute('animation__dribling', {
                property: 'position', 
                from: '0 -0.08 -0.2',
                to: '0 0.08 0.2', 
                dur: 800, 
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
            });

            this.rightLeg.setAttribute('animation__right__walk', {
                property: 'position', 
                from: '0 0 0.15',
                to: '0 0 -0.15', 
                dur: 500,
                dir: 'alternate', 
                loop: true
            });
        }
    },

    crossSecuence : function(){
        this.attackerIsMovement = true

        //Remove the last animations in scene
        this.rightArm.removeAttribute('animation__dribling')
        this.leftArm.removeAttribute('animation__dribling')
        this.leftLeg.removeAttribute('animation__left__walk')
        this.rightLeg.removeAttribute('animation__right__walk')
        
        this.rightArm.setAttribute('position', '-1 0 0')
        this.leftArm.setAttribute('position', '1 0.30') 

        //Prepare the arms position for the cross
        this.rightArm.setAttribute('rotation', '0.182 -6.374 -6')
        this.leftArm.setAttribute('rotation', '-3.58 3.64 12.3')


        //start the cross movement
        this.ball.setAttribute('animation__cross__half', {
            property: 'position',
            from: '-0.8 1.1 -4.95141',  
            to: '0.5 0.69 -4.3',  
            dur: 1000,
            easing: 'easeInOutQuad'
        })

        this.ball.setAttribute('animation__cross__complete', {
            property: 'position',
            from: '0.5 0.69 -4.3',  
            to: '1.2 1.4 -4.95141',  
            dur: 1000,
            delay: 1000,
            easing: 'easeInOutQuad'
        })
    },


    secondDriblingSecuence : function(){
        //remove last animations
        this.leftArm.removeAttribute('rotation')
        this.rightArm.removeAttribute('rotation')
        this.leftArm.removeAttribute('position')
        this.rightArm.removeAttribute('position')

        
        //Left hand drible
        this.leftArm.setAttribute('animation__dribling', {
            property: 'rotation', 
            from: '-2.5 5 -15',
            to: '0 -15 25',
            dir: 'alternate', 
            dur: 400,
            loop: true,
            easing: 'easeInOutQuad'
        })

        //attacker movement to the basket
        this.attacker.setAttribute('animation__entry__area', {
            property: 'position', 
            from: '-10 0 10',
            to: '-3 0 12',
            dur: 5000, 
            easing: 'easeInOutQuad'
        })

        this.attacker.addEventListener('animationcomplete__entry__area', () => {

            this.attacker.setAttribute('animation__go__basket', {
                property: 'position', 
                from: '-3 0 12',
                to: '-3 0 13', 
                dur: 2500, 
                easing: 'easeInOutQuad'
            })
        })

        //ball's drible
        this.ball.setAttribute('animation__drible', {
            property: 'position', 
            from: '1.2 1.4 -4.95141', 
            to: '1.2 0.5 -4.95141',
            dir: 'alternate',
            dur: 600,
            loop: true

        })

        //Legs movement to walk
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

        //right arm movement
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

    //remove attributes and last listeners
    this.leftArm.removeAttribute('animation__dribling')
    this.rightArm.removeAttribute('animation__movement')
    this.leftLeg.removeAttribute('animation__left__walk')
    this.rightLeg.removeAttribute('animation__right__walk')

    this.rightLeg.removeEventListener('animationcomplete__right__entry', this._onRightEntry)
    this.ball.removeEventListener('animationcomplete__pre__shot', this._onPreShot)
    this.ball.removeEventListener('animationcomplete__shot__finish', this._onShotFinish)

    //legs do two steps before the basket
    this.rightLeg.setAttribute('animation__right__entry', {
        property: 'position',
        from: '0 0 0.15',
        to: '0 0 -0.15',
        dur: 1000
    })

    this._onRightEntry = () => {
        this.leftLeg.setAttribute('animation__left__walk', {
            property: 'position',
            from: '0 0 -0.15',
            to: '0 0 0.15',
            dur: 1000,
        })

        //prepare the arm to shot
        this.leftArm.setAttribute('animation__pre__shot', {
            property: 'position',
            to: '2.65 2.715 0',
            dur: 1000,
        })

        this.leftArm.setAttribute('animation__shot', {
            property: 'rotation',
            to: '8.97 4.2 132.5',
            dur: 1000,
        })

        //time to shot
        this.attacker.setAttribute('animation__jump', {
            property: 'position',
            to: '-3 1.5 13',
            dur: 1000,
            easing: 'easeInOutQuad'
        })

        this.ball.removeAttribute('animation__ball')
        this.ball.removeAttribute('animation__drible')
        this.ball.setAttribute('animation__pre-shot', {
            property: 'position',
            from: '0.54 1.2 -5',
            to: '0.9 3.3 -4.9',
            dur: 1000
        })
    }

    this._onPreShot = () => {
        this.ball.setAttribute('animation__shot', {
            property: 'position',
            to: '2.9 7.1 -3.1',
            dur: 1000,
        })
    }

    //finish the     jump
    this._onShotFinish = () => {
        this.ball.setAttribute('animation__shot__finish', {
            property: 'position',
            to: '2.9 0.5 -3.1',
            dur: 1000
        })

        this.attacker.setAttribute('animation__back__floor', {
            property: 'position',
            from: '-3 1.5 13',
            to: '-3 0 13.3',
            dur: 500
        })
    }

    this.rightLeg.addEventListener('animationcomplete__right__entry', this._onRightEntry, { once: true })
    this.ball.addEventListener('animationcomplete__pre-shot', this._onPreShot, { once: true })
    this.ball.addEventListener('animationcomplete__shot', this._onShotFinish, { once: true })
}

})
//Just to say
//that my code has
//350 lines