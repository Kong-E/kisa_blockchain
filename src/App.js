import logo from "./logo.svg";
import "./App.css";
import Web3 from "web3";
import { useEffect, useState } from "react";

function App() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  const loadBalance = async () => {
    const account = await web3.eth.accounts.privateKeyToAccount(
      process.env.REACT_APP_PRIVATE_KEY
    );
    setAddress(account.address);
    const balance = await web3.eth.getBalance(account.address);
    const ether = web3.utils.fromWei(balance, "ether");
    setBalance(ether);
  };

  useEffect(() => {
    if (!process.env.REACT_APP_INFURA_ENDPOINT) {
      throw new Error("REACT_APP_INFURA_ENDPOINT not found");
    }
    const web3Instance = new Web3(
      new Web3.providers.HttpProvider(process.env.REACT_APP_INFURA_ENDPOINT)
    );
    setWeb3(web3Instance);
  }, []);

  useEffect(() => {
    if (web3) loadBalance();
  }, [web3]);

  return (
    <>
      <div className="App">내 지갑주소는 {address}</div>
      <div className="App">보유 코인 : {balance}</div>
    </>
  );
}

export default App;
