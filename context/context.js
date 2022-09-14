//Import Dependencies and hooks needed for app
import { createContext, useEffect } from 'react'
import {
  useVote,
  useToken,
  useAddress,
  useMetamask,
  useDisconnect,
} from '@thirdweb-dev/react'
import { VoteType } from '@thirdweb-dev/sdk'
import { ethers } from 'ethers'

export const ApeDaoContext = createContext()
export const ApeDaoProvider = ({ children }) => {

  /*
    Step 1. Get User address using thirdwebs hook
    Step 2. Get Token and vote contract instances using thirdwebs hooks
    Step 3. We need way to connect and disconnect from the dapp. 
  */

  const currentUserAddress = useAddress() // Get the address using thirdwebs convenient hooks

  let vote = useVote('0x568D15b20476c52B9fb867e0254963bA6f5324Cf')
  let token = useToken('0xd8159d289D5f80c7d976d76Abe4ec0c3206e1142')
  let connectWithMetamask = useMetamask();
  let disconnectWallet = useDisconnect();

  useEffect(() => {
    // IIFE (immediately invoked function expression)
    (async () => {
      try {
        const delegation = await token.getDelegationOf(currentUserAddress)
        if (delegation === ethers.constants.AddressZero) {
          await token.delegateTo(currentUserAddress)
        }
      } catch (error) {
        console.log(error.message, 'error 🔥')
      }
    })()
  }, [])

  //Get all the proposals in the contract
  const getAllProposals = async () => {
    const proposals = await vote.getAll()
    console.log(proposals)
    return proposals
  }

  //Check if proposal given is executable
  const isExecutable = async id => {
    const canExecute = await vote.canExecute(id)
    return canExecute
  }

  // Check if the user has voted for the given proposal
  const checkIfVoted = async id => {
    const res = await vote.hasVoted(id, currentUserAddress)
    console.log(res, 'hasVoted')
    return res
  }

  // Create  proposal to mint tokens to the DAO's treasury
  const createProposal = async description => {
    const proposal = await vote.propose(description)
    console.log(proposal)
  }


  //Execute proposal if the proposal is successful
  const executeProposal = async id => {

  }


  //Vote for the proposal and delegate tokens if not already done. 
  const voteFor = async (id, type, reason) => {
    try {
      const delegation = await token.getDelegationOf(currentUserAddress)
      if (delegation === ethers.constants.AddressZero) {
        await token.delegateTo(currentUserAddress)
      }
      let voteType
      if (type === 'Against') {
        voteType = VoteType.Against
      } else if (type === 'For') {
        voteType = VoteType.For
      } else {
        voteType = VoteType.Abstain
      }
      const hasVoted = await checkIfVoted(id)
      if (!hasVoted) {
        await vote.vote(id, voteType, reason)
      } else {
        console.log('Uh oh... Looks like you have already voted for this proposal!')
      }
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <ApeDaoContext.Provider
      value={{
        getAllProposals,
        isExecutable,
        voteFor,
        createProposal,
        currentUserAddress,
        connectWithMetamask,
        disconnectWallet,
        executeProposal,
      }}
    >
      {children}
    </ApeDaoContext.Provider>
  )
}
