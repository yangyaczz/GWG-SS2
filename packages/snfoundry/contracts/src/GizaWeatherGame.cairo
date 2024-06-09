use starknet::ContractAddress;

const OWNER_ROLE: felt252 = selector!("OWNER_ROLE");

#[derive(Serde, Drop, starknet::Store)]
struct Round {
    round_id: u64,
    start_timestamp: u64,
    duration_timestamp: u64,
    end_timestamp: u64,
    bet_award: u64,
    is_over: bool,
    is_rain: bool,
}

#[derive(Serde, Drop, starknet::Store)]
struct Bet {
    is_participated: bool,
    is_bet_rain: bool,
    is_over: bool,
}


#[starknet::interface]
trait IGWG<TContractState> {
    fn create_round(ref self: TContractState, start_timestamp: u64, probability: u64);
    fn place_bet(ref self: TContractState, round_id: u64, prediction: bool);
    fn over_round(ref self: TContractState, round_id: u64, is_rain: bool);
    fn claim_reward(ref self: TContractState, round_id: u64);
    fn grant_owner(ref self: TContractState, new_owner: ContractAddress);

    fn get_current_round_id(self: @TContractState) -> u64;
    fn get_duration_interval(self: @TContractState) -> u64;
    fn get_settlement_interval(self: @TContractState) -> u64;
    fn get_multi(self: @TContractState) -> u64;
    fn get_round(self: @TContractState, round_id: u64) -> Round;
    fn get_user_bet(self: @TContractState, user: ContractAddress, round_id: u64) -> Bet;

    fn get_rounds(self: @TContractState, round_ids: Array<u64>) -> Array<Round>;
    fn get_bets(self: @TContractState, user: ContractAddress, round_ids: Array<u64>) -> Array<Bet>;
}


#[starknet::contract]
mod GizaWeatherGame {
    use core::array::ArrayTrait;
    use core::traits::Into;
    use openzeppelin::access::accesscontrol::AccessControlComponent;
    use openzeppelin::access::accesscontrol::DEFAULT_ADMIN_ROLE;
    use openzeppelin::introspection::src5::SRC5Component;
    use openzeppelin::token::erc20::ERC20Component;
    use starknet::{ContractAddress, get_block_timestamp, get_caller_address};
    use super::{OWNER_ROLE, Round, Bet};

