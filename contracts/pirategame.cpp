#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>

#include <string>

#include "pirategame.hpp"


using namespace eosio;
using namespace std;

int8_t check_leader(uint8_t turn, int8_t curLeader, const std::vector<uint8_t>&  actives, const std::vector<int8_t>& lvotes){
	///todo check time out
	std::vector<int8_t>  l;
	for(int8_t i=0;i<actives.size();i++){
		l.push_back(0);
	}
				
	for(int8_t i=0;i<actives.size();i++){
		if(actives[i]){
			if(lvotes[turn * actives.size() + i] == -1){
				//return -1;
				continue;
			}
			l[lvotes[turn * actives.size() + i]]++;
		}				
	}
	
	int8_t max = 0;
	int8_t idx = -1;
	
	if(curLeader >= 0 && curLeader < actives.size() && actives[curLeader] && l[curLeader] > 0){
		idx = curLeader;
		max = l[curLeader];
	}
	
	for(int8_t i=0;i<l.size();i++){
		if(!actives[i] || l[i] == 0){
			continue;
		}
		if(idx == -1 || l[i] > max){
			idx = i;
			max = l[i];
		}		
	}
	return idx;
}

int8_t judgment(uint8_t turn, const std::vector<uint8_t>&  actives, const std::vector<int8_t>& dvotes){
	uint8_t total = 0;
	uint8_t yes = 0;
	uint8_t no = 0;	
	for(int8_t i=0;i<actives.size();i++){
		if(actives[i]){			
			total++;
			if(dvotes[turn * actives.size() + i] == 1){
				yes++;
			} else if(dvotes[turn * actives.size() + i] == 0){
				no++;
			}
		}				
	}
	//undefine -1, ignore 0, pass 1, noone 2
	if((yes * 2) > total) return 1; //>50%
	if((no * 2) >= total) return 0; //>50%
	if(total == 2) return 2;
	return -1;
}

void pirategame::create(
    uint64_t gameId, std::vector<string> players, name bidder, asset amount) {    
	require_auth(bidder);
	
	// validate eos
    //eosio_assert(amount.symbol == string_to_symbol(4, "EOS"), "pirategame only accepts EOS for transfers");
	//eosio_assert(amount.is_valid(), "Invalid token transfer");
	//eosio_assert(amount.amount >= 0, "amount cannot be negative");
	
	// Check if game already exists
	games existing_host_games(_self, _self.value);	
	auto itr = existing_host_games.find( gameId );
	eosio_assert(itr == existing_host_games.end(), "game exists");
	
	existing_host_games.emplace(_self, [&]( auto& g ) {
		g.key = gameId;//existing_host_games.available_primary_key(),
		g.reset_game(amount, players);
	});
    
}

void pirategame::join(uint64_t gameId, name caller, string player){
	require_auth( caller );
	
	games existing_host_games(_self, _self.value);
	auto itr = existing_host_games.find( gameId );
	eosio_assert(itr != existing_host_games.end(), "game doesn't exists");
	
	eosio_assert(turn == -1, "game started!");
	
	int8_t idx = -1;
	for(int8_t i=0;i<itr->players.size();i++){
		eosio_assert(itr->players[i] != player, "duplicate player!");		
	}
	
	existing_host_games.modify(itr, _self, [&]( auto& g ) {
		g.callers.push(caller);
		g.players.push(player);
		if(g.players.size() == g.max_player){
			g.next_turn();
		}
		
   });
}

void pirategame::leadervote(
	uint64_t gameId, 
	string player, 
	int8_t v){
	
	games existing_host_games(_self, _self.value);
	auto itr = existing_host_games.find( gameId );
	eosio_assert(itr != existing_host_games.end(), "game doesn't exists");

	// Check if this game belongs to the action sender
	int8_t idx = -1;
	for(int8_t i=0;i<itr->players.size();i++){
		if(itr->players[i] == player){
			idx = i;
			break;
		}
	}
	
	eosio_assert(idx != -1, "this is not your game!");
	require_auth( itr->callers[idx] );
	
	int8_t slot = itr->turn * itr->players.size() + idx;
	eosio_assert(itr->actives[idx] != 0, "you lose!");
	eosio_assert(itr->lvotes[slot] == -1, "already voted!");
	eosio_assert(v >= 0 && v <= itr->players.size(), "wrong vote value!");
	eosio_assert(itr->actives[v] != 0, "wrong vote leader!");
	
	existing_host_games.modify(itr, _self, [&]( auto& g ) {
		g.lvotes[slot] = v;
		g.leader = check_leader(g.turn, g.leader, g.actives, g.lvotes);		
   });
}

