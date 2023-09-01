import React, { useState, useEffect } from "react";
import Web3 from "web3";

const tokenAddress = "0xdD6B735216B6F4236cC0aDf016Af5F07C8F4C0Cd";
const tokenABI = require("./token.json");

const defiAddress = "0x1956c7eEb44650ffB3979c36EB0f90877012A802";
const defiABI = require("./defi.json");

const Defi = () => {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contractBalance, setContractBalance] = useState(null);
  const [amount, setAmount] = useState(null);

  const loadBalance = async () => {
    const accounts = await web3.eth.getAccounts();
    setAddress(accounts[0]);

    const contract = new web3.eth.Contract(tokenABI, tokenAddress);
    const tokenBalance = await contract.methods.balanceOf(accounts[0]).call();
    setBalance(web3.utils.fromWei(tokenBalance, "ether"));

    const defiContract = new web3.eth.Contract(defiABI, defiAddress);
    const contractBalance = await defiContract.methods.hasAmount().call();
    setContractBalance(web3.utils.fromWei(contractBalance, "ether"));
  };

  const clickApprove = async () => {
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);

    await web3.eth.sendTransaction({
      from: address,
      to: tokenAddress,
      value: web3.utils.toWei(amount, "ether"),
      data: contract.methods
        .approve(defiAddress, web3.utils.toWei(amount, "ether"))
        .encodeABI(),
    });
  };

  const clickDeposit = async () => {
    const contract = new web3.eth.Contract(defiABI, defiAddress);

    await web3.eth.sendTransaction({
      from: address,
      to: tokenAddress,
      value: web3.utils.toWei(amount, "ether"),
      data: contract.methods
        .depositTokens(web3.utils.toWei(amount, "ether"))
        .encodeABI(),
    });
  };

  const clickWithdraw = async () => {
    const contract = new web3.eth.Contract(defiABI, defiAddress);

    await web3.eth.sendTransaction({
      from: address,
      to: defiAddress,
      value: web3.utils.toWei(amount, "ether"),
      data: contract.methods.withdrawTokens().encodeABI(),
    });
  };

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      window.ethereum.enable();
      setWeb3(web3Instance);
    }
  }, []);

  useEffect(() => {
    if (web3) {
      loadBalance();
    }
  }, [web3]);

  return (
    <>
      <div className="App">지갑주소: {address}</div>
      <div className="App">보유토큰: {balance}</div>
      <div className="App">계약잔액: {contractBalance}</div>

      <div className="App">
        <input
          type="text"
          placeholder="Amount..."
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
          }}
        />
        <button onClick={clickApprove}>Approve</button>
        <button onClick={clickDeposit}>Deposit</button>
        <button onClick={clickWithdraw}>Withdraw</button>
      </div>
    </>
  );
};

export default Defi;
