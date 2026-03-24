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
                from: '0 0 -0.2',
                to: '0 0 0.2', 
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
            to: '-7.5 0 7.5',
            dur: 5000, 
            delay: 1000
        })

        this.attacker.setAttribute('animation__go__basket', {
            property: 'position', 
            from: '-7.5 0 7.5',
            to: '-7.5 0 15', 
            dur: 2500, 
        })

        //ball's drible
        this.ball.setAttribute('animation__drible', {
            property: 'position', 
            from: '1.2 1.4 -4.95141', 
            to: '1.2 0.5 -4.95141',
            dir: 'alternate',
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
    }

})