void pirategame::decision(        
	uint64_t gameId, 
	string player,
	std::vector<int8_t> d){	
	
	games existing_host_games(_self, _self.value);
	auto itr = existing_host_games.find( gameId );
	eosio_assert(itr != existing_host_games.end(), "game doesn't exists");

	// Check if this game belongs to the action sender
	int8_t idx = -1;
	for(int8_t i=0;i<itr->players.size();i++){
		if(itr->players[i] == player){
			idx = i;
			break;
		}
	}
	eosio_assert(idx != -1, "this is not your game!");
	require_auth( itr->callers[idx] );
	
	eosio_assert(itr->actives[idx] != 0, "you lose!");
	
	int8_t leader = itr->leader;
	if(itr->leader == -1){
		leader = check_leader(itr->turn, itr->leader, itr->actives, itr->lvotes);
	}
	eosio_assert(idx == leader, "not leader!");
	
	eosio_assert(d.size() == itr->players.size(), "wrong decision size!");	
	
	int8_t total = 0;
	for(int8_t i=0;i<itr->players.size();i++){
		if(itr->actives[i] == 0){
			continue;
		}
		eosio_assert(itr->lvotes[itr->turn * itr->players.size() + i] != -1, "need all votes!");
		
		if(d[i] != 0){
			total += d[i];
			eosio_assert(itr->actives[i] == 1, "wrong decision!");
		}
	}
	eosio_assert(total == 10, "wrong total decision!");
	
	
	
	existing_host_games.modify(itr, _self, [&]( auto& g ) {
		if(g.leader == -1){
			g.leader = idx;
		}
		for(int8_t i=0;i<g.players.size();i++){			
			if(d[i] != 0){
				g.decisions[g.turn * g.players.size() + i] = d[i];
			}
		}
		g.dvotes[g.turn * g.players.size() + idx] = 1;		
		//g.status = judgment(g.actives, g.dvotes);
   });
}

void pirategame::decisionvote(
	uint64_t gameId, 
	string player, 
	int8_t v){

	games existing_host_games(_self, _self.value);
	auto itr = existing_host_games.find( gameId );
	eosio_assert(itr != existing_host_games.end(), "game doesn't exists");

	// Check if this game belongs to the action sender
	int8_t idx = -1;
	for(int8_t i=0;i<itr->players.size();i++){
		if(itr->players[i] == player){
			idx = i;
			break;
		}
	}
	eosio_assert(idx != -1, "this is not your game!");
	require_auth( itr->callers[idx] );
	
	eosio_assert(itr->actives[idx] != 0, "you lose!");
	eosio_assert(itr->dvotes[itr->turn * itr->players.size() + idx] == -1, "already voted!");
	
	int8_t total = 0;
	for(int8_t i=0;i<itr->players.size();i++){
		total += itr->decisions[itr->turn * itr->players.size() + i];
	}
	eosio_assert(total == 10, "not decision yet!");	
	eosio_assert(v == 0 || v == 1, "wrong vote value!");
	
	existing_host_games.modify(itr, _self, [&]( auto& g ) {
		g.dvotes[g.turn * g.players.size() + idx] = v;
		int8_t result = judgment(g.turn, g.actives, g.dvotes);
		
		if(result == 0){			
			g.actives[g.leader] = 0;
			g.next_turn();			
		} else if(result == 1){
			g.status = 1;
		} else if(result == 2){
			g.status = 2;
		}		
   });
}

//EOSIO_ABI(pirategame, (create)(leadervote)(decision)(decisionvote))
EOSIO_DISPATCH(pirategame, (create)(join)(leadervote)(decision)(decisionvote))
