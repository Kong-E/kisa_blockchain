import React, { useState, useEffect } from "react";
import Web3 from "web3";

const tokenAddress = "0xdD6B735216B6F4236cC0aDf016Af5F07C8F4C0Cd";
const tokenABI = require("./token.json");

const defiAddress = "0xF6b691567bc05b70Ff8D51A1C8b83Ff83D75eBFA";
const defiABI = require("./defi.json");

const Defi = () => {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [contractBalance, setContractBalance] = useState(null);
  const [amount, setAmount] = useState(null);
  const [eventToken, setEventToken] = useState(null);
  const [eventDefi, setEventDefi] = useState(null);

  const listenEventToken = async () => {
    if (eventToken) {
      eventToken.unsubscribe();
    }
    const contract = new web3.eth.Contract(tokenABI, tokenAddress);

    const eventName = "Approval";

    const event = contract.events[eventName]({
      fromBlock: "latest",
    }).on("data", (event) => {
      alert("이벤트 발생");
      clickDeposit();
    });

    setEventToken(event);
  };

  const listenEventDefi = async () => {
    if (eventDefi) {
      eventDefi.unsubscribe();
    }
    const contract = new web3.eth.Contract(defiABI, defiAddress);

    const event = contract.events[("deposit", "withdraw")]({
      fromBlock: "latest",
    }).on("data", (event) => {
      alert("contract complete");
      loadBalance();
    });

    setEventDefi(event);
  };

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
      gasLimit: 500000,
      gasPrice: web3.utils.toWei("50", "gwei"),
      data: contract.methods
        .approve(defiAddress, web3.utils.toWei(amount, "ether"))
        .encodeABI(),
    });

    listenEventToken();
  };

  const clickDeposit = async () => {
    const contract = new web3.eth.Contract(defiABI, defiAddress);

    await web3.eth.sendTransaction({
      from: address,
      to: tokenAddress,
      value: web3.utils.toWei(amount, "ether"),
      gasLimit: 500000,
      gasPrice: web3.utils.toWei("50", "gwei"),
      data: contract.methods
        .depositTokens(web3.utils.toWei(amount, "ether"))
        .encodeABI(),
    });

    listenEventDefi();
  };

  const clickWithdraw = async () => {
    const contract = new web3.eth.Contract(defiABI, defiAddress);

    await web3.eth.sendTransaction({
      from: address,
      to: defiAddress,
      value: web3.utils.toWei(amount, "ether"),
      gasLimit: 500000,
      gasPrice: web3.utils.toWei("50", "gwei"),
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
