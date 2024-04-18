import React, {useState, useEffect} from 'react';
import {ethers} from 'ethers';
import constants from './constants';


function PickWinner() {
    const [owner, setOwner] = useState('');
    const [contractInstance, setcontractInstance] = useState('');
    const [currentAccount, setCurrentAccount] = useState('');
    const [isOwnerConnected, setisOwnerConnected] = useState(false);
    const [winner, setWinner] = useState('');
    const [status, setStatus] = useState(false);

    useEffect(() => {
        const loadBlockchainData = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Request account access if needed
                    await window.ethereum.request({ method: 'eth_requestAccounts' });

                    // Get the current account
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    const address = accounts[0];
                    // console.log("Address:", address);
                    setCurrentAccount(address);

                    // Listen for account changes
                    window.ethereum.on('accountsChanged', (newAccounts) => {
                        const newAddress = newAccounts[0];
                        // console.log("New Address:", newAddress);
                        setCurrentAccount(newAddress);
                    });
                } catch (error) {
                    console.error(error);
                }
            } else {
                alert('Please install Metamask to use this application');
            }
        };

        const contract = async () => {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contractIns = new ethers.Contract(constants.contractAddress, constants.contractAbi, signer);
            setcontractInstance(contractIns);
            const status = await contractInstance.isComplete();
            setStatus(status);
            console.log(status);
            const winner = await contractInstance.getWinner();
            console.log(winner);
            setWinner(winner);
            const manager = await contractInstance.getManager();
            setOwner(manager);
            // console.log("manager"+manager);
            // console.log("currentAccount"+currentAccount);
            if (manager.toLowerCase() === currentAccount) {
                setisOwnerConnected(true);
                // console.log("hit");
            }
            else {
                setisOwnerConnected(false);
                // console.log("miss");
            }
        }

        loadBlockchainData();
        contract();
    }, [currentAccount]);


    const pickWinner = async () => {
        const tx = await contractInstance.pickWinner();
        await tx.wait();
    }

    return (
        <div className='container'>
            <h1>Result Page</h1>
            {console.log("ownerconnected ?"+isOwnerConnected)}
            <div className='button-container'>
                 {status ? (<p>Lottery Winner is : {winner}</p>) : 
                 ( isOwnerConnected ? (<button className="enter-button" onClick={pickWinner}> Pick Winner </button>) : 
                 (<p>You are not the owner</p>))

                 }
            </div>
        </div>
    )

}

export default PickWinner;