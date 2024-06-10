"use client";
import type { NextPage } from "next";
import Image from "next/image";
import { BlockNumber } from "starknet";
import React, { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faCaretLeft,
  faCaretRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  faSun,
  faCloudRain,
  faQuestion,
  faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import {
  useAccount,
  useNetwork,
  useContractRead,
  useContractWrite,
  useContract,
} from "@starknet-react/core";

const GWGABI = [
  {
    type: "impl",
    name: "GWG",
    interface_name: "contracts::GizaWeatherGame::IGWG",
  },
  {
    type: "enum",
    name: "core::bool",
    variants: [
      {
        name: "False",
        type: "()",
      },
      {
        name: "True",
        type: "()",
      },
    ],
  },
  {
    type: "struct",
    name: "contracts::GizaWeatherGame::Round",
    members: [
      {
        name: "round_id",
        type: "core::integer::u64",
      },
      {
        name: "start_timestamp",
        type: "core::integer::u64",
      },
      {
        name: "duration_timestamp",
        type: "core::integer::u64",
      },
      {
        name: "end_timestamp",
        type: "core::integer::u64",
      },
      {
        name: "bet_award",
        type: "core::integer::u64",
      },
      {
        name: "is_over",
        type: "core::bool",
      },
      {
        name: "is_rain",
        type: "core::bool",
      },
    ],
  },
  {
    type: "struct",
    name: "contracts::GizaWeatherGame::Bet",
    members: [
      {
        name: "is_participated",
        type: "core::bool",
      },
      {
        name: "is_bet_rain",
        type: "core::bool",
      },
      {
        name: "is_over",
        type: "core::bool",
      },
    ],
  },
  {
    type: "interface",
    name: "contracts::GizaWeatherGame::IGWG",
    items: [
      {
        type: "function",
        name: "create_round",
        inputs: [
          {
            name: "start_timestamp",
            type: "core::integer::u64",
          },
          {
            name: "probability",
            type: "core::integer::u64",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "place_bet",
        inputs: [
          {
            name: "round_id",
            type: "core::integer::u64",
          },
          {
            name: "prediction",
            type: "core::bool",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "over_round",
        inputs: [
          {
            name: "round_id",
            type: "core::integer::u64",
          },
          {
            name: "is_rain",
            type: "core::bool",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "claim_reward",
        inputs: [
          {
            name: "round_id",
            type: "core::integer::u64",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "grant_owner",
        inputs: [
          {
            name: "new_owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "get_current_round_id",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_duration_interval",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_settlement_interval",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_multi",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u64",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_round",
        inputs: [
          {
            name: "round_id",
            type: "core::integer::u64",
          },
        ],
        outputs: [
          {
            type: "contracts::GizaWeatherGame::Round",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_user_bet",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "round_id",
            type: "core::integer::u64",
          },
        ],
        outputs: [
          {
            type: "contracts::GizaWeatherGame::Bet",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_rounds",
        inputs: [
          {
            name: "round_ids",
            type: "core::array::Array::<core::integer::u64>",
          },
        ],
        outputs: [
          {
            type: "core::array::Array::<contracts::GizaWeatherGame::Round>",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_bets",
        inputs: [
          {
            name: "user",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "round_ids",
            type: "core::array::Array::<core::integer::u64>",
          },
        ],
        outputs: [
          {
            type: "core::array::Array::<contracts::GizaWeatherGame::Bet>",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "impl",
    name: "ERC20MixinImpl",
    interface_name: "openzeppelin::token::erc20::interface::ERC20ABI",
  },
  {
    type: "struct",
    name: "core::integer::u256",
    members: [
      {
        name: "low",
        type: "core::integer::u128",
      },
      {
        name: "high",
        type: "core::integer::u128",
      },
    ],
  },
  {
    type: "struct",
    name: "core::byte_array::ByteArray",
    members: [
      {
        name: "data",
        type: "core::array::Array::<core::bytes_31::bytes31>",
      },
      {
        name: "pending_word",
        type: "core::felt252",
      },
      {
        name: "pending_word_len",
        type: "core::integer::u32",
      },
    ],
  },
  {
    type: "interface",
    name: "openzeppelin::token::erc20::interface::ERC20ABI",
    items: [
      {
        type: "function",
        name: "total_supply",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "balance_of",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "allowance",
        inputs: [
          {
            name: "owner",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "transfer",
        inputs: [
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "transfer_from",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "approve",
        inputs: [
          {
            name: "spender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "name",
        inputs: [],
        outputs: [
          {
            type: "core::byte_array::ByteArray",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "symbol",
        inputs: [],
        outputs: [
          {
            type: "core::byte_array::ByteArray",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "decimals",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u8",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "totalSupply",
        inputs: [],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "balanceOf",
        inputs: [
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::integer::u256",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "transferFrom",
        inputs: [
          {
            name: "sender",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "recipient",
            type: "core::starknet::contract_address::ContractAddress",
          },
          {
            name: "amount",
            type: "core::integer::u256",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "external",
      },
    ],
  },
  {
    type: "impl",
    name: "AccessControlMixinImpl",
    interface_name:
      "openzeppelin::access::accesscontrol::interface::AccessControlABI",
  },
  {
    type: "interface",
    name: "openzeppelin::access::accesscontrol::interface::AccessControlABI",
    items: [
      {
        type: "function",
        name: "has_role",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "get_role_admin",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "grant_role",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "revoke_role",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "renounce_role",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "hasRole",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "getRoleAdmin",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::felt252",
          },
        ],
        state_mutability: "view",
      },
      {
        type: "function",
        name: "grantRole",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "revokeRole",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "renounceRole",
        inputs: [
          {
            name: "role",
            type: "core::felt252",
          },
          {
            name: "account",
            type: "core::starknet::contract_address::ContractAddress",
          },
        ],
        outputs: [],
        state_mutability: "external",
      },
      {
        type: "function",
        name: "supports_interface",
        inputs: [
          {
            name: "interface_id",
            type: "core::felt252",
          },
        ],
        outputs: [
          {
            type: "core::bool",
          },
        ],
        state_mutability: "view",
      },
    ],
  },
  {
    type: "constructor",
    name: "constructor",
    inputs: [
      {
        name: "default_admin",
        type: "core::starknet::contract_address::ContractAddress",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Transfer",
    kind: "struct",
    members: [
      {
        name: "from",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "to",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Approval",
    kind: "struct",
    members: [
      {
        name: "owner",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "spender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "key",
      },
      {
        name: "value",
        type: "core::integer::u256",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::token::erc20::erc20::ERC20Component::Event",
    kind: "enum",
    variants: [
      {
        name: "Transfer",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Transfer",
        kind: "nested",
      },
      {
        name: "Approval",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Approval",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
    kind: "struct",
    members: [
      {
        name: "role",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      {
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
    kind: "struct",
    members: [
      {
        name: "role",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "account",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
      {
        name: "sender",
        type: "core::starknet::contract_address::ContractAddress",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
    kind: "struct",
    members: [
      {
        name: "role",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "previous_admin_role",
        type: "core::felt252",
        kind: "data",
      },
      {
        name: "new_admin_role",
        type: "core::felt252",
        kind: "data",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::Event",
    kind: "enum",
    variants: [
      {
        name: "RoleGranted",
        type: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::RoleGranted",
        kind: "nested",
      },
      {
        name: "RoleRevoked",
        type: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::RoleRevoked",
        kind: "nested",
      },
      {
        name: "RoleAdminChanged",
        type: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::RoleAdminChanged",
        kind: "nested",
      },
    ],
  },
  {
    type: "event",
    name: "openzeppelin::introspection::src5::SRC5Component::Event",
    kind: "enum",
    variants: [],
  },
  {
    type: "event",
    name: "contracts::GizaWeatherGame::GizaWeatherGame::Event",
    kind: "enum",
    variants: [
      {
        name: "ERC20Event",
        type: "openzeppelin::token::erc20::erc20::ERC20Component::Event",
        kind: "flat",
      },
      {
        name: "AccessControlEvent",
        type: "openzeppelin::access::accesscontrol::accesscontrol::AccessControlComponent::Event",
        kind: "flat",
      },
      {
        name: "SRC5Event",
        type: "openzeppelin::introspection::src5::SRC5Component::Event",
        kind: "flat",
      },
    ],
  },
];

type Round = {
  roundId: number;
  startTimestamp: number;
  durationTimestamp: number;
  endTimestamp: number;
  betAward: number;
  isOver: boolean;
  isRain: boolean;
};

type Bet = {
  isParticipated: boolean;
  isBetRain: boolean;
  isOver: boolean;
};

type PlaceBetParams = {
  roundId: number;
  prediction: boolean;
};

const Prediction: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { chain } = useNetwork();
  const { address: owner } = useAccount();
  const [rounds, setRounds] = useState<Round[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);

  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const currentRound = rounds[currentRoundIndex];
  const currentBet = bets[currentRoundIndex];
  const [animating, setAnimating] = useState(false);

  const gwgContractAddress =
    "0x02080d031fe3e46b4b4d3b7236e62021ec9d4adea303ce741141a79874e0ac03";

  const [queryRoundIds, setQueryRoundIds] = useState([6, 5, 2, 3, 4]);

  const { data: roundsData } = useContractRead({
    address: gwgContractAddress,
    abi: GWGABI,
    functionName: "get_rounds",
    args: [queryRoundIds],
    watch: true,
    blockIdentifier: "pending" as BlockNumber,
  });

  const { data: betsData } = useContractRead({
    address: gwgContractAddress,
    abi: GWGABI,
    functionName: "get_bets",
    args: [owner as string, queryRoundIds],
    watch: true,
    blockIdentifier: "pending" as BlockNumber,
  });

  useEffect(() => {
    if (roundsData && Array.isArray(roundsData)) {
      const parseData = (roundsData as any[]).map((round) => ({
        roundId: Number(round.round_id),
        startTimestamp: Number(round.start_timestamp),
        durationTimestamp: Number(round.duration_timestamp),
        endTimestamp: Number(round.end_timestamp),
        betAward: Number(round.bet_award),
        isOver: round.is_over,
        isRain: round.is_rain,
      }));
      setRounds(parseData as Round[]);
      console.log(parseData);
    }
  }, [roundsData]);

  useEffect(() => {
    if (betsData && Array.isArray(betsData)) {
      const parseData = (betsData as any[]).map((bet) => ({
        isParticipated: bet.is_participated,
        isBetRain: bet.is_bet_rain,
        isOver: bet.is_over,
      }));
      setBets(parseData as Bet[]);
      console.log(parseData);
    }
  }, [betsData]);

  //////////////////////  write

  const { contract } = useContract({
    abi: GWGABI,
    address: gwgContractAddress,
  });

  const callPlaceBetSun = useMemo(() => {
    if (!currentRoundIndex || !contract) return [];
    return contract.populateTransaction["place_bet"]!(
      currentRound.roundId,
      false,
    );
  }, [contract, currentRoundIndex, currentRound]);

  const { writeAsync: placeBetSun } = useContractWrite({
    calls: callPlaceBetSun,
  });

  const callPlaceBetRain = useMemo(() => {
    if (!currentRoundIndex || !contract) return [];
    return contract.populateTransaction["place_bet"]!(
      currentRound.roundId,
      true,
    );
  }, [contract, currentRoundIndex, currentRound]);

  const { writeAsync: placeBetRain } = useContractWrite({
    calls: callPlaceBetRain,
  });

  const callClaimReward = useMemo(() => {
    if (!currentRoundIndex || !contract) return [];
    return contract.populateTransaction["claim_reward"]!(currentRound.roundId);
  }, [contract, currentRoundIndex, currentRound]);

  const { writeAsync: claimReward } = useContractWrite({
    calls: callClaimReward,
  });

  ////////////////////////
  const handlePrevious = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentRoundIndex((prevIndex) =>
        prevIndex === 0 ? rounds.length - 1 : prevIndex - 1,
      );
      setAnimating(false);
    }, 200);
  };

  const handleNext = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentRoundIndex((prevIndex) =>
        prevIndex === rounds.length - 1 ? 0 : prevIndex + 1,
      );
      setAnimating(false);
    }, 200);
  };

  const renderIcons = () => {
    const icons = [];
    if (!currentRound.isOver) {
      for (let i = 0; i < 5; i++) {
        icons.push(
          <FontAwesomeIcon
            key={i}
            icon={faCircleQuestion}
            className="text-white mx-1"
          />,
        );
      }
    } else {
      const icon = currentRound.isRain ? faCloudRain : faSun;
      for (let i = 0; i < 5; i++) {
        icons.push(
          <FontAwesomeIcon key={i} icon={icon} className="text-white mx-1" />,
        );
      }
    }
    return icons;
  };

  useEffect(() => {
    setIsMounted(true);
  }, [chain, owner]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center pt-20">
      {/* <div className='pb-20'>
        <div className='flex justify-center items-center'>
          <Image
            src="/logo.png"
            alt="logo"
            width={300}
            height={300}
          />
        </div>
        <div className='text-2xl font-semibold border-b-2'>
          Powered By Giza
        </div>
      </div> */}

      {rounds.length > 0 ? (
        <div className="flex flex-col items-center justify-center mt-8">
          <div className="flex items-center justify-center">
            <button onClick={handlePrevious} className="p-2 text-5xl">
              <FontAwesomeIcon icon={faCaretLeft} />
            </button>
            <div
              className={`bg-gray-900 border-2 p-4 m-2 w-96 shadow-lg transform transition-transform duration-200 ${animating ? "opacity-30" : "opacity-100"} text-center`}
            >
              <h3 className="text-xl font-bold mb-2 text-white pt-5">
                Round{" "}
                {new Date(
                  currentRound.endTimestamp * 1000,
                ).toLocaleDateString()}
              </h3>
              <p className="text-white pt-5">{"Location: Los Angeles"}</p>
              <p className="text-white">
                Start Time:{" "}
                {new Date(currentRound.startTimestamp * 1000).toLocaleString()}
              </p>
              <p className="text-white">
                End Time:{" "}
                {new Date(currentRound.endTimestamp * 1000).toLocaleString()}
              </p>

              <div className="flex justify-between mt-4 space-x-2 pt-10">
                <button
                  onClick={() => placeBetSun()}
                  disabled={currentRound.isOver}
                  className={`text-white border-2 p-2 w-full flex justify-center space-x-3 items-center h-10 ${currentBet?.isParticipated && !currentBet?.isBetRain ? "bg-gray-700" : ""}`}
                >
                  <FontAwesomeIcon icon={faSun} />
                  <p className="text-white">{currentRound.betAward}</p>
                </button>
                <button
                  onClick={() => placeBetRain()}
                  disabled={currentRound.isOver}
                  className={`text-white border-2 p-2 w-full flex justify-center space-x-3 items-center h-10 ${currentBet?.isParticipated && currentBet?.isBetRain ? "bg-gray-700" : ""}`}
                >
                  <FontAwesomeIcon icon={faCloudRain} />
                  <p className="text-white">{100 - currentRound.betAward}</p>
                </button>
              </div>

              <div className="flex justify-center mt-4">
                <button
                  onClick={() => claimReward()}
                  disabled={
                    currentBet?.isOver ||
                    currentRound.isRain !== currentBet?.isBetRain
                  }
                  className={`border-2 text-white p-2 max-w-full w-full flex justify-center space-x-3 items-center h-10 ${currentBet?.isOver ? "bg-gray-700 text-black cursor-not-allowed" : "bg-gray-900"}`}
                >
                  {renderIcons()}
                </button>
              </div>
            </div>
            <button onClick={handleNext} className="p-2 text-5xl">
              <FontAwesomeIcon icon={faCaretRight} />
            </button>
          </div>
        </div>
      ) : (
        <div className="text-2xl font-semibold">Loading...</div>
      )}
    </div>
  );
};

export default Prediction;