    component!(path: ERC20Component, storage: erc20, event: ERC20Event);
    component!(path: AccessControlComponent, storage: accesscontrol, event: AccessControlEvent);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);

    #[abi(embed_v0)]
    impl ERC20MixinImpl = ERC20Component::ERC20MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl AccessControlMixinImpl =
        AccessControlComponent::AccessControlMixinImpl<ContractState>;

    impl ERC20InternalImpl = ERC20Component::InternalImpl<ContractState>;
    impl AccessControlInternalImpl = AccessControlComponent::InternalImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc20: ERC20Component::Storage,
        #[substorage(v0)]
        accesscontrol: AccessControlComponent::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        current_round_id: u64,
        duration_interval: u64,
        settlement_interval: u64,
        multi: u64,
        rounds: LegacyMap<u64, Round>,
        user_bets: LegacyMap<(ContractAddress, u64), Bet>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC20Event: ERC20Component::Event,
        #[flat]
        AccessControlEvent: AccessControlComponent::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
    }

    #[constructor]
    fn constructor(ref self: ContractState, default_admin: ContractAddress) {
        self.erc20.initializer("GWG", "GWG");
        self.accesscontrol.initializer();

        self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, default_admin);
        self.accesscontrol._grant_role(OWNER_ROLE, default_admin);

        self.duration_interval.write(60 * 60);
        self.settlement_interval.write(60 * 60 * 24);
        self.multi.write(1);
    }


    #[abi(embed_v0)]
    impl GWG of super::IGWG<ContractState> {
        fn create_round(ref self: ContractState, start_timestamp: u64, probability: u64) {
            self.accesscontrol.assert_only_role(OWNER_ROLE);

            assert(probability <= 100, 'Invalid probability');
            self.current_round_id.write(self.current_round_id.read() + 1);

            self
                .rounds
                .write(
                    self.current_round_id.read(),
                    Round {
                        round_id: self.current_round_id.read(),
                        start_timestamp: get_block_timestamp(),
                        duration_timestamp: get_block_timestamp() + self.duration_interval.read(),
                        end_timestamp: get_block_timestamp() + self.settlement_interval.read(),
                        bet_award: probability * self.multi.read(),
                        is_over: false,
                        is_rain: false,
                    }
                );
        }
        fn place_bet(ref self: ContractState, round_id: u64, prediction: bool) {
            let round = self.rounds.read(round_id);
            assert(!round.is_over, 'Round is over');
            // assert(get_block_timestamp() <=round.duration_timestamp, 'Bet time is over');  // for demo test

            let caller = get_caller_address();
            let bet = self.user_bets.read((caller, round_id));
            assert(!bet.is_participated, 'Has participated');

            self
                .user_bets
                .write(
                    (caller, round_id),
                    Bet { is_participated: true, is_bet_rain: prediction, is_over: false, }
                );
        }


        fn over_round(ref self: ContractState, round_id: u64, is_rain: bool) {
            self.accesscontrol.assert_only_role(OWNER_ROLE);

            let round = self.rounds.read(round_id);
            assert(!round.is_over, 'Round is over');

            self
                .rounds
                .write(
                    round_id,
                    Round {
                        round_id: round.round_id,
                        start_timestamp: round.start_timestamp,
                        duration_timestamp: round.duration_timestamp,
                        end_timestamp: round.end_timestamp,
                        bet_award: round.bet_award,
                        is_over: true,
                        is_rain: is_rain,
                    }
                );
        }


        fn claim_reward(ref self: ContractState, round_id: u64) {
            let round = self.rounds.read(round_id);
            assert(round.is_over, 'Round isnt over');

            let caller = get_caller_address();
            let bet = self.user_bets.read((caller, round_id));

            assert(bet.is_participated, 'Didnt participate');
            assert(!bet.is_over, 'Reward already claimed');
            assert(bet.is_bet_rain == round.is_rain, 'Bet error');

            self
                .user_bets
                .write(
                    (caller, round_id),
                    Bet {
                        is_participated: bet.is_participated,
                        is_bet_rain: bet.is_bet_rain,
                        is_over: true,
                    }
                );

            let amount = round.bet_award * self.multi.read();

            self.erc20._mint(caller, amount.into() * 1_000_000_000_000_000_000);
        }

        fn grant_owner(ref self: ContractState, new_owner: ContractAddress) {
            self.accesscontrol.assert_only_role(OWNER_ROLE);
            self.accesscontrol._grant_role(OWNER_ROLE, new_owner);
        }

        fn get_current_round_id(self: @ContractState) -> u64 {
            self.current_round_id.read()
        }
        fn get_duration_interval(self: @ContractState) -> u64 {
            self.duration_interval.read()
        }
        fn get_settlement_interval(self: @ContractState) -> u64 {
            self.settlement_interval.read()
        }
        fn get_multi(self: @ContractState) -> u64 {
            self.multi.read()
        }
        fn get_round(self: @ContractState, round_id: u64) -> Round {
            self.rounds.read(round_id)
        }
        fn get_user_bet(self: @ContractState, user: ContractAddress, round_id: u64) -> Bet {
            self.user_bets.read((user, round_id))
        }


        fn get_rounds(self: @ContractState, round_ids: Array<u64>) -> Array<Round> {
            let mut rounds: Array<Round> = ArrayTrait::new();

            let mut i = 0;
            loop {
                if i == round_ids.len() {
                    break ();
                }
                let r = self.rounds.read(*round_ids.at(i));
                rounds.append(r);
                i = i + 1;
            };
            rounds
        }


        fn get_bets(
            self: @ContractState, user: ContractAddress, round_ids: Array<u64>
        ) -> Array<Bet> {
            let mut bets: Array<Bet> = ArrayTrait::new();

            let mut i = 0;
            loop {
                if i == round_ids.len() {
                    break ();
                }
                let b = self.user_bets.read((user, *round_ids.at(i)));
                bets.append(b);
                i = i + 1;
            };
            bets
        }
    }
}
