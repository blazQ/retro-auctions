#!/bin/bash

# 1. Esegui la migrazione con reset
echo "Eseguendo truffle migrate --reset..."
truffle migrate --reset

# 2. Esegui i test con Truffle
echo "Eseguendo truffle test..."
truffle test

# 3. Copia i file .json da ./build/contracts a ./dapp/src/artifacts
echo "Copia dei file .json da ./build/contracts a ./dapp/src/artifacts..."
mkdir -p dapp/src/artifacts
cp build/contracts/*.json dapp/src/artifacts/

# 4. Avvia l'applicazione React
echo "Avviando npm start..."
cd dapp
npm start
