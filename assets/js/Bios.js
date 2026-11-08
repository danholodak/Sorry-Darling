const bios = {
    Dan: {
        name: "Dan Holodak",
        role: "Drummer",
        bio: "Dan is more than your average drummer, he's a screen printing prodigy, a fashion icon and a creative jack-of-all-trades."
    },
    Liz: {
        name: "Liz Wagner Biro",
        role: "Vocalist, Guitarist, Songwriter",
        bio: "Liz provides the pipes from which emotion flows from the band to our dear listeners. She feels all the feelings required for good rock and roll, so you don't have to."
    },
    Steve: {
        name: "Steve Bailey",
        role: "Guitarist, Vocalist, Songwriter",
        bio: "Steve is the band's riff factory. He's a master of guitar tones and catchty hooks, and a human rock and roll history encyclopedia."
    },
    Jackie: {
        name: "Jackie Land",
        role: "Bassist",
        bio: "Jackie is the master of a perfectly pocketed chug. Behind her mysterious demeanor is both brains and brawn, and a whole lot of heart."
    },
};

const imageNames = [
'9.png',
'23.png',
'39.png',
];

document.addEventListener('DOMContentLoaded', () => {
    const deckEl = document.getElementById('about-card-deck');
    const nameEl = document.getElementById('bio-name');
    const roleEl = document.getElementById('bio-role');
    const bioEl = document.getElementById('bio-bio');
    const cardButtons = document.querySelectorAll('.about-card-nav .carousel-btn');

    if (!deckEl || !nameEl || !roleEl || !bioEl) return;

    const keys = Object.keys(bios);
    let activeIndex = Math.floor(Math.random() * keys.length);
    let touchStartX = null;
    let touchStartY = null;

    const getDeckTransform = (relativeIndex) => {
        const positions = [
            { x: 0, y: 0, rotate: 0, scale: 1, filter: 'none' },
            { x: 28, y: 18, rotate: 8, scale: 0.96,  filter: 'saturate(0.9) brightness(0.96)' },
            { x: 52, y: 34, rotate: -6, scale: 0.92, filter: 'saturate(0.85) brightness(0.9)' },
            { x: 76, y: 46, rotate: -12, scale: 0.88, filter: 'saturate(0.8) brightness(0.86)' }
        ];

        const config = positions[Math.min(relativeIndex, positions.length - 1)];
        return {
            x: config.x,
            y: config.y,
            rotate: config.rotate + ((Math.random() * 2) - 1) * 4,
            scale: config.scale,
            opacity: config.opacity,
            filter: config.filter,
            z: keys.length - relativeIndex
        };
    };

    const updateBioPanel = (key) => {
        const profile = bios[key];
        const papers = document.querySelectorAll('.paper-sheet');

        papers.forEach((sheet, i) => {
            sheet.classList.remove('is-visible');
            void sheet.offsetWidth;
            sheet.classList.add('is-fading');
            let imageName = imageNames[i % imageNames.length];
            const imagePath = `assets/images/tornPaper/${imageName}`;
            sheet.style.backgroundImage = ` url('${imagePath}')`;
            sheet.style.backgroundSize = '100% 100%';
            sheet.style.backgroundPosition = 'center';
            sheet.style.backgroundRepeat = 'no-repeat';
        });

        window.setTimeout(() => {
            nameEl.textContent = profile.name;
            roleEl.textContent = profile.role;
            bioEl.textContent = profile.bio;

            papers.forEach((sheet) => {
                sheet.classList.remove('is-fading');
                void sheet.offsetWidth;
                sheet.classList.add('is-visible');
            });
        }, 150);
    };

    const renderDeck = () => {
        const cards = deckEl.querySelectorAll('.about-card');

        keys.forEach((key, index) => {
            const relativeIndex = (index - activeIndex + keys.length) % keys.length;
            const profile = bios[key];
            let card = cards[index];

            if (!card) {
                card = document.createElement('img');
                card.className = 'about-card';
                card.dataset.key = key;
                card.alt = profile.name;
                deckEl.appendChild(card);
            }

            const transform = getDeckTransform(relativeIndex);
            card.dataset.key = key;
            card.src = `assets/images/cards/${key}.png`;
            card.alt = profile.name;
            card.style.zIndex = String(transform.z);
            card.style.filter = transform.filter;
            card.style.transform = `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotate}deg) scale(${transform.scale}) translateX(-50%)`;
            card.classList.remove('is-leaving');
            card.classList.remove('is-reentering');
        });

        Array.from(cards).forEach((card, index) => {
            if (!keys[index]) {
                card.remove();
            }
        });
    };

    const showCard = (dir = 1) => {
        const currentKey = keys[activeIndex];
        const currentCard = deckEl.querySelector(`.about-card[data-key="${currentKey}"]`);
        if (dir ===1){
            if (currentCard) {
                currentCard.classList.add('is-leaving');
            }

            window.setTimeout(() => {
                const previousCard = deckEl.querySelector(`.about-card[data-key="${currentKey}"]`);
                const nextKey = keys[(activeIndex + dir + keys.length) % keys.length];
                activeIndex = (activeIndex + dir + keys.length) % keys.length;
                renderDeck();
                const allCards = deckEl.querySelectorAll('img.about-card')
                allCards.forEach(card => {
                    card.className = 'about-card';
                    console.log(card)
                })

                const trailingCard = deckEl.querySelector(`.about-card[data-key="${currentKey}"]`);
                if (trailingCard && previousCard) {
                    trailingCard.classList.add('is-reentering');
                }

                updateBioPanel(nextKey);
            }, 420);
        } else {
            const bottomcardkey = keys[(activeIndex + 3) % keys.length]
            const bottomCard = deckEl.querySelector(`.about-card[data-key="${bottomcardkey}"]`);
            if (bottomCard) {
                bottomCard.classList.add('is-leaving-prev');
            }
   
           window.setTimeout(() => {
               const previousCard = deckEl.querySelector(`.about-card[data-key="${currentKey}"]`);
               const nextKey = keys[(activeIndex + dir + keys.length) % keys.length];
               activeIndex = (activeIndex + dir + keys.length) % keys.length;
               renderDeck();
               const allCards = deckEl.querySelectorAll('img.about-card')
               allCards.forEach(card => {
                    card.className = 'about-card';
                    console.log(card)
                })
   
               const trailingCard = deckEl.querySelector(`.about-card[data-key="${bottomcardkey}"]`);
            //    console.log({trailingCard})
               if (trailingCard && previousCard) {
                    trailingCard.classList.remove('is-leaving-prev')
                    trailingCard.classList.add('is-reentering-prev');
               }
   
               updateBioPanel(nextKey);
           }, 420);
        //    set a second timeout to remove the is-leaving-prev class
        // window.setTimeout(() => {
        //        const trailingCard = deckEl.querySelector(`.about-card[data-key="${bottomcardkey}"]`);
        //        console.log({trailingCard})
        //        if (trailingCard) {
        //             trailingCard.classList.remove('is-reentering-prev')
        //        }
        //    }, 700);
        }
    };

    cardButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const dir = button.classList.contains('prev') ? -1 : 1;
            showCard(dir);
        });
    });

    const stage = document.querySelector('.about-card-stage');
    if (stage) {
        stage.addEventListener('touchstart', (event) => {
            const touch = event.changedTouches[0];
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
        }, { passive: true });

        stage.addEventListener('touchend', (event) => {
            if (touchStartX === null) return;
            const touch = event.changedTouches[0];
            const diffX = touch.clientX - touchStartX;
            const diffY = touch.clientY - touchStartY;

            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
                showCard(diffX < 0 ? 1 : -1);
            }

            touchStartX = null;
            touchStartY = null;
        }, { passive: true });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth <= 600) {
            deckEl.style.touchAction = 'pan-y';
        } else {
            deckEl.style.touchAction = '';
        }
    });

    renderDeck();
    updateBioPanel(keys[activeIndex]);
});