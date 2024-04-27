import axios from "axios";
import { db } from '@/services/firebase.js'; 
// import { collection, getDocs } from 'firebase/firestore';


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

    pile: [
        {tile: null},
        {tile: null},
    ],
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

    async fetchUsers({commit}) {
        const usersRef = db.collection('users');
        try {
            const snapshot = await usersRef.get();
            const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            commit('setUsers', users); // You might need to create this mutation
            console.log("users",users)
        } catch (error) {
            console.error("Error fetching users: ", error);
        }
    },

    async fetchHand({commit, state, dispatch}, userIndex) {  // Corrected by adding 'dispatch' to the destructured context
        if (state.users && state.users.length > userIndex) {
            const userId = state.users[userIndex].id;
            try {
                const response = await axios.get(`http://127.0.0.1:5000/playerhand?userId=${userId}`);
                response.data.forEach(item => {
                    if (item.hand && item.userId) {
                        commit('setHand', {
                            'playerId': item.userId,
                            'hand': item.hand
                        });
                    }
                });
                dispatch('updateTilesAmount', response.data[0].remaining);  // Now 'dispatch' is correctly defined
            } catch (error) {
                console.error(error.response.data);
            }
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
    
    updateTilesAmount({commit}, amount) {
        commit('updateTilesAmount', amount);
    },

    incrementRound({commit}, userId) {
        commit('incrementRound');
        commit('setTurn', userId);
    },

    randomStart({commit}) {
        let random = Math.round(Math.random());
        commit('setTurn', random);
    },
    async gameStart({commit, dispatch}, { player1Id, player2Id }) {
        commit('restartGame');
        try {
            // Call to initialize the game on the backend with Firebase IDs
            await axios.post("http://127.0.0.1:5000/initialize_game", {
                player1_id: player1Id,
                player2_id: player2Id
            });
    
            await dispatch('fetchDeck');
            await Promise.all([
                dispatch('fetchHand', 0),
                dispatch('fetchHand', 1)
            ]);
            dispatch('randomStart');
            commit('setGameStart', true);
        } catch (error) {
            console.error("Error starting game:", error.response ? error.response.data : error);
        }
    },
    

    setGameOver({commit}, winner) {
        commit('gameOver', winner);
    }, 

    updatePlayerScore({commit}, {userId, amount}) {
        commit('updatePlayerScore', { userId: userId, amount: amount });

    }, 
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
                'color': tile[1],
                'selected': false,
            })
        });
        console.log(state.players[0].hand)
    },
    removeTileFromHand(state, { userId, tileIndex }) {
        state.players[userId].hand.splice(tileIndex, 1);
        console.log("hand:", state.players[userId].hand)
    },
    updateTilesAmount: (state, amount) => (state.deck.remaining = amount),

    updatePlayerScore: (state, {userId, amount}) => {
        // console.log(` userId: ${userId} with amount: ${amount}`);
        state.players[userId].score += amount;
    },
    setUsers: (state, users) => (state.users = users),

};

export default {
    state,
    getters,
    actions,
    mutations
}
