import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
import { useEffect, useState } from "react";

function App() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);
  const [block, setBlock] = useState(null);
  const [transaction, setTransaction] = useState(null);

  const loadTransaction = async () => {
    const transaction = await web3.eth.getTransaction(
      "0xbc6fa9fec2e9892b639561662e62fcc4aecedacb1b7c867b2108d3116550de8c"
    ); // Transaction Hash를 넣어야 함
    console.log("transaction :", transaction);
    setTransaction(transaction);
  };

  const loadBlock = async () => {
    const number = await web3.eth.getBlockNumber();
    const block = await web3.eth.getBlock();
    console.log("number :", number);
    console.log("block :", block);
    setBlock(block);
  };

  const loadBalance = async () => {
    const account = await web3.eth.accounts.privateKeyToAccount(
      process.env.REACT_APP_PRIVATE_KEY
    );
    console.log("account : ", account);
    setAddress(account.address);
    const balance = await web3.eth.getBalance(account.address);
    const ether = web3.utils.fromWei(balance, "ether");
    setBalance(ether);
  };

  const printObject = (data) => {
    return JSON.stringify(data, (key, value) => {
      return typeof value === "bigint" ? value.toString() : value;
    });
  };

  useEffect(() => {
    if (!process.env.REACT_APP_INFURA_ENDPOINT) {
      throw new Error("REACT_APP_INFURA_ENDPOINT not found");
    }
    const provider = new Web3.providers.HttpProvider(
      process.env.REACT_APP_INFURA_ENDPOINT
    );
    const web3Instance = new Web3(provider);
    setWeb3(web3Instance);
  }, []);

  useEffect(() => {
    if (web3) {
      loadBalance();
      loadBlock();
      loadTransaction();
    }
  }, [web3]);

  return (
    <>
      <div className="App">내 지갑주소는 {address}</div>
      <div className="App">보유 코인 : {balance}</div>
      {/* <div className="App">최근 블록 : {printObject(block)}</div>
      <div className="App">트랜잭션 : {printObject(transaction)}</div> */}
    </>
  );
}

export default App;
