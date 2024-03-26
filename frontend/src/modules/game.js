import axios from "axios";

const state = {
    game: false,
    round: 0,
    turn: null,
    winner: null,
    finished: false,

    players: [
        {
            name: 'player1',
            score: 0,
            hand: [],
        },
        {
            name: 'player2',
            score: 0,
            hand: [],
        }
    ],

    deck: {
        deck_id: null,
        remaining: null,
    },

    pile:[],
};

const getters = {
    gameState: (state) => {
        return {
            gameStatus: state.game,
            turn: state.turn,
            round: state.round,
            finished: state.finished
        };
    },
    players: (state) => state.players,
    playerHand: (state) => (id) => state.players[parseInt(id)].hand,
    playerScore: (state) => (id) => state.players[parseInt(id)].score,
    deck: (state) => state.deck,
    pile: (state) => state.pile,
    gameOver: (state) => state.finished,
    winner: (state) => state.winner,
};

const actions = {
    async fetchDeck({commit}) {
        try {
            const response = await axios.get("http://127.0.0.1:5000/deck");
            commit('setDeck', response.data);
        } catch(error) {
            console.error(error.response.data)
        }
    },

    async fetchHand({commit, dispatch}) {
        try {
            const response = await axios.get("http://127.0.0.1:5000/playerhand");
            response.data.forEach(item => {
                if (item.hand && item.userId) {
                    commit('setHand', {
                        'playerId': item.userId,
                        'hand': item.hand
                    });
                }
            })
            dispatch('updateTilesAmount', response.data[0].remaining);
        } catch(error) {
            console.error(error.response.data)
        }
    },

    async updateHand({commit, state}, userId) {
        try {
            const response = await axios.post("http://127.0.0.1:5000/playerhand", {
                userId: userId,
                hand: state.players[userId].hand,
            });
            response.data.forEach(item => {
                if (item.hand && item.userId) {
                    commit('setHand', {
                        'playerId': item.userId,
                        'hand': item.hand
                    });
                }
            })
            console.log("update hand:", response)
        } catch (error) {
            console.error(error.response.data)
        }
    },

    async updatePlayerScore({state}, userId) {
        try { 
            const response = await axios.post("http://127.0.0.1:5000/playerscore", {
                userId: userId,
                score: state.players[userId].score,
            });
            console.log("update hand:", response)
        } catch (error){ 
            console.error(error.response.data)
        }
    }, 
    
    async updatePlayerTurn(userId) {
        try {
            const response = await axios.post("http://127.0.0.1:5000/playerturn", {
                userId: userId
            })
            console.log(response)
        } catch (error) {
            console.error(error.response.data)
        }
    },

    async updateTilesPlayed({state}) {
        try {
            const response = await axios.post("http://127.0.0.1:5000/tilesplaced", {
                pile: state.pile
            })
            console.log(response)
        } catch (error) {
            console.error(error.response.data)
        }
    },

    updatePile({commit, dispatch}, tiles) {
        commit('updatePile', tiles);
        dispatch('updateTilesPlayed');
    },

    updateTilesAmount({commit}, amount) {
        commit('updateTilesAmount', amount);
    },

    incrementRound({commit}) {
        commit('incrementRound');
    },

    randomStart({commit}) {
        let random = Math.round(Math.random());
        commit('setTurn', random);
    },
    gameStart({commit, dispatch}) {
        commit('restartGame');

        dispatch('fetchDeck').then(() =>{
            dispatch('fetchHand');
            dispatch('randomStart');
        });
        commit('setGameStart', true);
    },

    setGameOver({commit}, winner) {
        commit('gameOver', winner);
    }
};

const mutations = {
    restartGame: (state) => {
        state.finished = false;
        state.round = 0;
        state.winner = "";
        state.players[0].hand = [];
        state.players[1].hand = [];
        state.pile = [{tile: null}, {tile: null}]
    },
    setGameStart: (state, value) => (state.game = value),
    setTurn: (state, userId) => (state.turn = userId),
    gameOver: (state, winner) => {
        state.winner = winner;
        state.finished = true;
    },
    incrementRound: (state) => (state.round++),
    setDeck: (state, deck) => {
        state.deck.deck_id = deck.id;
        state.deck.remaining = deck.remaining;
    },
    setHand: (state, payload) => {
        let userId = payload.playerId;
        state.players[userId].hand = []
        payload.hand.forEach((tile) => {
            state.players[userId].hand.push({
                'shape': tile[0],
                'color': tile[1]
            })
        });
        console.log(state.players[0].hand)
    },
    removeTileFromHand(state, { userId, tileIndex }) {
        state.players[userId].hand.splice(tileIndex, 1);
        console.log("hand:", state.players[userId].hand)
    },
    updateTilesAmount: (state, amount) => (state.deck.remaining = amount),
    updatePlayerScore: (state, {userId, amount}) => (state.players[userId].score += amount),
    updatePile: (state, tiles) => {
        state.pile.push({
            'shape': tiles.shape,
            'color': tiles.color,
            'position': tiles.position
        })
    }
};

export default {
    state,
    getters,
    actions,
    mutations
}