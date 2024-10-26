import express from 'express';
import bodyParser from 'body-parser';
import Web3 from "web3";
import cors from 'cors';


const app = express();
const corsOptions = {
    origin: '*', // Permitir solicitudes de todos los orígenes (puedes cambiarlo a un dominio específico)
    methods: ['GET', 'POST'], // Métodos permitidos
    allowedHeaders: ['Content-Type'], // Encabezados permitidos
};
app.use(cors(corsOptions)); // Usar las opciones de CORS
app.use(bodyParser.json());

const web3 = new Web3('https://scroll-sepolia.g.alchemy.com/v2/zz_Ld5VDVen_DX-_abTyAeH-4nlFJ22t');

//🔥🔥 do this for your local testing only dont put keys and addresses in production like this 🔥🔥
const contractAddress = "0x43DAFd7494cda7a8a0f6225638a27238C019A4b0" // check contract here  https://sepolia.etherscan.io/token/0xdfd8be0510b140ab9c19f97154df12be445fee2f
const private_key = "ff6f0edc0c164e5ec929ff1b1826e354324ed4e61a2c52150e094bfdd314da90";
const fromAccount = "0x63f91DDCf5b144700d1fcB7AB10b0ECcCd9A5aFa";


const contractAbi = [{"inputs":[{"internalType":"string","name":"_numberRoom","type":"string"}],"name":"changeStatus","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"getAllRentRooms","outputs":[{"components":[{"internalType":"string","name":"cedulaCliente","type":"string"},{"internalType":"string","name":"numberRoom","type":"string"},{"internalType":"string","name":"descripcion","type":"string"},{"internalType":"bool","name":"availableForRent","type":"bool"},{"internalType":"bool","name":"incumplioContrato","type":"bool"}],"internalType":"struct RentARoomContract.RentRoom[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_numberRoom","type":"string"}],"name":"getRoomContract","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"string","name":"","type":"string"},{"internalType":"bool","name":"","type":"bool"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_numberRoom","type":"string"}],"name":"makeRoomAvailable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"numbersRoom","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"_cedulaCliente","type":"string"},{"internalType":"string","name":"_numberRoom","type":"string"}],"name":"registerRent","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"rentRooms","outputs":[{"internalType":"string","name":"cedulaCliente","type":"string"},{"internalType":"string","name":"numberRoom","type":"string"},{"internalType":"string","name":"descripcion","type":"string"},{"internalType":"bool","name":"availableForRent","type":"bool"},{"internalType":"bool","name":"incumplioContrato","type":"bool"}],"stateMutability":"view","type":"function"}]

const contract = new web3.eth.Contract(contractAbi, contractAddress);


async function rentRoom(cedulaCliente, numberRoom) {
    const data = contract.methods.registerRent(cedulaCliente, numberRoom).encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = await web3.eth.estimateGas({ from: fromAccount, to: contractAddress,data: data});
    const transactionObject = { from: fromAccount,to: contractAddress,data: data, gas: estimatedGas,  gasPrice: gasPrice};
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, private_key);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt.transactionHash
}


async function changeStatus(numberRoom) {
    const data = contract.methods.changeStatus(numberRoom).encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = await web3.eth.estimateGas({ from: fromAccount, to: contractAddress,data: data});
    const transactionObject = { from: fromAccount,to: contractAddress,data: data, gas: estimatedGas,  gasPrice: gasPrice};
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, private_key);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt.transactionHash
}

async function makeRoomAvailable(numberRoom) {
    const data = contract.methods.makeRoomAvailable(numberRoom).encodeABI();
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = await web3.eth.estimateGas({ from: fromAccount, to: contractAddress,data: data});
    const transactionObject = { from: fromAccount,to: contractAddress,data: data, gas: estimatedGas,  gasPrice: gasPrice};
    const signedTransaction = await web3.eth.accounts.signTransaction(transactionObject, private_key);
    const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
    return receipt.transactionHash
}




app.post('/api/rent-room', async(req, res) => {
    console.log(req.body)
    const data = await rentRoom(req.body.cedulaCliente, req.body.numberRoom)
    res.json({
        trxhash: data
    });
});

// Endpoint para cambiar el estado de incumplimiento de una habitación
app.post('/api/change-status', async (req, res) => {
    console.log(req.body)
    const data = await changeStatus(req.body.numberRoom)
    res.json({
        trxhash: data
    });
});


// Endpoint para hacer que la habitación esté disponible para renta
app.post('/api/make-room-available', async (req, res) => {
    console.log(req.body)
    const data = await makeRoomAvailable(req.body.numberRoom)
    res.json({
        trxhash: data
    });
});

// Endpoint para obtener un contrato de habitación por su número
app.get('/api/get-room-contract/:numberRoom', async (req, res) => {
    const { numberRoom } = req.params;
    try {
        const contractData = await contract.methods.getRoomContract(numberRoom).call();
        res.json({ status: "success", data: contractData });
    } catch (error) {
        console.error("Error en getRoomContract:", error);
        res.status(500).json({ status: "error", message: "Error ejecutando getRoomContract", details: error.message });
    }
});

// Endpoint para obtener todos los contratos de habitaciones registradas
app.get('/api/get-all-rent-rooms', async (req, res) => {
    try {
        const allRooms = await contract.methods.getAllRentRooms().call();
        res.json({ status: "success", data: allRooms });
    } catch (error) {
        console.error("Error en getAllRentRooms:", error);
        res.status(500).json({ status: "error", message: "Error ejecutando getAllRentRooms", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});