//定義遊戲狀態
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAwaits',
  CardMatchFailed: 'CardMatchFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished'
}

// 先設定圖形
const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


//設定單一卡片
const view = {
  getCardElement (index) {
    return `<div data-index="${index}" class="card back"></div>`
  },
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
        <p>${number}</p>
        <img src="${symbol}" />
        <p>${number}</p>
        `
  },
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  //請controller幫我們call洗牌function（只接受打亂過的陣列）
  displayCards(indexes){
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },
//... 把參數轉變成一個陣列來迭代
flipCards (...cards) {
  cards.map(card => {
  //如果是背面的話 要回傳正面
    if(card.classList.contains('back')){
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index)) 
      return
  
  
      }
    
  //如果是正面的話 要回傳背面
  card.classList.add('back')
  //排背的狀態不會有數字，所以要清空
  card.innerHTML = null
  })
},
  //配對成功地顯示
  pairCards (...cards) {
    cards.map(card =>{
      card.classList.add('paired')
    })
    
  },

  renderTriedTimes(times){
    document.querySelector('.tried').textContent = `You've tried ${times} times`
  },

  renderScore(score){
    document.querySelector('.score').textContent = `score: ${score}`

  },

  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      //為了讓動畫跑完之後能消除，讓動畫可以重播
      card.addEventListener('animationend', event =>
      event.target.classList.remove('.wrong'),
      {
        once: true
      }
      )
    })
  },
  showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }

  
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length -1; index > 0; index -- ){
      let randomIndex = Math.floor(Math.random() * (index+1))
      ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
     return number
  }
}

const model = {
  revealedCards: [],
  //判斷翻牌後兩個數字是否一樣
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
  },

  score: 0,
  
  triedTimes: 0
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  //呼叫controller去推進遊戲的進度(依照不同遊戲狀態做不同行為)
  dispatchCardAction(card){
    if(!card.classList.contains('back')){
      return
    }
    switch(this.currentState){
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits  
        break
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        //判斷是否配對成功
        if(model.isRevealedCardsMatched()){
          //配對正確 加上分數
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          //配對失敗
          this.currentState = GAME_STATE.CardMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }
        
        break
    }
    console.log('current.State', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },
  
  resetCards(){
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    //不能用this, 如果用this就換變成resetCard的function，所以我們必須用controller.currentState
    controller.currentState = GAME_STATE.FirstCardAwaits  
  } 
}
controller.generateCards() // 取代 view.displayCards()




//node list (array.like)(不能用Map)
document.querySelectorAll('.card').forEach(card => {
   card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
   })
})