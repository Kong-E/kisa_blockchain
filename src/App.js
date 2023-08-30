import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
import { useEffect, useState } from "react";

const contractAddress = "0xd9145CCE52D386f254917e481eB44e9943F39138";
const eventTransferABI = require("./contract/eventTransfer.json");

function App() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  const [block, setBlock] = useState(null);
  const [transaction, setTransaction] = useState(null);

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

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
    const accountFromInfura = await web3.eth.accounts.privateKeyToAccount(
      process.env.REACT_APP_PRIVATE_KEY
    );
    const accountFromMetaMask = await web3.eth.getAccounts();

    // console.log("accountFromInfura : ", accountFromInfura);
    // console.log("accountFromMetaMask : ", accountFromMetaMask);
    setAddress(accountFromInfura.address);

    const balance = await web3.eth.getBalance(accountFromInfura.address);
    const ether = web3.utils.fromWei(balance, "ether");
    setBalance(ether);
  };

  const sendMetamask = async () => {
    await web3.eth.sendTransaction({
      from: address,
      to: receiver,
      value: web3.utils.toWei(amount, "ether"),
    });
    alert(receiver + "로 " + amount + "를 보냈습니다.");
  };

  const sendInfura = async () => {
    const nonce = await web3.eth.getTransactionCount(address);

    const txData = {
      nonce: nonce,
      gasLimit: 21000,
      gasPrice: web3.utils.toWei("10", "gwei"),
      to: receiver,
      from: address,
      value: web3.utils.toWei(amount, "ether"),
    };

    const account = await web3.eth.accounts.privateKeyToAccount(
      process.env.REACT_APP_PRIVATE_KEY
    );
    const signedTx = await account.signTransaction(txData); // 서명
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction); // 전송
  };

  const printObject = (data) => {
    return JSON.stringify(data, (key, value) => {
      return typeof value === "bigint" ? value.toString() : value;
    });
  };

  useEffect(() => {
    const infuraProvider = new Web3.providers.HttpProvider(
      process.env.REACT_APP_INFURA_ENDPOINT
    );

    const metaMaskProvider = window.ethereum;
    window.ethereum.enable();

    const web3Instance = new Web3(infuraProvider);
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
      <div className="App">
        <input
          type="text"
          placeholder="보낼 주소를 입력하세요."
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
        />
        <input
          type="text"
          placeholder="보낼 금액을 입력하세요."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={sendInfura}>전송하기</button>
      </div>
    </>
  );
}

export default App;
