#include <eosiolib/eosio.hpp>
#include <eosiolib/asset.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/crypto.h>
#include <string>

using namespace eosio;
using namespace std;

//class pirategame : public contract
//class [[eosio::contract("pirategame")]] pirategame : public contract {
CONTRACT pirategame : public contract {
public:
    using contract::contract;    
	//pirategame(name self) : contract(_self,_code,_ds){}
	
	struct [[eosio::table]] game{
		static const uint16_t max_player = 7;
		//static const uint16_t board_height = board_width;
		
		uint64_t      key; // primary key		
		std::vector<name> callers;
		std::vector<string> players;
		std::vector<uint8_t>  actives;
		std::vector<int8_t>  lvotes;
		std::vector<int8_t>  decisions;
		std::vector<int8_t>  dvotes;
		uint8_t          turn;
		uint8_t          step;
		int8_t          leader;
		uint8_t          status = 0;//undefine -1, playing 0, pass 1, noone 2
		asset value;

         // Reset game
        void reset_game(asset amount) {			
			value = amount;
			
			callers.clear();
			players.clear();
			actives.clear();
			lvotes.clear();
			decisions.clear();
			dvotes.clear();
            
            turn = -1;
        }
		
		void next_turn(){
			turn++;
			step = 0;
			leader = -1;
			for(int8_t i=0;i<itr->players.size();i++){
				lvotes.push(-1);
				decisions.push(-1);
				dvotes.push(-1);
			}			
		}
		
         auto primary_key() const { return key; }
         EOSLIB_SERIALIZE( game, (key)(players)(actives)(lvotes)(decisions)(dvotes)(turn)(step)(leader)(status)(value))
    };
	
	typedef eosio::multi_index< "game"_n, game> games;
	//typedef multi_index<N(game), game> gameIndex;
    
    [[eosio::action]] 
	void create(uint64_t gameId, std::vector<string> players, name bidder, asset amount);
	
	[[eosio::action]] 
	void join(uint64_t gameId, name caller, string player);
		
	[[eosio::action]] 
	void leadervote(uint64_t gameId, string player, int8_t v);
		
	[[eosio::action]] 
	void decision(uint64_t gameId, string player, std::vector<int8_t> d);		
	
	[[eosio::action]] 
	void decisionvote(uint64_t gameId, string player, int8_t v);

private:      

};
