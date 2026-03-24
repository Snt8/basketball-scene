AFRAME.registerComponent('basketball-play', {
    init: function(){
        //Take the characters for the scene
        this.attacker = document.querySelector('#attacker')
        this.defender = document.querySelector('#defender')

        //Take the attacker pieces
        this.leftArm = document.querySelector('#left-arm-container')
        this.rightArm = document.querySelector('#righ-arm-container')
        this.leftLeg = document.querySelector('#left-leg-container')
        this.rightLeg = document.querySelector('#right-leg-container')

        //Player's status
        this.attackerIsMovement = false;
        this.defenderIsMovement = false;

        //Start the play secuence
        this.staticDribling()

        setTimeout(() => {
            this.driblingSecuence()
        }, 2000)

        this.attacker.addEventListener('animationcomplete__movement', () => {
            this.staticDribling()
        })

        setTimeout(() => {
            this.crossSecuence()
        }, 2000)
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

        this.attackerIsMovement = false
    },
})