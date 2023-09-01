import "./App.css";
import Web3 from "web3";
import { useEffect, useState } from "react";

const contractAddress = "0x606B4ae060c7361063B420425ba3a446085F0e0d";
const eventTransferABI = require("./eventTransfer.json");

function App() {
  const [web3, setWeb3] = useState(null);
  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  const [block, setBlock] = useState(null);
  const [transaction, setTransaction] = useState(null);

  const [receiver, setReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const [items, setItems] = useState([]);

  useEffect(() => {
    const infuraProvider = new Web3.providers.HttpProvider(
      process.env.REACT_APP_INFURA_ENDPOINT
    );

    const metaMaskProvider = window.ethereum;
    metaMaskProvider.enable();

    const web3Instance = new Web3(metaMaskProvider);
    setWeb3(web3Instance);
  }, []);

  useEffect(() => {
    if (web3) {
      loadBalance();
      loadBlock();
      loadTransaction();
      listenEvent();
      loadEvent();
    }
  }, [web3]);

  const loadEvent = async () => {
    const number = await web3.eth.getBlockNumber();
    const topic = web3.utils.keccak256("transfer(address,address,uint256)");

    const eventObj = {
      address: contractAddress,
      topics: [topic],
      fromBlock: number - 300n,
      toBlock: "latest",
    };

    const logs = await web3.eth.getPastLogs(eventObj);
    const array = logs.map((log) => {
      const eventData = web3.eth.abi.decodeLog(
        [
          {
            type: "address",
            name: "from",
            indexed: true,
          },
          {
            type: "address",
            name: "to",
            indexed: true,
          },
          {
            type: "uint256",
            name: "value",
          },
        ],
        log.data,
        log.topics.slice(1)
      );
      return eventData;
    });

    console.log("완료된 전송 :", array);
    setItems(array);
  };

  const listenEvent = () => {
    const contract = new web3.eth.Contract(eventTransferABI, contractAddress);

    const eventName = "transfer";

    contract.events[eventName]({
      fromBlock: "latest",
    }).on("data", (event) => {
      setItems((items) => [event.returnValues, ...items]);
      alert("Completed transfer"); // Use console.log instead of alert
    });
  };

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
    // setAddress(accountFromInfura.address);
    setAddress(accountFromMetaMask[0]);

    // const balance = await web3.eth.getBalance(accountFromInfura.address);
    const balance = await web3.eth.getBalance(accountFromMetaMask[0]);
    const ether = web3.utils.fromWei(balance, "ether");
    setBalance(ether);
  };

  const sendMetamask = async () => {
    const contract = new web3.eth.Contract(eventTransferABI, contractAddress);

    await web3.eth.sendTransaction({
      from: address,
      to: contractAddress,
      gasLimit: 21000,
      gasPrice: web3.utils.toWei("10", "gwei"),
      data: contract.methods.sendEther(receiver).encodeABI(),
    });
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
        <button onClick={sendMetamask}>전송하기</button>
      </div>

      <div className="App">
        {items.map((item, index) => {
          return (
            <div key={index}>
              {item.from} =&gt; {item.to} :{" "}
              {web3.utils.fromWei(item.value, "ether")}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default App;
